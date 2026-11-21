import json
from django.test import TestCase, Client, override_settings
from django.contrib.auth.models import User
from django.core.management import call_command


class GamelokaFullFlowTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        call_command('populate_peta_data')

    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(
            username='jawara1',
            email='jawara1@example.com',
            password='password123',
            first_name='Jawara'
        )

    def test_homepage_public_and_has_marakarma_and_locked_chapters(self):
        resp = self.client.get('/')
        self.assertEqual(resp.status_code, 200)
        html = resp.content.decode('utf-8')
        self.assertIn('marakarmaCanvas', html)
        self.assertIn('HIKAYAT MARAKARMA', html)
        self.assertIn('LEVEL 1', html)
        self.assertIn('LEVEL 2', html)
        self.assertIn('LEVEL 3', html)
        self.assertIn('TERKUNCI', html)
        self.assertIn('/auth/login/', html)
        self.assertIn('id="menu-fitur"', html)
        self.assertNotIn('cdn.tailwindcss.com', html)

    def test_auth_pages_return_200_and_have_back_to_home(self):
        for url in ['/auth/login/', '/auth/register/', '/auth/login/?next=/arena/']:
            resp = self.client.get(url)
            self.assertEqual(resp.status_code, 200, f"Failed for {url}")
            html = resp.content.decode('utf-8')
            self.assertIn('href="/"', html)
            self.assertIn('KEMBALI KE BERANDA', html)
            self.assertNotIn('cdn.tailwindcss.com', html)

    def test_protected_feature_pages_redirect_anonymous_users(self):
        protected_urls = [
            '/arena/',
            '/leaderboard/',
            '/kompas/',
            '/pustaka/',
            '/peta/',
            '/peta/cerita/pitung/',
            '/cerita/',
            '/auth/profile/',
        ]
        for url in protected_urls:
            resp = self.client.get(url)
            self.assertEqual(resp.status_code, 302, f"Expected 302 redirect for {url}")
            self.assertIn('/auth/login/', resp['Location'])
            self.assertIn(f'next={url}', resp['Location'])

    def test_protected_apis_return_401_when_unauthenticated(self):
        get_endpoints = [
            '/leaderboard/api/get/',
            '/kompas/api/topic/?id=dasar-1',
            '/pustaka/api/article/?id=1',
            '/peta/api/locations/',
            '/peta/api/story/pitung/',
            '/cerita/api/posts/',
        ]
        for url in get_endpoints:
            resp = self.client.get(url)
            self.assertEqual(resp.status_code, 401, f"Expected 401 for GET {url}")

        post_endpoints = [
            ('/arena/api/save-score/', {'score': 80}),
            ('/leaderboard/api/add-score/', {'score': 60}),
            ('/cerita/api/posts/', {'title': 'Test', 'content': 'Halo'}),
            ('/api/ai/chat/', {'message': 'Halo Bang Buay'}),
        ]
        for url, payload in post_endpoints:
            resp = self.client.post(url, json.dumps(payload), content_type='application/json')
            self.assertEqual(resp.status_code, 401, f"Expected 401 for POST {url}")

    def test_authenticated_pages_return_200_have_back_to_home_and_no_broken_tailwind(self):
        self.client.force_login(self.user)
        pages = [
            '/',
            '/arena/',
            '/leaderboard/',
            '/kompas/',
            '/pustaka/',
            '/peta/',
            '/peta/cerita/pitung/',
            '/cerita/',
            '/auth/profile/',
        ]
        for url in pages:
            resp = self.client.get(url)
            self.assertEqual(resp.status_code, 200, f"Expected 200 for {url}")
            html = resp.content.decode('utf-8')
            self.assertIn('href="/"', html, f"Missing home link on {url}")
            self.assertNotIn('cdn.tailwindcss.com', html, f"Broken Tailwind link on {url}")
            if url != '/':
                self.assertIn('KEMBALI KE BERANDA', html, f"Missing back bar on {url}")

    def test_api_login_respects_safe_next_and_blocks_external_redirect(self):
        # Safe internal redirect
        resp = self.client.post(
            '/auth/api/login/',
            json.dumps({
                'email': 'JAWARA1@example.com',
                'password': 'password123',
                'next': '/arena/',
            }),
            content_type='application/json'
        )
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data['status'], 'success')
        self.assertEqual(data['redirect'], '/arena/')

        self.client.logout()

        # Unsafe external redirect rejected cleanly
        resp2 = self.client.post(
            '/auth/api/login/',
            json.dumps({
                'email': 'jawara1@example.com',
                'password': 'password123',
                'next': 'https://evil.example.com/phish',
            }),
            content_type='application/json'
        )
        self.assertEqual(resp2.status_code, 200)
        self.assertEqual(resp2.json()['redirect'], '/')

    def test_cerita_create_and_like_api(self):
        self.client.force_login(self.user)

        create_resp = self.client.post(
            '/cerita/api/posts/',
            json.dumps({
                'title': 'Belajar Pantun Betawi',
                'category': 'pantun',
                'content': 'Ke Condet makan belimbing, belajar Betawi makin cemerlang!'
            }),
            content_type='application/json'
        )
        self.assertEqual(create_resp.status_code, 201)
        created_data = create_resp.json()
        self.assertEqual(created_data['status'], 'success')
        post_id = created_data['post']['id']

        like_resp = self.client.post(f'/cerita/api/posts/{post_id}/like/')
        self.assertEqual(like_resp.status_code, 200)
        like_data = like_resp.json()
        self.assertTrue(like_data['liked'])
        self.assertEqual(like_data['likes_count'], 1)

        unlike_resp = self.client.post(f'/cerita/api/posts/{post_id}/like/')
        self.assertEqual(unlike_resp.status_code, 200)
        self.assertFalse(unlike_resp.json()['liked'])
        self.assertEqual(unlike_resp.json()['likes_count'], 0)

    def test_ai_chat_api_returns_betawi_reply(self):
        self.client.force_login(self.user)
        resp = self.client.post(
            '/api/ai/chat/',
            json.dumps({'message': 'Buatin pantun Betawi dan jelasin arti ogah'}),
            content_type='application/json'
        )
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data['status'], 'success')
        self.assertTrue(len(data['reply']) > 10)

    def test_peta_story_api_resolves_indices_and_saves_progress(self):
        self.client.force_login(self.user)
        resp = self.client.get('/peta/api/story/pitung/')
        self.assertEqual(resp.status_code, 200)
        story = resp.json()
        self.assertEqual(story['id'], 'pitung')
        self.assertGreaterEqual(len(story['dialogues']), 4)
        self.assertEqual(story['dialogues'][0]['choices'][0]['next'], 1)

        prog_resp = self.client.post(
            '/peta/api/story/pitung/progress/',
            json.dumps({'nodeId': 'end', 'duration': 25, 'completed': True}),
            content_type='application/json'
        )
        self.assertEqual(prog_resp.status_code, 200)
        self.assertTrue(prog_resp.json()['success'])
        self.assertTrue(prog_resp.json()['progress']['completed'])

    def test_arena_save_score_and_leaderboard_reflection(self):
        self.client.force_login(self.user)
        save_resp = self.client.post(
            '/arena/api/save-score/',
            json.dumps({'score': 80}),
            content_type='application/json'
        )
        self.assertEqual(save_resp.status_code, 200)
        self.assertEqual(save_resp.json()['status'], 'success')

        lb_resp = self.client.get('/leaderboard/api/get/?period=all-time')
        self.assertEqual(lb_resp.status_code, 200)
        lb_data = lb_resp.json()
        self.assertEqual(lb_data['status'], 'success')
        self.assertTrue(any(item['username'] == 'jawara1' and item['score'] == 80 for item in lb_data['data']))

    def test_peta_page_renders_leaflet_jakarta_map(self):
        self.client.force_login(self.user)
        resp = self.client.get('/peta/')
        self.assertEqual(resp.status_code, 200)
        html = resp.content.decode('utf-8')
        self.assertIn('id="jakartaMap"', html)
        self.assertIn('id="locationPreviewCanvas"', html)
        self.assertIn('leaflet.css', html)
        self.assertIn('leaflet.js', html)
        self.assertIn('KEMBALI KE BERANDA', html)

    @override_settings(DEBUG=True)
    def test_dev_no_cache_static_middleware_sets_no_cache_headers(self):
        resp = self.client.get('/static/css/home.css')
        self.assertIn('no-cache', resp.get('Cache-Control', ''))
        self.assertEqual(resp.get('Pragma'), 'no-cache')

    def test_homepage_locked_chapter_point_calculation_and_coming_soon(self):
        from leaderboard.models import LeaderboardEntry
        LeaderboardEntry.objects.create(user=self.user, score=80, game_type='Arena Jawara')

        # Guest sees targets + COMING SOON + Bang Buay Chatbot
        guest_resp = self.client.get('/')
        guest_html = guest_resp.content.decode('utf-8')
        self.assertIn('COMING SOON', guest_html)
        self.assertIn('Target: 200 Poin', guest_html)
        self.assertIn('Target: 500 Poin', guest_html)
        self.assertIn('Bang Buay Chatbot', guest_html)

        # Authenticated user with 80 points sees 80 / 200 and Kurang 120 poin
        self.client.force_login(self.user)
        auth_resp = self.client.get('/')
        auth_html = auth_resp.content.decode('utf-8')
        self.assertIn('80 / 200', auth_html)
        self.assertIn('Kurang 120 poin', auth_html)
        self.assertIn('BUKA BANG BUAY CHATBOT', auth_html)

    def test_chatbot_irrelevant_question_fallback_and_word_boundary(self):
        self.client.force_login(self.user)
        for bad_prompt in [
            'siapa pemenang piala dunia 1998',
            'asdfghjkl',
            'keluar rumah',
            'menurut kamu siapa presiden mars',
            'makanan thailand enak gak',
        ]:
            resp = self.client.post(
                '/api/ai/chat/',
                json.dumps({'message': bad_prompt}),
                content_type='application/json'
            )
            self.assertEqual(resp.status_code, 200)
            reply = resp.json()['reply']
            self.assertIn('Maaf, saya tidak mengerti', reply, f"Failed fallback on prompt: {bad_prompt}")
            self.assertIn('Mungkin kamu bisa coba bertanya tentang', reply)
