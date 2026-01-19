from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from django.views.generic import TemplateView, ListView
from django.views.decorators.http import require_http_methods
from django.utils.decorators import method_decorator
from django.contrib.auth.decorators import login_required
from django.db.models import Q
import json

from .models import (
    CultureLocation, 
    NarrativeStory, 
    DialogNode,
    DialogChoice,
    StoryProgress
)


class PetaBudayaMapView(TemplateView):
    """View untuk menampilkan peta budaya Betawi"""
    template_name = 'peta/peta_budaya.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['locations'] = CultureLocation.objects.all()
        context['page_title'] = 'Peta Budaya Betawi'
        context['page_description'] = 'Jelajahi lokasi bersejarah dan budaya Betawi di Jakarta'
        return context


class NarrativeGameView(TemplateView):
    """View untuk menampilkan mini-game naratif interaktif"""
    template_name = 'peta/narrative_game.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        story_id = self.kwargs.get('story_id')
        story = get_object_or_404(NarrativeStory, id=story_id)
        
        context['story'] = story
        context['initial_node'] = story.dialog_nodes.filter(order=0).first()
        
        # Get user progress if logged in
        if self.request.user.is_authenticated:
            progress, created = StoryProgress.objects.get_or_create(
                user=self.request.user,
                story=story
            )
            context['user_progress'] = progress
        
        return context


@require_http_methods(["GET"])
def get_location_details(request, location_id):
    """API endpoint untuk mendapatkan detail lokasi"""
    location = get_object_or_404(CultureLocation, id=location_id)
    
    data = {
        'id': location.id,
        'name': location.name,
        'description': location.description,
        'category': location.get_category_display(),
        'coords': {
            'x': location.coord_x,
            'y': location.coord_y,
        },
        'story': {
            'id': location.story.id if location.story else None,
            'title': location.story.title if location.story else None,
            'character': location.story.main_character if location.story else None,
        } if location.story else None,
        'thumbnail': location.thumbnail.url if location.thumbnail else None,
    }
    
    return JsonResponse(data)

\
@require_http_methods(["GET"])
def get_locations_list(request):
    """API endpoint untuk mendapatkan list semua lokasi"""
    locations = CultureLocation.objects.all()
    
    data = {
        'locations': [
            {
                'id': loc.id,
                'name': loc.name,
                'description': loc.description,
                'category': loc.get_category_display(),
                'coord_x': loc.coord_x,
                'coord_y': loc.coord_y,
                'story': {
                    'id': loc.story.id if loc.story else None,
                    'title': loc.story.title if loc.story else None,
                } if loc.story else None,
                'thumbnail': loc.thumbnail.url if loc.thumbnail else None,
            }
            for loc in locations
        ]
    }
    
    return JsonResponse(data)


@require_http_methods(["GET"])
def get_story_data(request, story_id):
    """API endpoint untuk mendapatkan seluruh data cerita dalam format untuk game engine"""
    story = get_object_or_404(NarrativeStory, id=story_id)
    
    # Build story data with predefined structure
    # This includes NPCs, background, and full dialogue tree
    from django.conf import settings
    
    # Get story configuration from settings or use defaults
    story_configs = getattr(settings, 'NARRATIVE_STORY_CONFIGS', {})
    story_config = story_configs.get(story_id, {})
    
    # Get all dialog nodes in order
    dialog_nodes = story.dialog_nodes.all().order_by('order')
    dialogues = []
    
    for node in dialog_nodes:
        choices = []
        for choice in node.choices.all().order_by('order'):
            # Find the next node index to convert to array index
            try:
                next_node_obj = DialogNode.objects.get(story=story, node_id=choice.next_node)
                next_index = list(dialog_nodes).index(next_node_obj) if next_node_obj in dialog_nodes else len(dialogues)
            except DialogNode.DoesNotExist:
                next_index = len(dialogues)
            
            choices.append({
                'text': choice.text,
                'next': next_index,
            })
        
        # Get next node index if specified
        next_index = None
        if node.next_node:
            try:
                next_node_obj = DialogNode.objects.get(story=story, node_id=node.next_node)
                next_index = list(dialog_nodes).index(next_node_obj) if next_node_obj in dialog_nodes else None
            except DialogNode.DoesNotExist:
                pass
        
        dialogue_data = {
            'speaker': node.character,
            'text': node.text,
        }
        
        if next_index is not None:
            dialogue_data['next'] = next_index
        
        if choices:
            dialogue_data['choices'] = choices
        
        dialogues.append(dialogue_data)
    
    # Get background and NPCs from story config or defaults
    data = {
        'id': story.id,
        'title': story_config.get('title', story.title),
        'background': story_config.get('background', 'linear-gradient(135deg, #27AE60 0%, #2980B9 100%)'),
        'moralMessage': story.moral_message,
        'dialogues': dialogues,
        'npcs': story_config.get('npcs', [
            {'id': 'npc1', 'name': 'Character', 'emoji': '👤', 'x': 400, 'y': 350}
        ]),
        'playCount': story.play_count,
    }
    
    return JsonResponse(data)


@require_http_methods(["GET"])
def get_dialog_node(request, story_id, node_id):
    """API endpoint untuk mendapatkan node dialog tertentu"""
    story = get_object_or_404(NarrativeStory, id=story_id)
    node = get_object_or_404(DialogNode, story=story, node_id=node_id)
    
    choices = []
    for choice in node.choices.all():
        choices.append({
            'text': choice.text,
            'nextNode': choice.next_node,
            'order': choice.order,
        })
    
    data = {
        'nodeId': node.node_id,
        'character': node.character,
        'text': node.text,
        'choices': choices,
        'nextNode': node.next_node,
    }
    
    return JsonResponse(data)


@require_http_methods(["POST"])
def save_story_progress(request, story_id):
    """API endpoint untuk menyimpan progres cerita pengguna"""
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Unauthorized'}, status=401)
    
    story = get_object_or_404(NarrativeStory, id=story_id)
    
    try:
        data = json.loads(request.body)
        node_id = data.get('nodeId')
        duration = data.get('duration', 0)
        completed = data.get('completed', False)
        
        progress, created = StoryProgress.objects.get_or_create(
            user=request.user,
            story=story
        )
        
        # Update progress
        if node_id:
            try:
                node = DialogNode.objects.get(story=story, node_id=node_id)
                progress.current_node = node
            except DialogNode.DoesNotExist:
                pass
        
        progress.times_played += 1 if completed else 0
        progress.completed = completed
        progress.duration_seconds = duration
        progress.save()
        
        # Update story stats
        story.play_count += 1
        story.save()
        
        return JsonResponse({
            'success': True,
            'message': 'Progress saved',
            'progress': {
                'timesPlayed': progress.times_played,
                'completed': progress.completed,
                'duration': progress.duration_seconds,
            }
        })
    
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
