user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bets')
	match = models.ForeignKey(Match, on_delete=models.CASCADE, related_name='bets')
	amount = models.IntegerField()
	choice = models.CharField(max_length=50) # 'home'|'away'|'draw'
	won = models.BooleanField(null=True) # None = pending
	placed_at = models.DateTimeField(auto_now_add=True)


	def __str__(self):
		return f"{self.user.username} - {self.match} - {self.amount}"
=======
class Bet(models.Model):
	user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bets')
	match = models.ForeignKey(Match, on_delete=models.CASCADE, related_name='bets')
	amount = models.IntegerField()
	choice = models.CharField(max_length=50) # 'home'|'away'|'draw'
	won = models.BooleanField(null=True) # None = pending
	placed_at = models.DateTimeField(auto_now_add=True)


	def __str__(self):
		return f"{self.user.username} - {self.match} - {self.amount}"


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
