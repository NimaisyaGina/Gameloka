from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.utils.safestring import mark_safe
import json


LEARNING_PATH = [
    {
        'id': 'dasar',
        'name': 'Dasar',
        'color': '#27AE60',  
        'topics': [
            {
                'id': 'dasar-1',
                'title': 'Sapaan Betawi',
                'content': 'Sapaan dalam bahasa Betawi memiliki keunikan tersendiri yang mencerminkan keramahan masyarakat Betawi.',
                'examples': ['Gue - Saya/Aku', 'Elu/Lu - Kamu', 'Bokap - Ayah', 'Nyokap - Ibu', 'Ape kabar? - Apa kabar?']
            },
            {
                'id': 'dasar-2',
                'title': 'Angka Betawi',
                'content': 'Belajar menghitung dalam bahasa Betawi, dari satu sampai sepuluh.',
                'examples': ['Satu - Siji', 'Dua - Dua', 'Tiga - Tige', 'Empat - Empat', 'Lima - Lime']
            },
            {
                'id': 'dasar-3',
                'title': 'Kata Sehari-hari',
                'content': 'Kata-kata yang sering dipakai dalam percakapan sehari-hari orang Betawi.',
                'examples': ['Ogah - Tidak mau', 'Kepo - Ingin tahu', 'Embokap - Tidak peduli', 'Kagak - Tidak', 'Iye - Iya']
            }
        ]
    },
    {
        'id': 'menengah',
        'name': 'Menengah',
        'color': '#3498DB',  
        'topics': [
            {
                'id': 'menengah-1',
                'title': 'Pantun Betawi',
                'content': 'Pantun adalah bagian penting dari budaya Betawi yang sering digunakan dalam percakapan.',
                'examples': ['Ke Karet beli sapu lidi', 'Sapu lidi untuk menyapu', 'Kalo miskin suka ngiri', 'Kalo kaya suka ditiru']
            },
            {
                'id': 'menengah-2',
                'title': 'Ungkapan Perasaan',
                'content': 'Cara mengungkapkan perasaan dalam bahasa Betawi dengan ekspresif.',
                'examples': ['Jengkel - Sebel/Dongkol', 'Senang - Seneng banget', 'Kangen - Rindu', 'Marah - Ngamuk', 'Sedih - Sedih banget cuy']
            },
            {
                'id': 'menengah-3',
                'title': 'Kata Kerja Umum',
                'content': 'Kata kerja yang sering digunakan dalam aktivitas sehari-hari.',
                'examples': ['Makan - Makan/Jajan', 'Pergi - Cabut/Melipir', 'Pulang - Balik', 'Tidur - Bobo', 'Kerja - Gawean']
            }
        ]
    },
    {
        'id': 'lanjut',
        'name': 'Lanjut',
        'color': '#F39C12', 
        'topics': [
            {
                'id': 'lanjut-1',
                'title': 'Peribahasa Betawi',
                'content': 'Peribahasa Betawi yang mengandung filosofi hidup masyarakat Jakarta.',
                'examples': ['Kalo lo kagak kenal, jangan sok kenal', 'Biar lambat asal selamat', 'Ade aje yang lebih ade', 'Gak ada rotan, akar pun jadi']
            },
            {
                'id': 'lanjut-2',
                'title': 'Percakapan Kompleks',
                'content': 'Memahami percakapan bahasa Betawi yang lebih kompleks dan kontekstual.',
                'examples': ['Gue mau ngomong ape ye sama lu', 'Kagak usah banyak bacot dah!', 'Lu jangan sok-sokan lah', 'Emang gue pikirin?']
            },
            {
                'id': 'lanjut-3',
                'title': 'Kata Slang Betawi',
                'content': 'Kata-kata slang modern yang berkembang dari bahasa Betawi.',
                'examples': ['Kece - Keren', 'Alay - Lebay/Berlebihan', 'Baper - Bawa perasaan', 'Bokek - Tidak punya uang', 'Garing - Tidak lucu']
            }
        ]
    },
    {
        'id': 'budaya',
        'name': 'Budaya',
        'color': '#E91E63',  
        'topics': [
            {
                'id': 'budaya-1',
                'title': 'Tradisi Betawi',
                'content': 'Mengenal tradisi dan upacara adat Betawi yang masih lestari hingga kini.',
                'examples': ['Palang Pintu - Seni bela diri', 'Ondel-ondel - Boneka raksasa', 'Tanjidor - Musik tradisional', 'Gambang Kromong - Orkestra']
            },
            {
                'id': 'budaya-2',
                'title': 'Kuliner Betawi',
                'content': 'Mengenal nama-nama makanan khas Betawi yang terkenal.',
                'examples': ['Kerak Telor', 'Soto Betawi', 'Nasi Uduk', 'Gado-gado', 'Bir Pletok']
            },
            {
                'id': 'budaya-3',
                'title': 'Sejarah Betawi',
                'content': 'Memahami asal-usul dan perkembangan masyarakat Betawi di Jakarta.',
                'examples': ['Betawi berasal dari kata Batavia', 'Campuran berbagai etnis', 'Budaya asli Jakarta', 'Melayu, Arab, Tionghoa, dan lainnya']
            }
        ]
    }
]


def kompas_view(request):
    """View untuk halaman Kompas Belajar"""
    context = {
        'learning_path': mark_safe(json.dumps(LEARNING_PATH)),
    }
    return render(request, 'kompas/kompas.html', context)


@require_http_methods(["GET"])
def get_topic_detail(request):
    """API endpoint untuk mendapatkan detail topik"""
    topic_id = request.GET.get('id')
    
    for level in LEARNING_PATH:
        for topic in level['topics']:
            if topic['id'] == topic_id:
                return JsonResponse({
                    'status': 'success',
                    'topic': topic
                })
    
    return JsonResponse({
        'status': 'error',
        'message': 'Topic not found'
    }, status=404)
