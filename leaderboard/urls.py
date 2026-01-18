from django.urls import path
from . import views

urlpatterns = [
    path('', views.leaderboard_view, name='leaderboard'),
    path('api/get/', views.get_leaderboard, name='get_leaderboard'),
]
