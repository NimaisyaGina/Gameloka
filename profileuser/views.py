from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
import json
from .models import UserProfile


def login_view(request):
    """View untuk login page"""
    if request.user.is_authenticated:
        return redirect('/')
    
    return render(request, 'profileuser/login.html')


def register_view(request):
    """View untuk register page"""
    if request.user.is_authenticated:
        return redirect('/')
    
    return render(request, 'profileuser/register.html')


@require_http_methods(["POST"])
def api_login(request):
    """API endpoint untuk login"""
    try:
        data = json.loads(request.body)
        email = data.get('email', '').strip()
        password = data.get('password', '')
        
   
        if not email or not password:
            return JsonResponse({
                'status': 'error',
                'message': 'Email dan password harus diisi'
            }, status=400)
    
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return JsonResponse({
                'status': 'error',
                'message': 'Email tidak terdaftar'
            }, status=401)
        
        user = authenticate(request, username=user.username, password=password)
        
        if user is not None:
            login(request, user)
            return JsonResponse({
                'status': 'success',
                'message': 'Login berhasil',
                'redirect': '/'
            })
        else:
            return JsonResponse({
                'status': 'error',
                'message': 'Email atau password salah'
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
        email = data.get('email', '').strip()
        password = data.get('password', '')
        confirm_password = data.get('confirm_password', '')
        
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
        
        if User.objects.filter(email=email).exists():
            return JsonResponse({
                'status': 'error',
                'message': 'Email sudah terdaftar'
            }, status=400)
        
     
        username = email.split('@')[0] 
        
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
            'redirect': '/'
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
    profile = request.user.profile
    return render(request, 'profileuser/profile.html', {
        'profile': profile
    })

