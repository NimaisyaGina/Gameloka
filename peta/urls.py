from django.urls import path
from . import views

app_name = 'peta'

urlpatterns = [
    # Peta Budaya Map
    path('', views.PetaBudayaMapView.as_view(), name='peta_budaya'),
    
    # Narrative Game
    path('cerita/<str:story_id>/', views.NarrativeGameView.as_view(), name='narrative_game'),
    
    # API Endpoints
    path('api/locations/', views.get_locations_list, name='api_locations_list'),
    path('api/location/<str:location_id>/', views.get_location_details, name='api_location_details'),
    path('api/story/<str:story_id>/', views.get_story_data, name='api_story_data'),
    path('api/story/<str:story_id>/node/<str:node_id>/', views.get_dialog_node, name='api_dialog_node'),
    path('api/story/<str:story_id>/progress/', views.save_story_progress, name='api_save_progress'),
]

