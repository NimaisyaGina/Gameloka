from django.shortcuts import render
from django.views.generic import TemplateView
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods


class HomePageView(TemplateView):
    """View untuk menampilkan halaman beranda Gameloka"""
    template_name = 'home.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['features'] = [
            {
                'id': 'arena',
                'title': 'Arena Jawara',
                'description': 'Uji kemampuan bahasa Betawi dengan kuis interaktif',
                'emoji': '🥋',
                'color': '#C0392B',
                'icon': 'zap'
            },
            {
                'id': 'leaderboard',
                'title': 'Leaderboard',
                'description': 'Lihat peringkat para jawara bahasa Betawi',
                'emoji': '🏆',
                'color': '#F1C40F',
                'icon': 'trophy'
            },
            {
                'id': 'kompas',
                'title': 'Kompas Belajar',
                'description': 'Panduan lengkap belajar bahasa dari dasar',
                'emoji': '🧭',
                'color': '#27AE60',
                'icon': 'compass'
            },
            {
                'id': 'pustaka',
                'title': 'Pustaka Belajar',
                'description': 'Kumpulan artikel tentang budaya Betawi',
                'emoji': '📚',
                'color': '#2980B9',
                'icon': 'book'
            },
            {
                'id': 'cerita',
                'title': 'Cerita Kami',
                'description': 'Berbagi pengalaman belajar bersama komunitas',
                'emoji': '💬',
                'color': '#C0392B',
                'icon': 'message-square'
            }
        ]
        
        context['stats'] = [
            {'count': '500+', 'label': 'Kosakata'},
            {'count': '50+', 'label': 'Pelajaran'},
            {'count': '1K+', 'label': 'Pengguna'}
        ]
        
        return context


# Alias untuk kompatibilitas
home_view = HomePageView.as_view()
