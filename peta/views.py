from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from django.views.generic import TemplateView
from django.views.decorators.http import require_http_methods
from django.utils.decorators import method_decorator
from django.contrib.auth.decorators import login_required
import json

from .models import (
    CultureLocation,
    NarrativeStory,
    DialogNode,
    StoryProgress
)


@method_decorator(login_required, name='dispatch')
class PetaBudayaMapView(TemplateView):
    """View untuk menampilkan peta budaya Betawi"""
    template_name = 'peta/peta_budaya.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['locations'] = CultureLocation.objects.all()
        context['page_title'] = 'Peta Budaya Betawi'
        context['page_description'] = 'Jelajahi lokasi bersejarah dan budaya Betawi di Jakarta'
        return context


@method_decorator(login_required, name='dispatch')
class NarrativeGameView(TemplateView):
    """View untuk menampilkan mini-game naratif interaktif"""
    template_name = 'peta/narrative_game.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        story_id = self.kwargs.get('story_id')
        story = get_object_or_404(NarrativeStory, id=story_id)

        context['story'] = story
        context['initial_node'] = story.dialog_nodes.filter(order=0).first()

        if self.request.user.is_authenticated:
            progress, _ = StoryProgress.objects.get_or_create(
                user=self.request.user,
                story=story
            )
            context['user_progress'] = progress

        return context


@require_http_methods(["GET"])
def get_location_details(request, location_id):
    """API endpoint untuk mendapatkan detail lokasi"""
    if not request.user.is_authenticated:
        return JsonResponse({'status': 'error', 'message': 'Authentication required'}, status=401)

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


@require_http_methods(["GET"])
def get_locations_list(request):
    """API endpoint untuk mendapatkan list semua lokasi"""
    if not request.user.is_authenticated:
        return JsonResponse({'status': 'error', 'message': 'Authentication required'}, status=401)

    locations = CultureLocation.objects.select_related('story').all()

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
    if not request.user.is_authenticated:
        return JsonResponse({'status': 'error', 'message': 'Authentication required'}, status=401)

    story = get_object_or_404(NarrativeStory, id=story_id)

    from django.conf import settings

    story_configs = getattr(settings, 'NARRATIVE_STORY_CONFIGS', {})
    story_config = story_configs.get(story_id, {})

    nodes_list = list(story.dialog_nodes.prefetch_related('choices').all().order_by('order'))
    node_index_map = {n.node_id: idx for idx, n in enumerate(nodes_list)}
    dialogues = []

    for node in nodes_list:
        choices = []
        for choice in sorted(node.choices.all(), key=lambda c: c.order):
            next_index = node_index_map.get(choice.next_node)
            choices.append({
                'text': choice.text,
                'next': next_index,
            })

        dialogue_data = {
            'nodeId': node.node_id,
            'speaker': node.character,
            'text': node.text,
        }

        if node.next_node and node.next_node in node_index_map:
            dialogue_data['next'] = node_index_map[node.next_node]

        if choices:
            dialogue_data['choices'] = choices

        dialogues.append(dialogue_data)

    data = {
        'id': story.id,
        'title': story_config.get('title', story.title),
        'background': story_config.get('background', 'linear-gradient(135deg, #2C263F 0%, #41644A 100%)'),
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
    if not request.user.is_authenticated:
        return JsonResponse({'status': 'error', 'message': 'Authentication required'}, status=401)

    story = get_object_or_404(NarrativeStory, id=story_id)
    node = get_object_or_404(DialogNode, story=story, node_id=node_id)

    choices = [
        {
            'text': choice.text,
            'nextNode': choice.next_node,
            'order': choice.order,
        }
        for choice in node.choices.all()
    ]

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
        completed = bool(data.get('completed', False))

        progress, _ = StoryProgress.objects.get_or_create(
            user=request.user,
            story=story
        )

        if node_id:
            try:
                node = DialogNode.objects.get(story=story, node_id=node_id)
                progress.current_node = node
            except DialogNode.DoesNotExist:
                pass

        if completed:
            progress.times_played += 1
        progress.completed = progress.completed or completed
        progress.duration_seconds = int(duration or 0)
        progress.save()

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
