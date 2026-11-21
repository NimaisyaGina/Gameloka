from django.db import models
from django.contrib.auth.models import User


class CeritaPost(models.Model):
    """Model untuk postingan komunitas Cerita Kami"""
    CATEGORY_CHOICES = [
        ('pengalaman', 'Pengalaman Belajar'),
        ('kosakata', 'Kosakata Favorit'),
        ('budaya', 'Refleksi Budaya'),
        ('pantun', 'Kreasi Pantun'),
    ]

    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='cerita_posts')
    title = models.CharField(max_length=160)
    category = models.CharField(max_length=30, choices=CATEGORY_CHOICES, default='pengalaman')
    content = models.TextField()
    likes = models.ManyToManyField(User, related_name='liked_cerita', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Cerita Post'
        verbose_name_plural = 'Cerita Posts'

    def __str__(self):
        return f"{self.title} ({self.author.username})"
