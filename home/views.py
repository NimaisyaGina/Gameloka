import json
import os
import random
import re
import requests
from django.db.models import Sum
from django.views.generic import TemplateView
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods


BETAWI_DICTIONARY = {
    'gue': ('Saya / Aku', 'Gue mau belajar bahasa Betawi di Gameloka.'),
    'ane': ('Saya (halus / santun)', 'Ane mau nanya soal pantun Betawi dong, Bang.'),
    'aye': ('Saya (Betawi Tengah)', 'Aye tinggal di daerah Setu Babakan.'),
    'elu': ('Kamu', 'Elu udah nyobain Arena Jawara belom?'),
    'lu': ('Kamu', 'Lu jago banget nebak kosakata Betawi!'),
    'ente': ('Anda / Kamu (akrab)', 'Ente mau ikut ke Condet kagak?'),
    'bokap': ('Ayah / Bapak', 'Bokap ane jago bikin bir pletok.'),
    'nyokap': ('Ibu / Emak', 'Nyokap lagi masak soto Betawi di dapur.'),
    'bini': ('Istri', 'Si Miskin dan bininye tetap tabah dalam ujian.'),
    'ogah': ('Tidak mau / Enggan', 'Gue ogah nyerah belajar bahasa daerah!'),
    'kepo': ('Ingin tahu urusan orang / Penasaran', 'Jangan kepo mulu, mending baca Pustaka Belajar!'),
    'ngaret': ('Terlambat', 'Jangan ngaret datang ke latihan silat Palang Pintu.'),
    'meni': ('Sangat / Terlalu', 'Meni cakep bener nih tampilan 8-bit Gameloka!'),
    'encok': ('Pegal-pegal / Nyeri sendi', 'Abis jalan jauh dari hutan, badan serasa encok.'),
    'cepet': ('Cepat', 'Jawab kuis Arena Jawara kudu cepet dalam 10 detik!'),
    'kagak': ('Tidak', 'Kagak ade kata terlambat buat nguri-uri budaya.'),
    'kaga': ('Tidak', 'Kaga usah sungkan kalau mau nanya ke Bang Buay Chatbot.'),
    'iye': ('Iya / Benar', 'Iye, Hikayat Marakarma itu karya sastra klasik Betawi!'),
    'nyok': ('Ayo / Mari', 'Nyok kite jelajahin Peta Budaya Jakarta!'),
    'gawe': ('Kerja / Bekerja', 'Abis pulang gawe, nyok main kuis bentar.'),
    'cabut': ('Pergi / Berangkat', 'Marakarma cabut dari istana demi menjaga kedamaian.'),
    'kece': ('Keren / Menarik', 'Desain pixel art Betawi ini kece pisan!'),
    'bokek': ('Tidak punya uang', 'Dulu Si Miskin bokek banget sebelum nemu tujuh batang emas.'),
    'baper': ('Bawa perasaan', 'Jangan baper kalau skor belum masuk tiga besar, coba lagi!'),
    'garing': ('Tidak lucu / Hambar', 'Pantun kite kagak bakal garing kalau berima pas.'),
    'pelesiran': ('Jalan-jalan / Berwisata', 'Akhir pekan nyok pelesiran ke Setu Babakan.'),
    'kongkow': ('Berkumpul / Nongkrong santai', 'Kongkow di Cerita Kami sambil bagi pengalaman belajar.'),
    'ngocol': ('Bercanda / Jenaka', 'Bang Buay kadang ngocol biar belajar kagak tegang.'),
    'cing': ('Paman / Panggilan akrab', 'Cing, boleh minta ajarin sejarah Kemayoran kagak?'),
    'abege': ('Anak baru gede / Remaja', 'Abege Jakarta wajib kenal warisan Muhammad Bakir.'),
    'sobat': ('Sahabat / Teman', 'Sobat Gameloka ayo kumpulin poin sebanyak-banyaknya!'),
}

PANTUN_LIST = [
    "Ke Kemayoran beli ketupat,\nJangan lupa bawa kemiri.\nAyo belajar Betawi yang giat,\nBiar budaya tetap lestari!",
    "Buah ampelam di taman raja,\nDipetik satu buat selamatan.\nKalau hati tabah bekerja,\nNegeri Puspa Sari jadi kenyataan!",
    "Jalan-jalan ke Setu Babakan,\nMampir sejenak minum bir pletok.\nIlmu bahasa mari amalkan,\nBiar makin jawara dan kagak kaku ngomongnye!",
    "Bunga melati di pinggir Condet,\nHarum baunya di pagi hari.\nJangan sampai ente suka ngaret,\nAyo asah kosakata tiap hari!",
]


def _has_word(lower_text: str, word: str) -> bool:
    return bool(re.search(rf'\b{re.escape(word)}\b', lower_text))


def _bang_buay_local_reply(message: str) -> str:
    """Smart rule-based Bang Buay Chatbot response with strict off-topic fallback."""
    text = (message or '').strip()
    lower = text.lower()

    greetings = [
        'assalam', 'halo', 'hai', 'hello', 'selamat pagi', 'selamat siang',
        'selamat sore', 'selamat malam', 'apa kabar', 'ape kabar', 'terima kasih', 'makasih'
    ]
    if 'assalam' in lower or any(_has_word(lower, g) for g in greetings[1:]):
        return (
            "Waalaikumsalam, Abang/None! Apa kabar nih? 🐊✨\n"
            "Ane **Bang Buay Chatbot**, asisten belajar Betawi di Gameloka.\n\n"
            "Ente mau belajar ape hari ini? Coba ketik:\n"
            "• \"Arti kata ogah / meni / nyok\"\n"
            "• \"Buatin pantun Betawi\"\n"
            "• \"Ceritain Hikayat Marakarma\"\n"
            "• \"Jelasin Setu Babakan / Condet / Kemayoran\""
        )

    if any(_has_word(lower, k) for k in ['pantun', 'rima', 'peribahasa']):
        pantun = random.choice(PANTUN_LIST)
        return f"Nih Ane bikinin pantun khas Betawi buat Ente:\n\n{pantun}\n\nCakep kagak tuh? 😄"

    if any(k in lower for k in ['marakarma', 'si miskin', 'bakir', 'puspa sari', 'ampelam', 'dongeng', 'ananta beranta', 'hikayat']):
        return (
            "📜 **Hikayat Marakarma (Hikayat Si Miskin)** adalah karya sastra tulis Melayu klasik Betawi "
            "yang digubah oleh **Muhammad Bakir bin Syafian bin Usman bin Fadli** di Batavia.\n\n"
            "Ringkasan Babak 1 (yang tayang di Bioskop 8-Bit Beranda):\n"
            "1. Pasangan Si Miskin (asalnya raja keinderaan yang kena sumpah Batara Indera) hidup tabah meski terusir.\n"
            "2. Sang istri ngidam **buah ampelam** dan nangka dari taman Maharaja Indera Dewa.\n"
            "3. Pada malam purnama ke-14, lahir putra elok bernama **Marakarma** ('anak dalam kesukaran').\n"
            "4. Saat menggali tanah, Si Miskin menemukan **7 batang emas** dan memuliakan negeri baru bernama **Puspa Sari**.\n\n"
            "Babak 2 butuh target **200 poin** dan Babak 3 butuh **500 poin** (keduanya saat ini berstatus **Coming Soon / Unavailable**)."
        )

    if any(k in lower for k in ['setu babakan', 'pitung']):
        return (
            "📍 **Setu Babakan** adalah Perkampungan Budaya Betawi di Jagakarsa, Jakarta Selatan.\n"
            "Di **Peta Budaya**, kawasan ini terhubung dengan kisah animasi **Legenda Si Pitung**. "
            "Di sana Ente bisa mengenal seni Palang Pintu, rumah kebaya, dan kuliner asli seperti Kerak Telor!"
        )

    if any(k in lower for k in ['condet', 'mak nani']):
        return (
            "📍 **Condet** terkenal dengan tradisi kuliner turun-temurun dan buah belimbing khas Jakarta Timur.\n"
            "Di **Peta Budaya**, Condet menghadirkan kisah animasi **Kebijaksanaan Mak Nani** tentang cinta dalam menjaga resep warisan leluhur!"
        )

    if any(k in lower for k in ['kemayoran', 'pewisata']):
        return (
            "📍 **Kemayoran** menyimpan jejak sejarah perayaan rakyat dan semangat gotong royong kampung Betawi.\n"
            "Buka **Peta Budaya → Kemayoran** untuk memainkan kisah animasi **Sejarah Kemayoran**!"
        )

    if any(k in lower for k in ['ondel', 'palang pintu', 'gambang kromong', 'rumah kebaya', 'batavia', 'budaya betawi', 'sejarah betawi', 'tradisi betawi']):
        return (
            "🎭 **Khazanah Tradisi & Sejarah Betawi**:\n"
            "• **Ondel-ondel**: Boneka raksasa setinggi ±2,5 meter ikon Jakarta yang melambangkan penolak bala.\n"
            "• **Palang Pintu**: Tradisi adu silat dan berbalas pantun dalam upacara pernikahan Betawi.\n"
            "• **Gambang Kromong**: Orkestra tradisional perpaduan alat musik Melayu, Jawa, dan Tionghoa.\n"
            "• **Rumah Kebaya**: Rumah adat Betawi dengan teras *paseban* luas dan ukiran *gigi balang*.\n\n"
            "Baca selengkapnya di **📚 Pustaka Belajar**!"
        )

    if any(k in lower for k in ['kuliner', 'makanan betawi', 'minuman betawi', 'kerak telor', 'bir pletok', 'soto betawi', 'nasi uduk', 'gado-gado']):
        return (
            "🍜 **Kuliner Legendaris Betawi**:\n"
            "• **Kerak Telor**: Beras ketan, telur bebek/ayam, ebi, dan kelapa sangrai dimasak memakai anglo.\n"
            "• **Soto Betawi**: Kuah santan & susu yang gurih dengan daging sapi.\n"
            "• **Bir Pletok**: Minuman rempah non-alkohol dari jahe, serai, kayu secang, dan kayu manis.\n\n"
            "Baca artikel lengkapnya di menu **📚 Pustaka Belajar**!"
        )

    if any(_has_word(lower, k) for k in ['latihan', 'kuis', 'soal', 'arena', 'poin', 'point', 'skor', 'level']):
        return (
            "🎯 **Tantangan & Sistem Poin Gameloka**:\n"
            "• Setiap ronde **⚡ Arena Jawara** terdiri dari 5 soal cepat (+20 poin/soal, maksimal **100 poin/ronde**).\n"
            "• **Level 2 Hikayat Marakarma** mensyaratkan target **200 poin** (~2 ronde sempurna), dan **Level 3** mensyaratkan **500 poin** (~5 ronde sempurna) — saat ini kedua babak lanjutan masih berstatus **Coming Soon / Unavailable**.\n\n"
            "Coba tebak cepat: apa arti kata **'Ngaret'**?\nA) Cepat  B) Terlambat  C) Lapar"
        )

    # Check dictionary with strict word boundaries so substrings like "keluar" never match "lu"
    for word, (meaning, example) in BETAWI_DICTIONARY.items():
        if _has_word(lower, word):
            return (
                f"📖 **Kamus Betawi — '{word.capitalize()}'**\n"
                f"• **Arti**: {meaning}\n"
                f"• **Contoh kalimat**: \"{example}\"\n\n"
                "Mau tanya kosakata lain atau pantun Betawi?"
            )

    if any(k in lower for k in ['kamus', 'kosakata', 'bahasa betawi', 'arti kata']):
        sample_words = ['gue', 'bokap', 'nyokap', 'ogah', 'kepo', 'ngaret', 'meni', 'nyok']
        lines = [f"• **{w.capitalize()}**: {BETAWI_DICTIONARY[w][0]}" for w in sample_words]
        return (
            "📖 **Mini Kamus Bahasa Betawi**:\n" + "\n".join(lines) +
            "\n\nCoba ketik kata tertentu (misal: *arti kata encok*) atau jelajahi **🧭 Kompas Belajar**!"
        )

    if any(_has_word(lower, k) for k in ['fitur', 'menu', 'gameloka', 'bang buay', 'chatbot', 'kompas', 'pustaka', 'peta budaya', 'cerita kami']):
        return (
            "🗺️ **Panduan Fitur Gameloka**:\n"
            "1. **⚡ Arena Jawara**: Kuis cepat 5 soal (10 detik/soal, +20 poin).\n"
            "2. **🏆 Papan Peringkat**: Cek peringkat All-Time, Mingguan, dan Harian.\n"
            "3. **🧭 Kompas Belajar**: Belajar terstruktur dari Dasar hingga Budaya.\n"
            "4. **📚 Pustaka Belajar**: 13 artikel sejarah, sastra, tradisi & kuliner.\n"
            "5. **🗺️ Peta Budaya**: Peta nyata Jakarta (Setu Babakan, Condet, Kemayoran) + animasi Sekilas Kisah.\n"
            "6. **💬 Cerita Kami**: Ruang komunitas berbagi pengalaman & pantun."
        )

    return (
        "Maaf, saya tidak mengerti. Mungkin kamu bisa coba bertanya tentang:\n"
        "• Arti kosakata Betawi (contoh: *arti kata ogah, ngaret, meni, bokap*)\n"
        "• **Pantun Betawi** & peribahasa\n"
        "• **Kuliner & Tradisi Betawi** (Kerak Telor, Soto Betawi, Bir Pletok, Ondel-ondel)\n"
        "• **Peta Budaya** (Setu Babakan, Condet, Kemayoran)\n"
        "• **Dongeng Hikayat Marakarma** atau cara kumpulkan poin di **Gameloka**"
    )


class HomePageView(TemplateView):
    """View untuk menampilkan halaman beranda Gameloka"""
    template_name = 'home.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)

        user_points = 0
        if self.request.user.is_authenticated:
            from leaderboard.models import LeaderboardEntry
            user_points = (
                LeaderboardEntry.objects.filter(user=self.request.user)
                .aggregate(total=Sum('score'))['total'] or 0
            )
        context['user_total_points'] = user_points

        def _chapter_calc(target_points):
            remaining = max(0, target_points - user_points)
            pct = min(100, int((user_points / target_points) * 100)) if target_points > 0 else 100
            rounds_needed = (remaining + 99) // 100 if remaining > 0 else 0
            return remaining, pct, rounds_needed

        lvl2_rem, lvl2_pct, lvl2_rounds = _chapter_calc(200)
        lvl3_rem, lvl3_pct, lvl3_rounds = _chapter_calc(500)

        context['features'] = [
            {
                'id': 'arena',
                'step': '01',
                'title': 'Arena Jawara',
                'pillar': 'Permainan',
                'url': '/arena/',
                'description': 'Tantangan cepat kosakata & ungkapan Betawi berbatas waktu. Kumpulkan poin dan raih peringkat!',
                'upcoming': 'Segera hadir: Rima Betawi & Peribahasa Kite',
                'emoji': '⚡',
                'accent': '#F8C662',
            },
            {
                'id': 'leaderboard',
                'step': '02',
                'title': 'Papan Peringkat',
                'pillar': 'Permainan',
                'url': '/leaderboard/',
                'description': 'Pantau skor tertinggi jawara harian, mingguan, dan sepanjang masa untuk menjaga semangat belajar.',
                'upcoming': '',
                'emoji': '🏆',
                'accent': '#F8C662',
            },
            {
                'id': 'kompas',
                'step': '03',
                'title': 'Kompas Belajar',
                'pillar': 'Bahasa',
                'url': '/kompas/',
                'description': 'Panduan bertahap dari dasar hingga mahir mencakup kosakata, ungkapan harian, dan tata bahasa Betawi.',
                'upcoming': '',
                'emoji': '🧭',
                'accent': '#5A8866',
            },
            {
                'id': 'pustaka',
                'step': '04',
                'title': 'Pustaka Belajar',
                'pillar': 'Budaya',
                'url': '/pustaka/',
                'description': 'Artikel & esai digital seputar sastra, bahasa, sejarah Batavia, tradisi, hingga kuliner legendaris.',
                'upcoming': '',
                'emoji': '📚',
                'accent': '#7B71AD',
            },
            {
                'id': 'peta',
                'step': '05',
                'title': 'Peta Budaya',
                'pillar': 'Budaya',
                'url': '/peta/',
                'description': 'Jelajahi Kemayoran, Setu Babakan, dan Condet untuk membuka Sekilas Kisah naratif interaktif.',
                'upcoming': '',
                'emoji': '🗺️',
                'accent': '#5A8866',
            },
            {
                'id': 'cerita',
                'step': '06',
                'title': 'Cerita Kami',
                'pillar': 'Budaya & Bahasa',
                'url': '/cerita/',
                'description': 'Ruang komunitas untuk berbagi refleksi, pengalaman belajar, dan kreasi pantun lintas budaya.',
                'upcoming': '',
                'emoji': '💬',
                'accent': '#7B71AD',
            },
        ]

        context['story_chapters'] = [
            {
                'level': 1,
                'title': 'Bagian 1: Si Miskin & Kerajaan Puspa Sari',
                'subtitle': 'Dari keterpurukan di Ananta Beranta hingga kelahiran Marakarma & berdirinya Puspa Sari.',
                'unlocked': True,
                'available': True,
                'required_points': 0,
                'points_remaining': 0,
                'progress_pct': 100,
                'rounds_needed': 0,
                'status_label': 'TERBUKA',
                'scenes_count': 6,
                'source': 'Muhammad Bakir bin Syafian bin Usman bin Fadli',
            },
            {
                'level': 2,
                'title': 'Bagian 2: Fitnah Ahli Nujum & Pengembaraan',
                'subtitle': 'Terbakarnya Puspa Sari, terpisahnya Marakarma & Puteri Nila Kesuma di rimba, hingga Palinggam Cahaya.',
                'unlocked': False,
                'available': False,
                'required_points': 200,
                'points_remaining': lvl2_rem,
                'progress_pct': lvl2_pct,
                'rounds_needed': lvl2_rounds,
                'status_label': 'COMING SOON / UNAVAILABLE',
                'requirement': (
                    'Target akses: 200 Poin Arena (~2 ronde sempurna di Arena Jawara, maks. 100 poin/ronde). '
                    'Status saat ini: Coming Soon / Unavailable (sedang dalam pengembangan lanjutan).'
                ),
            },
            {
                'level': 3,
                'title': 'Bagian 3: Pulau Raksasa & Puteri Cahya Khairani',
                'subtitle': 'Kecerdikan Marakarma menaklukkan raksasa buas, pelayaran penuh badai, dan ujian kesetiaan.',
                'unlocked': False,
                'available': False,
                'required_points': 500,
                'points_remaining': lvl3_rem,
                'progress_pct': lvl3_pct,
                'rounds_needed': lvl3_rounds,
                'status_label': 'COMING SOON / UNAVAILABLE',
                'requirement': (
                    'Target akses: 500 Poin Arena (~5 ronde sempurna di Arena Jawara, maks. 100 poin/ronde). '
                    'Status saat ini: Coming Soon / Unavailable (akan dirilis pada pembaruan mendatang).'
                ),
            },
        ]

        context['stats'] = [
            {'count': '500+', 'label': 'Kosakata Betawi'},
            {'count': '50+', 'label': 'Materi & Kisah'},
            {'count': '3', 'label': 'Wilayah Budaya'},
            {'count': '1K+', 'label': 'Jawara Belajar'},
        ]

        return context


@require_http_methods(["POST"])
def ai_chat_api(request):
    """Endpoint Bang Buay Chatbot"""
    if not request.user.is_authenticated:
        return JsonResponse({
            'status': 'error',
            'message': 'Silakan Sign In terlebih dahulu untuk mengobrol dengan Bang Buay Chatbot.'
        }, status=401)

    try:
        data = json.loads(request.body)
        message = (data.get('message') or '').strip()
        if not message:
            return JsonResponse({
                'status': 'error',
                'message': 'Pesan tidak boleh kosong.'
            }, status=400)

        api_key = os.getenv('GEMINI_API_KEY') or os.getenv('VITE_GEMINI_API_KEY')
        if api_key and not api_key.startswith('AIza...'):
            try:
                system_prompt = (
                    "Kamu adalah Bang Buay Chatbot, asisten belajar bahasa dan budaya Betawi di platform Gameloka. "
                    "Bicaralah ramah menggunakan campuran bahasa Indonesia dan logat Betawi santun (ane/ente, nyok, kagak, cakep). "
                    "Bantu pengguna memahami kosakata Betawi, pantun, kuliner, Peta Budaya (Setu Babakan, Condet, Kemayoran), "
                    "dan dongeng sastra klasik Betawi Hikayat Marakarma karya Muhammad Bakir. "
                    "Jika pertanyaan berada di luar topik bahasa/budaya Betawi, Hikayat Marakarma, atau Gameloka (tidak relevan), "
                    "WAJIB balas mulai dengan: 'Maaf, saya tidak mengerti. Mungkin kamu bisa coba bertanya tentang:' diikuti saran topik Betawi & Gameloka."
                )
                url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
                payload = {
                    "contents": [
                        {
                            "role": "user",
                            "parts": [{"text": f"{system_prompt}\n\nPertanyaan pengguna: {message}"}]
                        }
                    ]
                }
                resp = requests.post(url, json=payload, timeout=10)
                if resp.status_code == 200:
                    res_json = resp.json()
                    reply_text = (
                        res_json.get('candidates', [{}])[0]
                        .get('content', {})
                        .get('parts', [{}])[0]
                        .get('text', '')
                    )
                    if reply_text:
                        return JsonResponse({
                            'status': 'success',
                            'reply': reply_text,
                            'source': 'gemini'
                        })
            except Exception:
                pass

        reply = _bang_buay_local_reply(message)
        return JsonResponse({
            'status': 'success',
            'reply': reply,
            'source': 'bang-buay-local'
        })

    except json.JSONDecodeError:
        return JsonResponse({
            'status': 'error',
            'message': 'Format JSON tidak valid.'
        }, status=400)
    except Exception as e:
        return JsonResponse({
            'status': 'error',
            'message': str(e)
        }, status=500)


# Alias untuk kompatibilitas
home_view = HomePageView.as_view()
