from django.test import TestCase, Client
from django.contrib.auth.models import User
from .models import UserProfile
import json


class AuthenticationTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.test_user_data = {
            'email': 'test@example.com',
            'password': 'testpassword123',
            'full_name': 'Test User'
        }

    def test_register_success(self):
        """Test successful user registration"""
        response = self.client.post('/auth/api/register/', 
            json.dumps({
                'full_name': self.test_user_data['full_name'],
                'email': self.test_user_data['email'],
                'password': self.test_user_data['password'],
                'confirm_password': self.test_user_data['password']
            }),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)
        self.assertEqual(data['status'], 'success')
        
        user = User.objects.get(email=self.test_user_data['email'])
        self.assertIsNotNone(user)
        
       
        profile = UserProfile.objects.get(user=user)
        self.assertEqual(profile.full_name, self.test_user_data['full_name'])

    def test_register_password_too_short(self):
        """Test registration with password less than 8 characters"""
        response = self.client.post('/auth/api/register/',
            json.dumps({
                'full_name': 'Test User',
                'email': 'test@example.com',
                'password': 'short',
                'confirm_password': 'short'
            }),
            content_type='application/json'
        )
        
        data = json.loads(response.content)
        self.assertEqual(data['status'], 'error')
        self.assertIn('minimal 8 karakter', data['message'])

    def test_register_passwords_not_matching(self):
        """Test registration with non-matching passwords"""
        response = self.client.post('/auth/api/register/',
            json.dumps({
                'full_name': 'Test User',
                'email': 'test@example.com',
                'password': 'password123',
                'confirm_password': 'password456'
            }),
            content_type='application/json'
        )
        
        data = json.loads(response.content)
        self.assertEqual(data['status'], 'error')
        self.assertIn('tidak cocok', data['message'])

    def test_register_duplicate_email(self):
        """Test registration with existing email"""
    
        User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
      
        response = self.client.post('/auth/api/register/',
            json.dumps({
                'full_name': 'Test User',
                'email': 'test@example.com',
                'password': 'password123',
                'confirm_password': 'password123'
            }),
            content_type='application/json'
        )
        
        data = json.loads(response.content)
        self.assertEqual(data['status'], 'error')
        self.assertIn('sudah terdaftar', data['message'])

    def test_login_success(self):
        """Test successful login"""
   
        User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
        response = self.client.post('/auth/api/login/',
            json.dumps({
                'email': 'test@example.com',
                'password': 'testpass123'
            }),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)
        self.assertEqual(data['status'], 'success')

    def test_login_wrong_password(self):
        """Test login with wrong password"""
       
        User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
        response = self.client.post('/auth/api/login/',
            json.dumps({
                'email': 'test@example.com',
                'password': 'wrongpass'
            }),
            content_type='application/json'
        )
        
        data = json.loads(response.content)
        self.assertEqual(data['status'], 'error')
        self.assertIn('email atau password salah', data['message'])

    def test_login_nonexistent_email(self):
        """Test login with non-existent email"""
        response = self.client.post('/auth/api/login/',
            json.dumps({
                'email': 'nonexistent@example.com',
                'password': 'testpass123'
            }),
            content_type='application/json'
        )
        
        data = json.loads(response.content)
        self.assertEqual(data['status'], 'error')
        self.assertIn('tidak terdaftar', data['message'])

