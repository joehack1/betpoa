
from django.urls import path
from .views import MatchList, BetCreate, MyBets, wallet_view, set_result


urlpatterns = [
path('matches/', MatchList.as_view()),
path('bets/', BetCreate.as_view()),
path('mybets/', MyBets.as_view()),
path('wallet/', wallet_view),
path('admin/set_result/<int:pk>/', set_result),
]