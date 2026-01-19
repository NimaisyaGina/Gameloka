# Konfigurasi untuk Narrative Game - Sekilas Kisah
# Tambahkan ini ke settings.py Django Anda

NARRATIVE_STORY_CONFIGS = {
    'pitung': {
        'title': '🧢 Legenda Si Pitung',
        'background': 'linear-gradient(135deg, #8B4513 0%, #D2B48C 100%)',
        'npcs': [
            {
                'id': 'pitung',
                'name': 'Si Pitung',
                'emoji': '🧢',
                'x': 250,
                'y': 350
            },
            {
                'id': 'maknani',
                'name': 'Mak Nani',
                'emoji': '👵',
                'x': 550,
                'y': 380
            },
            {
                'id': 'bangkadir',
                'name': 'Bang Kadir',
                'emoji': '👨',
                'x': 150,
                'y': 200
            }
        ]
    },
    'maknani': {
        'title': '👵 Kebijaksanaan Mak Nani',
        'background': 'linear-gradient(135deg, #27AE60 0%, #F1C40F 100%)',
        'npcs': [
            {
                'id': 'maknani',
                'name': 'Mak Nani',
                'emoji': '👵',
                'x': 300,
                'y': 350
            },
            {
                'id': 'anak',
                'name': 'Anak Muda',
                'emoji': '🧑',
                'x': 550,
                'y': 380
            },
            {
                'id': 'nenek',
                'name': 'Nenek Tua',
                'emoji': '👴',
                'x': 150,
                'y': 250
            }
        ]
    },
    'kampung': {
        'title': '🎭 Sejarah Kemayoran',
        'background': 'linear-gradient(135deg, #2980B9 0%, #F1C40F 100%)',
        'npcs': [
            {
                'id': 'bang',
                'name': 'Bang Udin',
                'emoji': '👨',
                'x': 250,
                'y': 350
            },
            {
                'id': 'adik',
                'name': 'Adik Kecil',
                'emoji': '👧',
                'x': 550,
                'y': 380
            },
            {
                'id': 'nenek',
                'name': 'Nenek',
                'emoji': '👵',
                'x': 150,
                'y': 250
            }
        ]
    }
}
