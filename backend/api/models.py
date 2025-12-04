from django.db import models
from django.contrib.auth.models import User


class Match(models.Model):
	SPORT_CHOICES = [('football','Football'), ('basketball','Basketball')]
	home = models.CharField(max_length=100)
	away = models.CharField(max_length=100)
	start_time = models.DateTimeField()
	finished = models.BooleanField(default=False)
	result = models.CharField(max_length=50, blank=True) # e.g. 'home', 'away', 'draw'
	sport = models.CharField(max_length=20, choices=SPORT_CHOICES, default='football')
	home_odds = models.DecimalField(max_digits=5, decimal_places=2, default=2.00)
	draw_odds = models.DecimalField(max_digits=5, decimal_places=2, default=3.00)
	away_odds = models.DecimalField(max_digits=5, decimal_places=2, default=2.00)


	def __str__(self):
		return f"{self.home} vs {self.away}"


class Wallet(models.Model):
	user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='wallet')
	coins = models.IntegerField(default=1000)


class Bet(models.Model):
	user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bets')
	match = models.ForeignKey(Match, on_delete=models.CASCADE, related_name='bets')
	amount = models.IntegerField()
	choice = models.CharField(max_length=50) # 'home'|'away'|'draw'
	won = models.BooleanField(null=True) # None = pending
	placed_at = models.DateTimeField(auto_now_add=True)


	def __str__(self):
		return f"{self.user.username} - {self.match} - {self.amount}"