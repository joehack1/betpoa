from rest_framework import generics, permissions
from .models import Match, Bet, Wallet
from .serializers import MatchSerializer, BetSerializer
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
class MatchList(generics.ListAPIView):
    queryset = Match.objects.filter(finished=False).order_by('start_time')
    serializer_class = MatchSerializer
class BetCreate(generics.CreateAPIView):
    serializer_class = BetSerializer
    permission_classes = [IsAuthenticated]
    def perform_create(self, serializer):
        user = self.request.user
        wallet, _ = Wallet.objects.get_or_create(user=user)
        amount = int(self.request.data.get('amount', 0))
        if amount <= 0 or wallet.coins < amount:
            raise Exception('Insufficient coins or invalid amount')
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
@api_view(['POST'])
@permission_classes([IsAdminUser])
def set_result(request, pk):
    match = Match.objects.get(pk=pk)
    result = request.data.get('result')
    match.result = result
    match.finished = True
    match.save()
    for bet in match.bets.all():
        if bet.choice == result:
            bet.won = True
            wallet = Wallet.objects.get(user=bet.user)
            wallet.coins += bet.amount * 2
            wallet.save()
        else:
            bet.won = False
        bet.save()
    return Response({'status':'ok'})
