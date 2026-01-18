from django.urls import path
from . import views

urlpatterns = [
    path('', views.kompas_view, name='kompas'),
    path('api/topic/', views.get_topic_detail, name='get_topic'),
]
