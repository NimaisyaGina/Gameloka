from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
import json
from .models import LeaderboardEntry
from profileuser.models import UserProfile


def leaderboard_view(request):
    """View untuk halaman leaderboard"""
   
    stats = LeaderboardEntry.get_statistics('all-time')
    

    all_time_data = LeaderboardEntry.get_leaderboard_all_time()
    all_time_leaderboard = format_leaderboard_data(all_time_data)
   
    weekly_data = LeaderboardEntry.get_leaderboard_weekly()
    weekly_leaderboard = format_leaderboard_data(weekly_data)
    
    daily_data = LeaderboardEntry.get_leaderboard_daily()
    daily_leaderboard = format_leaderboard_data(daily_data)
    
   
    weekly_stats = LeaderboardEntry.get_statistics('weekly')
    daily_stats = LeaderboardEntry.get_statistics('daily')
    
    context = {
        'stats': stats,
        'weekly_stats': weekly_stats,
        'daily_stats': daily_stats,
        'all_time_leaderboard': all_time_leaderboard,
        'weekly_leaderboard': weekly_leaderboard,
        'daily_leaderboard': daily_leaderboard,
        'all_time_json': json.dumps(all_time_leaderboard),
        'weekly_json': json.dumps(weekly_leaderboard),
        'daily_json': json.dumps(daily_leaderboard),
    }
    
    return render(request, 'leaderboard/leaderboard.html', context)


@require_http_methods(["GET"])
def get_leaderboard(request):
    """API endpoint untuk dapatkan leaderboard berdasarkan periode"""
    period = request.GET.get('period', 'all-time')
    
    try:
        if period == 'weekly':
            data = LeaderboardEntry.get_leaderboard_weekly()
            stats = LeaderboardEntry.get_statistics('weekly')
        elif period == 'daily':
            data = LeaderboardEntry.get_leaderboard_daily()
            stats = LeaderboardEntry.get_statistics('daily')
        else: 
            data = LeaderboardEntry.get_leaderboard_all_time()
            stats = LeaderboardEntry.get_statistics('all-time')
        
        leaderboard = format_leaderboard_data(data)
        
        return JsonResponse({
            'status': 'success',
            'data': leaderboard,
            'stats': stats
        })
    
    except Exception as e:
        return JsonResponse({
            'status': 'error',
            'message': str(e)
        }, status=500)


@require_http_methods(["POST"])
@csrf_exempt
def add_score(request):
    """API endpoint untuk menambah skor ke leaderboard (dari Arena Jawara)"""
    try:
        data = json.loads(request.body)
        user_id = data.get('user_id')
        score = data.get('score')
        game_type = data.get('game_type', 'Arena Jawara')
        
        if not user_id or not score:
            return JsonResponse({
                'status': 'error',
                'message': 'user_id dan score harus diisi'
            }, status=400)
        
      
        from django.contrib.auth.models import User
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return JsonResponse({
                'status': 'error',
                'message': 'User tidak ditemukan'
            }, status=404)
        
        entry = LeaderboardEntry.objects.create(
            user=user,
            score=int(score),
            game_type=game_type
        )
        
        return JsonResponse({
            'status': 'success',
            'message': 'Skor berhasil ditambahkan',
            'entry_id': entry.id
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


def format_leaderboard_data(raw_data):
    """Format data leaderboard dengan rank dan emoji"""
    emojis = ['👨‍🎓', '👩‍🎓', '👨', '👩', '🧑', '👧', '👦', '👩‍🦰', '👨‍🦱', '👩‍🦱']
    
    formatted = []
    for idx, entry in enumerate(raw_data):
        user = entry['user']
        try:
            profile = user.profile
        except UserProfile.DoesNotExist:
            profile = None
        
        
        trend = 'same'
        
      
        full_name = ''
        if profile and profile.full_name:
            full_name = profile.full_name
        elif user.first_name:
            full_name = user.first_name
            if user.last_name:
                full_name += f" {user.last_name}"
        else:
            full_name = user.username
        
        formatted.append({
            'rank': idx + 1,
            'name': full_name,
            'username': user.username,
            'score': entry['score'],
            'avatar': emojis[idx % len(emojis)],
            'trend': trend,
            'user_id': user.id
        })
    
    return formatted