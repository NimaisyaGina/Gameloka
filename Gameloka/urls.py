"""
URL configuration for Gameloka project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.views.decorators.http import require_http_methods
from django.http import JsonResponse
from django.shortcuts import redirect

# Proxy API endpoints from root to peta
@require_http_methods(["GET"])
def proxy_api_story(request, story_id):
    """Proxy requests from /api/story/ to /peta/api/story/"""
    # Redirect to the correct peta API endpoint
    return redirect(f'/peta/api/story/{story_id}/', permanent=False)

@require_http_methods(["GET"])
def proxy_api_dialog_node(request, story_id, node_id):
    """Proxy requests from /api/story/story_id/node/ to /peta/api/story/"""
    return redirect(f'/peta/api/story/{story_id}/node/{node_id}/', permanent=False)

@require_http_methods(["GET", "POST"])
def proxy_api_progress(request, story_id):
    """Proxy requests from /api/story/story_id/progress/ to /peta/api/story/"""
    return redirect(f'/peta/api/story/{story_id}/progress/', permanent=False)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('home.urls')),
    path('arena/', include('arena.urls')),
    path('auth/', include('profileuser.urls')),
    path('kompas/', include('kompas.urls')),
    path('leaderboard/', include('leaderboard.urls')),
    path('pustaka/', include('pustaka.urls')),
    path('peta/', include('peta.urls')),
    
    # API endpoint proxies for backward compatibility
    path('api/story/<str:story_id>/', proxy_api_story, name='api_story_proxy'),
    path('api/story/<str:story_id>/node/<str:node_id>/', proxy_api_dialog_node, name='api_dialog_node_proxy'),
    path('api/story/<str:story_id>/progress/', proxy_api_progress, name='api_progress_proxy'),
]
