from django.db import models
from django.contrib.auth.models import User
from django.db.models import Sum, Avg, Count, Max
from datetime import timedelta
from django.utils import timezone


class LeaderboardEntry(models.Model):
    """Model untuk menyimpan skor pemain di leaderboard"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='leaderboard_entries')
    score = models.IntegerField()
    game_type = models.CharField(max_length=50, default='Arena Jawara')  
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Leaderboard Entry'
        verbose_name_plural = 'Leaderboard Entries'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['-created_at']),
        ]
    
    def __str__(self):
        return f"{self.user.username} - {self.score} points ({self.game_type})"
    
    @staticmethod
    def get_leaderboard_all_time(limit=None):
        """Dapatkan leaderboard semua waktu - aggregate total score per user"""
        from django.db.models import Sum, Max
        
        
        user_scores = LeaderboardEntry.objects.values('user', 'user__username', 'user__first_name').annotate(
            total_score=Sum('score'),
            latest_entry=Max('created_at')
        ).order_by('-total_score')
        
        result = []
        for entry in user_scores:
            result.append({
                'user': User.objects.get(username=entry['user__username']),
                'score': entry['total_score'],
                'created_at': entry['latest_entry']
            })
        
        if limit:
            result = result[:limit]
        return result
    
    @staticmethod
    def get_leaderboard_weekly(limit=None):
        """Dapatkan leaderboard minggu ini - aggregate score dalam 7 hari terakhir"""
        from django.db.models import Sum, Max
        
        one_week_ago = timezone.now() - timedelta(days=7)
        
        user_scores = LeaderboardEntry.objects.filter(
            created_at__gte=one_week_ago
        ).values('user', 'user__username', 'user__first_name').annotate(
            total_score=Sum('score'),
            latest_entry=Max('created_at')
        ).order_by('-total_score')
        
        result = []
        for entry in user_scores:
            result.append({
                'user': User.objects.get(username=entry['user__username']),
                'score': entry['total_score'],
                'created_at': entry['latest_entry']
            })
        
        if limit:
            result = result[:limit]
        return result
    
    @staticmethod
    def get_leaderboard_daily(limit=None):
        """Dapatkan leaderboard hari ini - aggregate score dalam 24 jam terakhir"""
        from django.db.models import Sum, Max
        
        today = timezone.now().date()
        today_start = timezone.make_aware(timezone.datetime.combine(today, timezone.datetime.min.time()))
        today_end = timezone.make_aware(timezone.datetime.combine(today, timezone.datetime.max.time()))
        
        user_scores = LeaderboardEntry.objects.filter(
            created_at__range=[today_start, today_end]
        ).values('user', 'user__username', 'user__first_name').annotate(
            total_score=Sum('score'),
            latest_entry=Max('created_at')
        ).order_by('-total_score')
        
        result = []
        for entry in user_scores:
            result.append({
                'user': User.objects.get(username=entry['user__username']),
                'score': entry['total_score'],
                'created_at': entry['latest_entry']
            })
        
        if limit:
            result = result[:limit]
        return result
    
    @staticmethod
    def get_statistics(period='all-time'):
        """Dapatkan statistik leaderboard berdasarkan periode"""
        if period == 'weekly':
            one_week_ago = timezone.now() - timedelta(days=7)
            entries = LeaderboardEntry.objects.filter(created_at__gte=one_week_ago)
        elif period == 'daily':
            today = timezone.now().date()
            today_start = timezone.make_aware(timezone.datetime.combine(today, timezone.datetime.min.time()))
            today_end = timezone.make_aware(timezone.datetime.combine(today, timezone.datetime.max.time()))
            entries = LeaderboardEntry.objects.filter(created_at__range=[today_start, today_end])
        else:
            entries = LeaderboardEntry.objects.all()
        
        unique_users = entries.values('user').distinct().count()
        
        if entries.exists():
            max_score = entries.aggregate(Max('score'))['score__max']
            avg_score = entries.aggregate(Avg('score'))['score__avg']
        else:
            max_score = 0
            avg_score = 0
        
        return {
            'total_players': unique_users,
            'highest_score': max_score or 0,
            'average_score': round(avg_score or 0, 2)
        }