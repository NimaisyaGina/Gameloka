from django.contrib import admin
from .models import (
    CultureLocation,
    NarrativeStory,
    DialogNode,
    DialogChoice,
    StoryProgress
)


@admin.register(CultureLocation)
class CultureLocationAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'category', 'story')
    list_filter = ('category',)
    search_fields = ('name', 'description')
    fieldsets = (
        ('Basic Information', {
            'fields': ('id', 'name', 'description', 'category')
        }),
        ('Map Position', {
            'fields': ('coord_x', 'coord_y'),
            'description': 'Position in percentage (0-100)'
        }),
        ('Media & Story', {
            'fields': ('thumbnail', 'story')
        }),
    )


class DialogChoiceInline(admin.TabularInline):
    model = DialogChoice
    extra = 1
    fields = ('text', 'next_node', 'order')


@admin.register(DialogNode)
class DialogNodeAdmin(admin.ModelAdmin):
    list_display = ('story', 'node_id', 'character', 'order')
    list_filter = ('story',)
    search_fields = ('node_id', 'character', 'text')
    inlines = [DialogChoiceInline]
    fieldsets = (
        ('Story Reference', {
            'fields': ('story', 'node_id')
        }),
        ('Dialog Content', {
            'fields': ('character', 'text')
        }),
        ('Navigation', {
            'fields': ('next_node', 'order')
        }),
    )


@admin.register(NarrativeStory)
class NarrativeStoryAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'main_character', 'play_count')
    list_filter = ('main_character',)
    search_fields = ('title', 'description', 'moral_message')
    fieldsets = (
        ('Basic Information', {
            'fields': ('id', 'title', 'description')
        }),
        ('Story Details', {
            'fields': ('main_character', 'moral_message')
        }),
        ('Statistics', {
            'fields': ('play_count', 'average_duration'),
            'description': 'Automatically updated'
        }),
    )
    readonly_fields = ('play_count', 'average_duration')


@admin.register(StoryProgress)
class StoryProgressAdmin(admin.ModelAdmin):
    list_display = ('user', 'story', 'times_played', 'completed')
    list_filter = ('story', 'completed')
    search_fields = ('user__username', 'story__title')
    fieldsets = (
        ('User & Story', {
            'fields': ('user', 'story')
        }),
        ('Progress', {
            'fields': ('current_node', 'times_played', 'completed')
        }),
        ('Statistics', {
            'fields': ('duration_seconds',)
        }),
    )
    readonly_fields = ('created_at', 'updated_at')
