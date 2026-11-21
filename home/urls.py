from django.urls import path
from . import views

app_name = 'home'

urlpatterns = [
    path('', views.HomePageView.as_view(), name='index'),
    path('api/ai/chat/', views.ai_chat_api, name='ai_chat'),
]
