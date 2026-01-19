from django.db import models
from django.contrib.auth.models import User
import json

class CultureLocation(models.Model):
    """Model untuk lokasi budaya di peta Betawi"""
    CATEGORY_CHOICES = [
        ('pusat_budaya', 'Pusat Budaya'),
        ('tradisi_kuliner', 'Tradisi & Kuliner'),
        ('festival_sejarah', 'Festival & Sejarah'),
    ]
    
    id = models.CharField(max_length=50, primary_key=True)
    name = models.CharField(max_length=200)
    description = models.TextField()
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    
    # Map positioning (percentage-based)
    coord_x = models.FloatField(default=50)
    coord_y = models.FloatField(default=50)
    
    # Story reference
    story = models.ForeignKey('NarrativeStory', on_delete=models.SET_NULL, null=True, blank=True)
    
    # Media
    thumbnail = models.ImageField(upload_to='locations/', null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name_plural = "Culture Locations"
        ordering = ['name']
    
    def __str__(self):
        return self.name


class NarrativeStory(models.Model):
    """Model untuk kisah naratif interaktif"""
    id = models.CharField(max_length=50, primary_key=True)
    title = models.CharField(max_length=200)
    description = models.TextField()
    
    # Karakteristik cerita
    CHARACTER_CHOICES = [
        ('pitung', 'Si Pitung'),
        ('maknani', 'Mak Nani'),
        ('bandudin', 'Bang Udin'),
        ('kampung', 'Kampung'),
    ]
    
    main_character = models.CharField(max_length=20, choices=CHARACTER_CHOICES)
    moral_message = models.TextField(help_text="Pesan moral dari cerita")
    
    # Story stats
    play_count = models.IntegerField(default=0)
    average_duration = models.IntegerField(default=0, help_text="Durasi rata-rata dalam detik")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name_plural = "Narrative Stories"
    
    def __str__(self):
        return self.title


class DialogNode(models.Model):
    """Model untuk node dialog dalam cerita"""
    story = models.ForeignKey(NarrativeStory, on_delete=models.CASCADE, related_name='dialog_nodes')
    node_id = models.CharField(max_length=100)  # Unique identifier within story
    
    # Dialog content
    character = models.CharField(max_length=100, help_text="Nama karakter yang berbicara")
    text = models.TextField(help_text="Teks dialog (gunakan ... untuk jeda berpikir)")
    
    # Navigation
    next_node = models.CharField(max_length=100, null=True, blank=True, help_text="Node ID untuk lanjutan otomatis")
    
    # Positioning in story
    order = models.IntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('story', 'node_id')
        ordering = ['order']
    
    def __str__(self):
        return f"{self.story.title} - {self.node_id}"


class DialogChoice(models.Model):
    """Model untuk pilihan dialog (branching story)"""
    node = models.ForeignKey(DialogNode, on_delete=models.CASCADE, related_name='choices')
    
    text = models.CharField(max_length=255, help_text="Teks pilihan jawaban")
    next_node = models.CharField(max_length=100, help_text="Node ID tujuan")
    
    # Ordering
    order = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['order']
    
    def __str__(self):
        return f"{self.node.story.title} - Choice: {self.text}"


class StoryProgress(models.Model):
    """Model untuk melacak progres pemain dalam cerita"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='story_progress')
    story = models.ForeignKey(NarrativeStory, on_delete=models.CASCADE)
    
    # Current progress
    current_node = models.ForeignKey(DialogNode, on_delete=models.SET_NULL, null=True, blank=True)
    
    # Gameplay stats
    times_played = models.IntegerField(default=0)
    completed = models.BooleanField(default=False)
    duration_seconds = models.IntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('user', 'story')
    
    def __str__(self):
        return f"{self.user.username} - {self.story.title}"
