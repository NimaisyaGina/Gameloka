from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.utils.safestring import mark_safe
import json


ARTICLES = [
    {
        'id': '1',
        'title': 'Asal Usul Bahasa Betawi',
        'content': 'Bahasa Betawi merupakan bahasa kreol yang terbentuk dari percampuran berbagai bahasa, terutama Melayu sebagai bahasa dasarnya. Pengaruh bahasa Arab, Tionghoa, Belanda, dan berbagai bahasa Nusantara lainnya membentuk bahasa Betawi yang unik. Bahasa ini berkembang sejak abad ke-17 di kawasan Batavia (Jakarta lama) sebagai lingua franca di kalangan masyarakat multietnis.',
        'category': 'Bahasa'
    },
    {
        'id': '2',
        'title': 'Sejarah Ondel-ondel',
        'content': 'Ondel-ondel adalah boneka besar khas Betawi yang tingginya mencapai 2,5 meter. Awalnya, ondel-ondel digunakan untuk mengusir roh jahat atau bala. Kini, ondel-ondel menjadi ikon Jakarta dan sering ditampilkan dalam acara-acara perayaan. Ondel-ondel laki-laki memiliki warna merah dengan kumis dan rambut hitam, sedangkan yang perempuan berwarna putih dengan bibir merah.',
        'category': 'Tradisi'
    },
    {
        'id': '3',
        'title': 'Perkembangan Bahasa Betawi Modern',
        'content': 'Bahasa Betawi terus berkembang mengikuti zaman. Kini banyak kosakata baru yang muncul, dipengaruhi oleh bahasa gaul Jakarta dan media sosial. Namun, tetap ada upaya pelestarian bahasa Betawi asli melalui berbagai komunitas dan lembaga budaya. Generasi muda diharapkan tetap melestarikan bahasa Betawi sambil tetap terbuka terhadap perkembangan zaman.',
        'category': 'Bahasa'
    },
    {
        'id': '4',
        'title': 'Jakarta Tempo Dulu',
        'content': 'Jakarta di masa lalu, atau Batavia, adalah kota pelabuhan yang ramai. Campuran berbagai etnis menciptakan budaya Betawi yang kaya. Kawasan seperti Kota Tua, Senen, dan Tanah Abang menjadi pusat aktivitas masyarakat Betawi. Rumah-rumah dengan arsitektur khas, seperti rumah kebaya, masih bisa ditemukan di beberapa kampung Betawi yang tersisa.',
        'category': 'Sejarah'
    },
    {
        'id': '5',
        'title': 'Kerak Telor: Kuliner Legendaris',
        'content': 'Kerak telor adalah makanan khas Betawi yang terbuat dari beras ketan putih, telur ayam atau bebek, ebi kering, dan kelapa sangrai. Makanan ini dimasak dengan cara yang unik, menggunakan anglo (kompor arang) dan dibalik agar matang merata. Kerak telor sering ditemukan di acara-acara Monas dan festival budaya Jakarta.',
        'category': 'Kuliner'
    },
    {
        'id': '6',
        'title': 'Palang Pintu: Seni Bela Diri Betawi',
        'content': 'Palang Pintu adalah tradisi Betawi yang dilakukan saat acara pernikahan. Rombongan pengantin pria harus melewati "palang pintu" yang dijaga oleh jagoan silat dari pihak pengantin wanita. Pertarungan silat dilakukan dengan diiringi pantun dan musik tanjidor. Tradisi ini mencerminkan keberanian dan kehormatan dalam budaya Betawi.',
        'category': 'Tradisi'
    },
    {
        'id': '7',
        'title': 'Soto Betawi: Cita Rasa Nusantara',
        'content': 'Soto Betawi adalah sup daging sapi yang menggunakan santan dan susu. Kuahnya yang kental dan gurih membuat soto ini berbeda dari soto lainnya. Biasanya disajikan dengan jeroan, daging sapi, dan tomat. Setiap penjual soto Betawi memiliki resep rahasia yang membuat cita rasa mereka unik.',
        'category': 'Kuliner'
    },
    {
        'id': '8',
        'title': 'Gambang Kromong: Orkestra Betawi',
        'content': 'Gambang Kromong adalah musik tradisional Betawi yang memadukan alat musik Tionghoa dan Jawa. Alat musik utamanya adalah gambang (xylophone kayu), kromong (bonang Tionghoa), dan rebab. Musik ini sering dimainkan dalam acara hajatan dan perayaan besar. Lagu-lagu seperti "Jali-jali" menjadi sangat populer.',
        'category': 'Tradisi'
    },
    {
        'id': '9',
        'title': 'Kata-kata Unik Bahasa Betawi',
        'content': 'Bahasa Betawi memiliki kata-kata unik yang tidak ditemukan di bahasa lain. Misalnya "embokap" (tidak peduli), "ngaret" (terlambat), "meni" (sangat), dan "kepo" (ingin tahu berlebihan). Kata-kata ini mencerminkan karakter masyarakat Betawi yang lugas dan ekspresif. Banyak kata Betawi kini menjadi bagian dari bahasa Indonesia sehari-hari.',
        'category': 'Bahasa'
    },
    {
        'id': '10',
        'title': 'Batavia: Cikal Bakal Jakarta',
        'content': 'Batavia didirikan oleh VOC Belanda pada 1619 di atas reruntukan Jayakarta. Kota ini menjadi pusat perdagangan rempah-rempah di Asia Tenggara. Dari Batavia inilah masyarakat Betawi terbentuk, sebagai hasil asimilasi berbagai suku yang datang ke kota ini untuk berdagang dan menetap.',
        'category': 'Sejarah'
    },
    {
        'id': '11',
        'title': 'Bir Pletok: Minuman Tradisional',
        'content': 'Bir Pletok adalah minuman tradisional Betawi yang terbuat dari berbagai rempah seperti jahe, serai, kayu secang, dan kayu manis. Meskipun namanya "bir", minuman ini tidak mengandung alkohol sama sekali. Warnanya merah dari kayu secang dan rasanya hangat cocok untuk cuaca Jakarta yang panas.',
        'category': 'Kuliner'
    },
    {
        'id': '12',
        'title': 'Rumah Kebaya: Arsitektur Betawi',
        'content': 'Rumah Kebaya adalah arsitektur rumah khas Betawi yang atapnya menyerupai pelana yang dilipat seperti kebaya. Rumah ini memiliki teras luas yang disebut "paseban" untuk menerima tamu. Dindingnya sering dihiasi dengan ukiran dan warna-warna cerah. Rumah kebaya mencerminkan kehidupan sosial masyarakat Betawi yang terbuka.',
        'category': 'Sejarah'
    }
]


def pustaka_view(request):
    """View untuk halaman Pustaka Belajar"""
    context = {
        'articles': mark_safe(json.dumps(ARTICLES)),
    }
    return render(request, 'pustaka/pustaka.html', context)


@require_http_methods(["GET"])
def get_article_detail(request):
    """API endpoint untuk mendapatkan detail artikel"""
    article_id = request.GET.get('id')
    
    for article in ARTICLES:
        if article['id'] == article_id:
            return JsonResponse({
                'status': 'success',
                'article': article
            })
    
    return JsonResponse({
        'status': 'error',
        'message': 'Article not found'
    }, status=404)
