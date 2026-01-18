from django.urls import path
from . import views

urlpatterns = [
    path('', views.pustaka_view, name='pustaka'),
    path('api/article/', views.get_article_detail, name='get_article'),
]
