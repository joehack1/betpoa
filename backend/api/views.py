from rest_framework import generics, permissions
from .models import Match, Bet, Wallet
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


# Proxy endpoint to fetch matches from OpenLigaDB
# Example: GET /api/openliga/bl1/2021/  -> fetches https://www.openligadb.de/api/getmatchdata/bl1/2021
@api_view(['GET'])
def openliga_matches(request, league, season):
	base = 'https://www.openligadb.de/api/'
	# Construct target endpoint. We only support getmatchdata for now.
	target = f"{base}getmatchdata/{league}/{season}"
	try:
		resp = requests.get(target, timeout=10)
	except requests.RequestException as e:
		return Response({'error': 'failed to fetch from OpenLigaDB', 'details': str(e)}, status=502)

	if resp.status_code != 200:
		return Response({'error': 'upstream returned error', 'status_code': resp.status_code}, status=resp.status_code)

	try:
		data = resp.json()
	except ValueError:
		return Response({'error': 'invalid json from upstream'}, status=502)

	return Response(data)



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