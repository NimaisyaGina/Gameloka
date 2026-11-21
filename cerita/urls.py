from django.urls import path
from . import views

app_name = 'cerita'

urlpatterns = [
    path('', views.cerita_view, name='index'),
    path('api/posts/', views.cerita_posts_api, name='posts_api'),
    path('api/posts/<int:post_id>/like/', views.toggle_like_api, name='toggle_like'),
]
