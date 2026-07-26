import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.test import Client

def test_health_check_endpoint():
    client = Client()
    response = client.get('/api/health/')
    assert response.status_code == 200
    data = response.json() if hasattr(response, 'json') else response.data
    assert data["status"] == "ok"
    assert data["service"] == "EstateIQ Backend API"
