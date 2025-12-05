from django.db import models
from django.contrib.auth.models import User


class Match(models.Model):
    home_team = models.CharField(max_length=100)
    away_team = models.CharField(max_length=100)
    start_time = models.DateTimeField()
    finished = models.BooleanField(default=False)
    home_score = models.IntegerField(null=True, blank=True)
    away_score = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.home_team} vs {self.away_team}"


class Bet(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bets')
    match = models.ForeignKey(Match, on_delete=models.CASCADE, related_name='bets')
    amount = models.IntegerField()
    choice = models.CharField(max_length=50)  # 'home'|'away'|'draw'
    won = models.BooleanField(null=True)  # None = pending
    placed_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.match} - {self.amount}"


class Wallet(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    coins = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.user.username} - {self.coins} coins"


class Transaction(models.Model):
    TRANSACTION_TYPES = [
        ('deposit', 'Deposit'),
        ('withdrawal', 'Withdrawal'),
        ('bet_win', 'Bet Win'),
        ('bet_loss', 'Bet Loss'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='transactions')
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPES)
    amount = models.IntegerField()
    mpesa_receipt_number = models.CharField(max_length=20, blank=True, null=True)
    mpesa_transaction_id = models.CharField(max_length=50, blank=True, null=True)
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    status = models.CharField(max_length=20, default='pending')  # pending, completed, failed
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} - {self.transaction_type} - {self.amount}"
