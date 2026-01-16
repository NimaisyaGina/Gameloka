from django.urls import path
from . import views

urlpatterns = [
    path('', views.arena_view, name='arena'),
    path('api/save-score/', views.save_score_api, name='save_score'),
]
