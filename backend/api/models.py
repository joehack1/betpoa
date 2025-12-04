from django.db import models
from django.contrib.auth.models import User
class Match(models.Model):
    home = models.CharField(max_length=100)
    away = models.CharField(max_length=100)
    start_time = models.DateTimeField()
    finished = models.BooleanField(default=False)
    result = models.CharField(max_length=50, blank=True)
    def __str__(self):
        return f"{self.home} vs {self.away}"
class Wallet(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='wallet')
    coins = models.IntegerField(default=1000)
class Bet(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bets')
    match = models.ForeignKey(Match, on_delete=models.CASCADE, related_name='bets')
    amount = models.IntegerField()
    choice = models.CharField(max_length=50)
    won = models.BooleanField(null=True)
    placed_at = models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return f"{self.user.username} - {self.match} - {self.amount}"
