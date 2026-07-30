import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.test import TestCase, Client

class HealthCheckTest(TestCase):
    def test_health_check_endpoint(self):
        client = Client()
        response = client.get('/api/health/')
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "ok")
        self.assertEqual(data["service"], "EstateIQ Backend API")
