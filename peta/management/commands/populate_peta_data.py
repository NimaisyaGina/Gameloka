from django.core.management.base import BaseCommand
from peta.models import (
    NarrativeStory,
    DialogNode,
    DialogChoice,
    CultureLocation
)


class Command(BaseCommand):
    help = 'Populate initial narrative stories and locations for Peta Budaya'

    def handle(self, *args, **options):
        self.stdout.write('Creating narrative stories...')

        # Create Si Pitung Story
        pitung_story, created = NarrativeStory.objects.get_or_create(
            id='pitung',
            defaults={
                'title': 'Legenda Si Pitung',
                'description': 'Kisah keberanian Si Pitung, tokoh legendaris Betawi yang melawan ketidakadilan',
                'main_character': 'pitung',
                'moral_message': 'Keberanian dan integritas adalah fondasi dari budaya Betawi yang kuat. Kami membela yang lemah dan memperjuangkan keadilan.'
            }
        )

        if created:
            self.stdout.write(self.style.SUCCESS('✓ Created Si Pitung Story'))

            # Create dialog nodes for Pitung
            nodes_data = [
                {
                    'node_id': 'start',
                    'character': 'Si Pitung',
                    'text': 'Oleh-oleh aku adalah Si Pitung, seorang tokoh legendaris Betawi yang dikenal karena keberaniannya melawan ketidakadilan.',
                    'next_node': None,
                    'order': 0,
                    'choices': [
                        {'text': 'Lanjutkan kisah', 'nextNode': 'node1'}
                    ]
                },
                {
                    'node_id': 'node1',
                    'character': 'Si Pitung',
                    'text': 'Aku hidup pada masa penjajahan Belanda, ketika rakyat Betawi menderita di bawah penindasan dan ketidakadilan.',
                    'next_node': None,
                    'order': 1,
                    'choices': [
                        {'text': 'Apa yang kamu lakukan?', 'nextNode': 'node2'}
                    ]
                },
                {
                    'node_id': 'node2',
                    'character': 'Si Pitung',
                    'text': 'Aku memilih untuk membela rakyat. Bersama kawan-kawanku, aku melawan bandit-bandit yang merampok hasil kerja keras petani dan pedagang Betawi.',
                    'next_node': None,
                    'order': 2,
                    'choices': [
                        {'text': 'Lanjutkan...', 'nextNode': 'node3'}
                    ]
                },
                {
                    'node_id': 'node3',
                    'character': 'Si Pitung',
                    'text': 'Keberanian bukanlah ketiadaan rasa takut, tetapi kemauan untuk berbuat yang benar meskipun menghadapi bahaya. Itulah nilai inti yang aku pegang.',
                    'next_node': None,
                    'order': 3,
                    'choices': [
                        {'text': 'Terima kasih atas ceritanya', 'nextNode': 'end'}
                    ]
                },
                {
                    'node_id': 'end',
                    'character': 'Si Pitung',
                    'text': 'Semoga cerita kami menginspirasi kalian untuk menjaga budaya dan nilai-nilai Betawi. Merdeka!',
                    'next_node': None,
                    'order': 4,
                    'choices': []
                }
            ]

            for node_data in nodes_data:
                choices_data = node_data.pop('choices', [])
                node, _ = DialogNode.objects.get_or_create(
                    story=pitung_story,
                    node_id=node_data['node_id'],
                    defaults=node_data
                )

                for choice_data in choices_data:
                    DialogChoice.objects.get_or_create(
                        node=node,
                        text=choice_data['text'],
                        defaults={'next_node': choice_data['nextNode'], 'order': 0}
                    )

        # Create Mak Nani Story
        maknani_story, created = NarrativeStory.objects.get_or_create(
            id='maknani',
            defaults={
                'title': 'Kebijaksanaan Mak Nani',
                'description': 'Cerita tentang Mak Nani yang mengajarkan tradisi kuliner dan kebijaksanaan kepada generasi muda',
                'main_character': 'maknani',
                'moral_message': 'Warisan budaya dan pengetahuan tradisi adalah harta karun yang harus dijaga dan diwariskan kepada generasi mendatang.'
            }
        )

        if created:
            self.stdout.write(self.style.SUCCESS('✓ Created Mak Nani Story'))

            nodes_data = [
                {
                    'node_id': 'start',
                    'character': 'Mak Nani',
                    'text': 'Assalamu\'alaikum, anak muda. Aku Mak Nani, turun-temurun keluargaku menjaga tradisi kuliner Betawi di Condet.',
                    'next_node': None,
                    'order': 0,
                    'choices': [
                        {'text': 'Bisa kah Ibu mengajarkan saya?', 'nextNode': 'node1'}
                    ]
                },
                {
                    'node_id': 'node1',
                    'character': 'Mak Nani',
                    'text': 'Tentu saja! Memasak bukan hanya tentang resep. Ini tentang cinta, perhatian, dan menghormati bahan-bahan dari bumi.',
                    'next_node': None,
                    'order': 1,
                    'choices': [
                        {'text': 'Lanjutkan pelajaran', 'nextNode': 'node2'}
                    ]
                },
                {
                    'node_id': 'node2',
                    'character': 'Mak Nani',
                    'text': 'Setiap hidangan Betawi punya cerita. Dari soto Betawi hingga lumuran, semuanya mencerminkan kehidupan kita yang penuh semangat dan kehangatan.',
                    'next_node': None,
                    'order': 2,
                    'choices': [
                        {'text': 'Ajari aku resep turun-temurun', 'nextNode': 'node3'}
                    ]
                },
                {
                    'node_id': 'node3',
                    'character': 'Mak Nani',
                    'text': 'Semoga generasi kalian akan terus menjaga tradisi ini. Budaya adalah jembatan antara masa lalu dan masa depan kita.',
                    'next_node': None,
                    'order': 3,
                    'choices': []
                }
            ]

            for node_data in nodes_data:
                choices_data = node_data.pop('choices', [])
                node, _ = DialogNode.objects.get_or_create(
                    story=maknani_story,
                    node_id=node_data['node_id'],
                    defaults=node_data
                )

                for choice_data in choices_data:
                    DialogChoice.objects.get_or_create(
                        node=node,
                        text=choice_data['text'],
                        defaults={'next_node': choice_data['nextNode'], 'order': 0}
                    )

        # Create Kampung Story
        kampung_story, created = NarrativeStory.objects.get_or_create(
            id='kampung',
            defaults={
                'title': 'Sejarah Kemayoran',
                'description': 'Cerita tentang sejarah Kemayoran dan bagaimana komunitas Betawi membangun kampung mereka',
                'main_character': 'kampung',
                'moral_message': 'Kebersamaan dan gotong royong adalah kekuatan sejati masyarakat Betawi yang telah dibangun selama berabad-abad.'
            }
        )

        if created:
            self.stdout.write(self.style.SUCCESS('✓ Created Kampung Story'))

            nodes_data = [
                {
                    'node_id': 'start',
                    'character': 'Pewisata',
                    'text': 'Selamat datang di Kemayoran, kawasan bersejarah yang kaya dengan tradisi dan budaya Betawi. Mari kita jelajahi bersama.',
                    'next_node': None,
                    'order': 0,
                    'choices': [
                        {'text': 'Ceritakan sejarahnya', 'nextNode': 'node1'}
                    ]
                },
                {
                    'node_id': 'node1',
                    'character': 'Pewisata',
                    'text': 'Kawasan ini dimulai dari sebuah kampung kecil yang dibangun oleh para pendiri Betawi dengan semangat gotong royong yang luar biasa.',
                    'next_node': None,
                    'order': 1,
                    'choices': [
                        {'text': 'Apa makna gotong royong?', 'nextNode': 'node2'}
                    ]
                },
                {
                    'node_id': 'node2',
                    'character': 'Pewisata',
                    'text': 'Gotong royong adalah jiwa dari budaya Betawi... bekerja bersama tanpa pamrih untuk membangun komunitas yang kuat dan harmonis.',
                    'next_node': None,
                    'order': 2,
                    'choices': [
                        {'text': 'Terima kasih telah berbagi', 'nextNode': 'end'}
                    ]
                },
                {
                    'node_id': 'end',
                    'character': 'Pewisata',
                    'text': 'Semoga kalian dapat membawa nilai-nilai ini dalam kehidupan sehari-hari. Selamat tinggal, dan sampai jumpa lagi!',
                    'next_node': None,
                    'order': 3,
                    'choices': []
                }
            ]

            for node_data in nodes_data:
                choices_data = node_data.pop('choices', [])
                node, _ = DialogNode.objects.get_or_create(
                    story=kampung_story,
                    node_id=node_data['node_id'],
                    defaults=node_data
                )

                for choice_data in choices_data:
                    DialogChoice.objects.get_or_create(
                        node=node,
                        text=choice_data['text'],
                        defaults={'next_node': choice_data['nextNode'], 'order': 0}
                    )

        # Create Locations
        self.stdout.write('Creating culture locations...')

        locations_data = [
            {
                'id': 'setu-babakan',
                'name': 'Setu Babakan',
                'coords': {'x': 45, 'y': 60},
                'description': 'Perkampungan Budaya Betawi - pusat pelestarian seni, tradisi, dan kuliner Betawi.',
                'category': 'pusat_budaya',
                'story': 'pitung'
            },
            {
                'id': 'condet',
                'name': 'Condet',
                'coords': {'x': 65, 'y': 55},
                'description': 'Kampung tradisi yang terkenal dengan buah belimbing dan kuliner khas Betawi.',
                'category': 'tradisi_kuliner',
                'story': 'maknani'
            },
            {
                'id': 'kemayoran',
                'name': 'Kemayoran',
                'coords': {'x': 50, 'y': 35},
                'description': 'Kawasan bersejarah dengan festival rakyat dan jejak sejarah Betawi tempo dulu.',
                'category': 'festival_sejarah',
                'story': 'kampung'
            }
        ]

        for loc_data in locations_data:
            coords = loc_data.pop('coords')
            story_id = loc_data.pop('story')
            loc_data['coord_x'] = coords['x']
            loc_data['coord_y'] = coords['y']
            loc_data['story_id'] = story_id

            location, created = CultureLocation.objects.get_or_create(
                id=loc_data['id'],
                defaults=loc_data
            )

            if created:
                self.stdout.write(self.style.SUCCESS(f'✓ Created location: {location.name}'))

        self.stdout.write(self.style.SUCCESS('\nAll initial data has been created successfully!'))
