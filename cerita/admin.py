from django.contrib import admin
from .models import CeritaPost


@admin.register(CeritaPost)
class CeritaPostAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'category', 'created_at')
    list_filter = ('category', 'created_at')
    search_fields = ('title', 'content', 'author__username')
