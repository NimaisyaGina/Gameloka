from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.utils.http import url_has_allowed_host_and_scheme
from django.db.models import Sum, Max
import json
from .models import UserProfile


def _get_safe_next_url(request, raw_next):
    """Return a validated local redirect URL or empty string."""
    if not raw_next or not isinstance(raw_next, str):
        return ''
    candidate = raw_next.strip()
    if candidate and url_has_allowed_host_and_scheme(
        url=candidate,
        allowed_hosts={request.get_host()},
        require_https=request.is_secure(),
    ):
        return candidate
    return ''


def login_view(request):
    """View untuk login page"""
    next_url = _get_safe_next_url(request, request.GET.get('next', ''))
    if request.user.is_authenticated:
        return redirect(next_url or '/')

    return render(request, 'profileuser/login.html', {'next_url': next_url})


def register_view(request):
    """View untuk register page"""
    next_url = _get_safe_next_url(request, request.GET.get('next', ''))
    if request.user.is_authenticated:
        return redirect(next_url or '/')

    return render(request, 'profileuser/register.html', {'next_url': next_url})


@require_http_methods(["POST"])
def api_login(request):
    """API endpoint untuk login"""
    try:
        data = json.loads(request.body)
        email = data.get('email', '').strip()
        password = data.get('password', '')
        next_url = _get_safe_next_url(request, data.get('next', '')) or '/'

        if not email or not password:
            return JsonResponse({
                'status': 'error',
                'message': 'Email dan password harus diisi'
            }, status=400)

        user_obj = User.objects.filter(email__iexact=email).first()
        if not user_obj:
            return JsonResponse({
                'status': 'error',
                'message': 'Email tidak terdaftar'
            }, status=401)

        user = authenticate(request, username=user_obj.username, password=password)

        if user is not None:
            login(request, user)
            return JsonResponse({
                'status': 'success',
                'message': 'Login berhasil',
                'redirect': next_url
            })
        else:
            return JsonResponse({
                'status': 'error',
                'message': 'Maaf, email atau password salah'
            }, status=401)

    except json.JSONDecodeError:
        return JsonResponse({
            'status': 'error',
            'message': 'Request format tidak valid'
        }, status=400)
    except Exception as e:
        return JsonResponse({
            'status': 'error',
            'message': f'Terjadi kesalahan: {str(e)}'
        }, status=500)


@require_http_methods(["POST"])
def api_register(request):
    """API endpoint untuk register"""
    try:
        data = json.loads(request.body)
        full_name = data.get('full_name', '').strip()
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        confirm_password = data.get('confirm_password', '')
        next_url = _get_safe_next_url(request, data.get('next', '')) or '/'

        if not full_name:
            return JsonResponse({
                'status': 'error',
                'message': 'Nama lengkap harus diisi'
            }, status=400)

        if not email:
            return JsonResponse({
                'status': 'error',
                'message': 'Email harus diisi'
            }, status=400)

        if not password:
            return JsonResponse({
                'status': 'error',
                'message': 'Password harus diisi'
            }, status=400)

        if len(password) < 8:
            return JsonResponse({
                'status': 'error',
                'message': 'Password minimal 8 karakter'
            }, status=400)

        if password != confirm_password:
            return JsonResponse({
                'status': 'error',
                'message': 'Password dan konfirmasi password tidak cocok'
            }, status=400)

        if User.objects.filter(email__iexact=email).exists():
            return JsonResponse({
                'status': 'error',
                'message': 'Email sudah terdaftar'
            }, status=400)

        username = email.split('@')[0] or 'jawara'
        base_username = username
        counter = 1
        while User.objects.filter(username=username).exists():
            username = f"{base_username}{counter}"
            counter += 1

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=full_name.split()[0] if full_name else ''
        )

        UserProfile.objects.create(
            user=user,
            full_name=full_name
        )

        login(request, user)

        return JsonResponse({
            'status': 'success',
            'message': 'Registrasi berhasil',
            'redirect': next_url
        })

    except json.JSONDecodeError:
        return JsonResponse({
            'status': 'error',
            'message': 'Request format tidak valid'
        }, status=400)
    except Exception as e:
        return JsonResponse({
            'status': 'error',
            'message': f'Terjadi kesalahan: {str(e)}'
        }, status=500)


@require_http_methods(["GET"])
def logout_view(request):
    """View untuk logout"""
    logout(request)
    return redirect('/')


@login_required
def profile_view(request):
    """View untuk halaman profil user"""
    from leaderboard.models import LeaderboardEntry
    from peta.models import StoryProgress
    from cerita.models import CeritaPost

    profile, _ = UserProfile.objects.get_or_create(
        user=request.user,
        defaults={'full_name': request.user.get_full_name() or request.user.username}
    )

    arena_entries = LeaderboardEntry.objects.filter(user=request.user)
    arena_agg = arena_entries.aggregate(total=Sum('score'), best=Max('score'))

    stories_completed = StoryProgress.objects.filter(user=request.user, completed=True).count()
    cerita_count = CeritaPost.objects.filter(author=request.user).count()

    return render(request, 'profileuser/profile.html', {
        'profile': profile,
        'total_score': arena_agg['total'] or 0,
        'best_score': arena_agg['best'] or 0,
        'arena_plays': arena_entries.count(),
        'stories_completed': stories_completed,
        'cerita_count': cerita_count,
    })
