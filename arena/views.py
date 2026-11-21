from django.views.generic import TemplateView
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from django.utils.safestring import mark_safe
import json


@method_decorator(login_required, name='dispatch')
class ArenaJawaraView(TemplateView):
    """View untuk menampilkan Arena Jawara"""
    template_name = 'arena/arena.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        questions = self.get_questions()
        context['questions'] = mark_safe(json.dumps(questions))
        return context

    def get_questions(self):
        """Get all questions for Arena Jawara"""
        questions = [
            {
                'id': 1,
                'question': "Apa arti kata 'Gue' dalam bahasa Betawi?",
                'options': ["Kamu", "Saya", "Dia", "Mereka"],
                'correct': 1
            },
            {
                'id': 2,
                'question': "Apa arti kata 'Bokap' dalam bahasa Betawi?",
                'options': ["Ibu", "Ayah", "Kakak", "Adik"],
                'correct': 1
            },
            {
                'id': 3,
                'question': "Apa arti kata 'Nyokap' dalam bahasa Betawi?",
                'options': ["Ayah", "Ibu", "Nenek", "Kakek"],
                'correct': 1
            },
            {
                'id': 4,
                'question': "Apa arti 'Ogah' dalam bahasa Betawi?",
                'options': ["Mau", "Tidak mau", "Boleh", "Senang"],
                'correct': 1
            },
            {
                'id': 5,
                'question': "Apa arti 'Kepo' dalam bahasa Betawi?",
                'options': ["Malas", "Ingin tahu", "Lapar", "Capek"],
                'correct': 1
            },
            {
                'id': 6,
                'question': "Apa arti 'Encok' dalam bahasa Betawi?",
                'options': ["Sakit kepala", "Sakit perut", "Pegal-pegal", "Flu"],
                'correct': 2
            },
            {
                'id': 7,
                'question': "Apa arti 'Bini' dalam bahasa Betawi?",
                'options': ["Suami", "Istri", "Anak", "Saudara"],
                'correct': 1
            },
            {
                'id': 8,
                'question': "Apa arti 'Cepet' dalam bahasa Betawi?",
                'options': ["Lambat", "Cepat", "Pelan", "Santai"],
                'correct': 1
            },
            {
                'id': 9,
                'question': "Apa arti 'Ngaret' dalam bahasa Betawi?",
                'options': ["Terlambat", "Cepat", "Tepat waktu", "Sibuk"],
                'correct': 0
            },
            {
                'id': 10,
                'question': "Apa arti 'Meni' dalam bahasa Betawi?",
                'options': ["Sedikit", "Banyak", "Sangat", "Agak"],
                'correct': 2
            }
        ]
        return questions


@require_http_methods(["POST"])
@csrf_exempt
def save_score_api(request):
    """API endpoint untuk menyimpan score ke leaderboard"""
    if not request.user.is_authenticated:
        return JsonResponse({
            'status': 'not_authenticated',
            'message': 'Login untuk menyimpan skor ke leaderboard',
        }, status=401)

    try:
        data = json.loads(request.body)
        raw_score = data.get('score', 0)
        score = max(0, min(100, int(raw_score)))

        from leaderboard.models import LeaderboardEntry
        entry = LeaderboardEntry.objects.create(
            user=request.user,
            score=score,
            game_type='Arena Jawara'
        )

        return JsonResponse({
            'status': 'success',
            'message': 'Score saved to leaderboard',
            'score': score,
            'leaderboard_entry_id': entry.id
        })
    except json.JSONDecodeError:
        return JsonResponse({
            'status': 'error',
            'message': 'Invalid JSON format'
        }, status=400)
    except (TypeError, ValueError) as e:
        return JsonResponse({
            'status': 'error',
            'message': f'Invalid score value: {str(e)}'
        }, status=400)
    except Exception as e:
        return JsonResponse({
            'status': 'error',
            'message': str(e)
        }, status=400)


# Alias untuk kompatibilitas
arena_view = ArenaJawaraView.as_view()
