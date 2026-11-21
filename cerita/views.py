from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.views.decorators.http import require_http_methods
from django.utils.safestring import mark_safe
import json

from .models import CeritaPost


SEED_POSTS = [
    {
        'username': 'fadil_betawi',
        'title': 'Pertama Kali Ngerti Bedanye "Gue", "Ane", ama "Aye"',
        'category': 'kosakata',
        'content': (
            'Awalnya ane kira semua kata ganti "saya" di Betawi cuma "gue" aja. '
            'Pas buka Kompas Belajar dan tanya Bang Buay, baru paham kalau Betawi Tengah sering '
            'pakai "aye" atau "ane" buat ngobrol lebih sopan sama orang tua. Seru banget belajar konteksnya!'
        ),
    },
    {
        'username': 'siti_mariam',
        'title': 'Terinspirasi Ketabahan Si Miskin di Hikayat Marakarma',
        'category': 'budaya',
        'content': (
            'Baru tahu kalau Hikayat Marakarma itu bagian dari khazanah sastra Melayu klasik Betawi '
            'yang disalin Muhammad Bakir! Dari bagian pertama aja kerasa banget pesan moral tentang '
            'sabar, ikhtiar, dan adil saat memimpin Negeri Puspa Sari.'
        ),
    },
    {
        'username': 'budi_santoso',
        'title': 'Jalan-Jalan Virtual ke Setu Babakan Lewat Peta Budaya',
        'category': 'pengalaman',
        'content': (
            'Sebagai pendatang di Jakarta, fitur Peta Budaya bikin ane makin kenal budaya lokal. '
            'Setelah main kisah Si Pitung di Setu Babakan dan Kebijaksanaan Mak Nani di Condet, '
            'jadi pengin nyobain Bir Pletok sama Kerak Telor langsung akhir pekan nanti!'
        ),
    },
    {
        'username': 'dewi_kartika',
        'title': 'Pantun Penyemangat Belajar Bahasa Betawi',
        'category': 'pantun',
        'content': (
            'Ke Kemayoran beli ketupat,\n'
            'Singgah sebentar di rumah Bang Mamat.\n'
            'Belajar Betawi biar makin hebat,\n'
            'Budaya terjaga sepanjang hayat!'
        ),
    },
]


def _ensure_seed_posts(fallback_user=None):
    """Seed authentic community posts once when the board is empty."""
    if CeritaPost.objects.exists():
        return

    for item in SEED_POSTS:
        author = User.objects.filter(username=item['username']).first() or fallback_user
        if author is None:
            author = User.objects.order_by('id').first()
        if author is None:
            continue
        CeritaPost.objects.create(
            author=author,
            title=item['title'],
            category=item['category'],
            content=item['content'],
        )


def _serialize_post(post, current_user):
    author_name = post.author.first_name or post.author.username
    try:
        if hasattr(post.author, 'profile') and post.author.profile.full_name:
            author_name = post.author.profile.full_name
    except Exception:
        pass

    likes_qs = post.likes.all()
    likes_count = likes_qs.count()
    liked = current_user.is_authenticated and likes_qs.filter(id=current_user.id).exists()

    return {
        'id': post.id,
        'title': post.title,
        'category': post.category,
        'category_label': post.get_category_display(),
        'content': post.content,
        'author': author_name,
        'username': post.author.username,
        'likes_count': likes_count,
        'liked': liked,
        'created_at': post.created_at.strftime('%d %b %Y, %H:%M'),
    }


@login_required
def cerita_view(request):
    """View untuk halaman komunitas Cerita Kami"""
    _ensure_seed_posts(fallback_user=request.user)
    posts = CeritaPost.objects.select_related('author').prefetch_related('likes').all()
    serialized = [_serialize_post(p, request.user) for p in posts]

    context = {
        'posts_json': mark_safe(json.dumps(serialized)),
        'categories': CeritaPost.CATEGORY_CHOICES,
    }
    return render(request, 'cerita/cerita.html', context)


@require_http_methods(["GET", "POST"])
def cerita_posts_api(request):
    """API endpoint untuk list & membuat postingan Cerita Kami"""
    if not request.user.is_authenticated:
        return JsonResponse({
            'status': 'error',
            'message': 'Authentication required'
        }, status=401)

    if request.method == 'GET':
        _ensure_seed_posts(fallback_user=request.user)
        posts = CeritaPost.objects.select_related('author').prefetch_related('likes').all()
        category = request.GET.get('category', '').strip()
        if category and category != 'semua':
            posts = posts.filter(category=category)
        return JsonResponse({
            'status': 'success',
            'posts': [_serialize_post(p, request.user) for p in posts]
        })

    try:
        data = json.loads(request.body)
        title = (data.get('title') or '').strip()
        category = (data.get('category') or 'pengalaman').strip()
        content = (data.get('content') or '').strip()

        valid_categories = dict(CeritaPost.CATEGORY_CHOICES)
        if category not in valid_categories:
            category = 'pengalaman'

        if not title or not content:
            return JsonResponse({
                'status': 'error',
                'message': 'Judul dan isi cerita tidak boleh kosong.'
            }, status=400)

        post = CeritaPost.objects.create(
            author=request.user,
            title=title[:160],
            category=category,
            content=content,
        )

        return JsonResponse({
            'status': 'success',
            'message': 'Cerita berhasil dipublikasikan!',
            'post': _serialize_post(post, request.user)
        }, status=201)

    except json.JSONDecodeError:
        return JsonResponse({
            'status': 'error',
            'message': 'Format JSON tidak valid.'
        }, status=400)
    except Exception as e:
        return JsonResponse({
            'status': 'error',
            'message': str(e)
        }, status=500)


@require_http_methods(["POST"])
def toggle_like_api(request, post_id):
    """API endpoint untuk toggle suka pada cerita komunitas"""
    if not request.user.is_authenticated:
        return JsonResponse({
            'status': 'error',
            'message': 'Authentication required'
        }, status=401)

    post = get_object_or_404(CeritaPost, id=post_id)
    if post.likes.filter(id=request.user.id).exists():
        post.likes.remove(request.user)
        liked = False
    else:
        post.likes.add(request.user)
        liked = True

    return JsonResponse({
        'status': 'success',
        'liked': liked,
        'likes_count': post.likes.count(),
    })
