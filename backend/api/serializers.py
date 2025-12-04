from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Match, Bet, Wallet
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id','username','email')
class MatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Match
        fields = '__all__'
class BetSerializer(serializers.ModelSerializer):
    match = MatchSerializer(read_only=True)
    match_id = serializers.PrimaryKeyRelatedField(queryset=Match.objects.all(), write_only=True, source='match')
    class Meta:
        model = Bet
        fields = ('id','user','match','match_id','amount','choice','won','placed_at')
        read_only_fields = ('user','won','placed_at')
class WalletSerializer(serializers.ModelSerializer):
    class Meta:
        model = Wallet
        fields = ('coins',)
