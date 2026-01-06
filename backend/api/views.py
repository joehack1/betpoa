from rest_framework import generics, permissions
from .models import Match, Bet, Wallet, Transaction
from .serializers import MatchSerializer, BetSerializer, WalletSerializer, UserSerializer
from rest_framework.response import Response
from django.contrib.auth.models import User
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
import requests
from django.conf import settings
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from django.core.cache import cache


class MatchList(generics.ListAPIView):
	queryset = Match.objects.filter(finished=False).order_by('start_time')
	serializer_class = MatchSerializer


class BetCreate(generics.CreateAPIView):
	serializer_class = BetSerializer
	permission_classes = [IsAuthenticated]

	def perform_create(self, serializer):
		user = self.request.user
		wallet = getattr(user, 'wallet', None)
		amount = int(self.request.data.get('amount'))
		if wallet is None or wallet.coins < amount:
			raise Exception('Insufficient coins')
		# deduct coins
		wallet.coins -= amount
		wallet.save()
		serializer.save(user=user)


class MyBets(generics.ListAPIView):
	serializer_class = BetSerializer
	permission_classes = [IsAuthenticated]

	def get_queryset(self):
		return Bet.objects.filter(user=self.request.user).order_by('-placed_at')


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def wallet_view(request):
	wallet, created = Wallet.objects.get_or_create(user=request.user)
	return Response({'coins': wallet.coins})


# Admin endpoint to set result and settle bets
@api_view(['POST'])
@permission_classes([IsAdminUser])
def set_result(request, pk):
	match = Match.objects.get(pk=pk)
	result = request.data.get('result')  # 'home'|'away'|'draw'
	match.result = result
	match.finished = True
	match.save()
	# settle bets
	for bet in match.bets.all():
		if bet.choice == result:
			bet.won = True
			# pay out: simple 2x payout
			wallet = Wallet.objects.get(user=bet.user)
			wallet.coins += bet.amount * 2
			wallet.save()
		else:
			bet.won = False
		bet.save()
	return Response({'status': 'ok'})


# Proxy endpoint to fetch fixtures from TheSportsDB
@api_view(['GET'])
def openliga_matches(request, league, season):
	"""
	Fetch fixtures from TheSportsDB (https://www.thesportsdb.com/api/v1/json/3/).
	- For current/future matches we use `eventsnextleague.php?id=LEAGUE_ID`.
	- For historical season data we try `eventsseason.php?id=LEAGUE_ID&s=SEASON`.

	The `league` param can be either a short code (e.g. 'bl1') or a numeric
	TheSportsDB `idLeague`. If short code is passed we use a small mapping.
	"""
	from datetime import datetime

	base = 'https://www.thesportsdb.com/api/v1/json/3/'

	# Helper: resolve a league parameter to a list of TheSportsDB league ids
	def resolve_league_ids(param):
		# numeric id -> return directly
		try:
			lid = int(param)
			return [lid]
		except Exception:
			pass

		# small short-code map for convenience
		league_map = {
			'bl1': 4331,  # Bundesliga
			'bl2': 4399,  # 2. Bundesliga
			'pl': 4328,   # Premier League
			'la': 4335,   # La Liga
			'sa': 4332,   # Serie A
			'fr': 4334,   # Ligue 1
		}
		if param in league_map:
			return [league_map[param]]

		# special value 'all' -> return all soccer leagues from TheSportsDB
		if param == 'all':
			try:
				all_url = f"{base}all_leagues.php"
				r = requests.get(all_url, timeout=15)
				r.raise_for_status()
				j = r.json()
			except Exception:
				# fallback: try search_all_leagues for Germany (best-effort)
				try:
					r = requests.get(f"{base}search_all_leagues.php?c=Germany", timeout=10)
					r.raise_for_status()
					j = r.json()
				except Exception:
					return []

			leagues = j.get('leagues') or j.get('countries') or []
			ids = []
			for L in leagues:
				if (L.get('strSport') or '').lower() == 'soccer':
					try:
						ids.append(int(L.get('idLeague')))
					except Exception:
						continue
			return ids

		# otherwise, do a fuzzy search across all leagues: fetch list and match substring
		try:
			r = requests.get(f"{base}all_leagues.php", timeout=15)
			r.raise_for_status()
			j = r.json()
			leagues = j.get('leagues') or j.get('countries') or []
		except Exception:
			leagues = []

		matches = []
		key = param.lower()
		for L in leagues:
			name = (L.get('strLeague') or '').lower()
			idapi = (L.get('idAPIfootball') or '')
			if key in name or key == str(L.get('idLeague')) or key == str(idapi):
				try:
					matches.append(int(L.get('idLeague')))
				except Exception:
					continue
		return matches

	# resolve league(s)
	league_ids = resolve_league_ids(league)
	if not league_ids:
		return Response({'error': f'unsupported or unknown league: {league}. Try an exact league name, short code, or TheSportsDB id.'}, status=400)

	# parse season/year param
	try:
		season_year = int(season)
	except Exception:
		season_year = None

	now = datetime.now()
	aggregated = []
	seen = set()

	# Try cache first (cache key includes league param and season)
	cache_key = f"thesportsdb:{league}:{season}"
	cached = cache.get(cache_key)
	if cached is not None:
		return Response(cached)

	# if asking for matches from December 2025 onward, create a start filter
	start_filter = None
	try:
		if season_year and season_year >= 2025:
			start_filter = datetime(season_year, 12, 1)
	except Exception:
		start_filter = None

	for lid in league_ids:
		# pick endpoint
		if season_year is None or season_year >= now.year:
			endpoint = f"{base}eventsnextleague.php"
			params = {'id': lid}
		else:
			season_str = f"{season}-{int(season) + 1}"
			endpoint = f"{base}eventsseason.php"
			params = {'id': lid, 's': season_str}

		try:
			r = requests.get(endpoint, params=params, timeout=10)
			if r.status_code != 200:
				continue
			dj = r.json()
		except Exception:
			continue

		events = dj.get('events') or []
		for ev in events:
			# filter by date if requested
			if start_filter:
				date_str = ev.get('dateEvent') or ev.get('strTimestamp')
				try:
					ev_date = datetime.fromisoformat(date_str)
				except Exception:
					try:
						ev_date = datetime.strptime(date_str, '%Y-%m-%d')
					except Exception:
						ev_date = None
				if ev_date and ev_date < start_filter:
					continue

			eid = ev.get('idEvent') or ev.get('id')
			if eid and eid in seen:
				continue
			if eid:
				seen.add(eid)
			aggregated.append(ev)

	result = {'response': aggregated, 'source': 'thesportsdb'}
	# store in cache for short TTL (5 minutes)
	try:
		cache.set(cache_key, result, 300)
	except Exception:
		pass
	return Response(result)



@api_view(['POST'])
def register(request):
	"""Create a new user and return JWT tokens."""
	username = request.data.get('username')
	email = request.data.get('email')
	password = request.data.get('password')

	if not username or not password:
		return Response({'error': 'username and password required'}, status=status.HTTP_400_BAD_REQUEST)

	if User.objects.filter(username=username).exists():
		return Response({'error': 'username already exists'}, status=status.HTTP_400_BAD_REQUEST)

	user = User.objects.create_user(username=username, email=email, password=password)
	# create wallet if model present
	try:
		from .models import Wallet
		Wallet.objects.create(user=user)
	except Exception:
		pass

	refresh = RefreshToken.for_user(user)
	return Response({'refresh': str(refresh), 'access': str(refresh.access_token)})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
	"""Return current user info and wallet balance."""
	user = request.user
	try:
		wallet = Wallet.objects.get(user=user)
		coins = wallet.coins
	except Exception:
		coins = 0
	return Response({'username': user.username, 'email': user.email, 'coins': coins})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mpesa_deposit(request):
	amount = request.data.get('amount')
	phone_number = request.data.get('phone_number')
	if not amount or not phone_number:
		return Response({'error': 'Amount and phone number required'}, status=400)
	# Create transaction record
	transaction = Transaction.objects.create(
		user=request.user,
		transaction_type='deposit',
		amount=amount,
		phone_number=phone_number,
		status='pending'
	)
	# TODO: Integrate with actual M-Pesa API
	return Response({'message': 'Deposit initiated', 'transaction_id': transaction.id})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mpesa_withdraw(request):
	amount = request.data.get('amount')
	if not amount:
		return Response({'error': 'Amount required'}, status=400)
	wallet = Wallet.objects.get(user=request.user)
	if wallet.coins < int(amount):
		return Response({'error': 'Insufficient balance'}, status=400)
	# Deduct coins immediately
	wallet.coins -= int(amount)
	wallet.save()
	# Create transaction record
	transaction = Transaction.objects.create(
		user=request.user,
		transaction_type='withdrawal',
		amount=amount,
		status='pending'
	)
	# TODO: Integrate with actual M-Pesa API
	return Response({'message': 'Withdrawal initiated', 'transaction_id': transaction.id})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def mpesa_transactions(request):
	transactions = Transaction.objects.filter(user=request.user).order_by('-created_at')
	serializer = TransactionSerializer(transactions, many=True)
	return Response(serializer.data)
