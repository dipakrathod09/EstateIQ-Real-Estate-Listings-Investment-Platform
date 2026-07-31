import os
import django
from decimal import Decimal

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.test import TestCase, Client
from django.contrib.auth import get_user_model
from listings.models import Property, Listing, InvestmentListing

User = get_user_model()

class ListingsAPITestCase(TestCase):
    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(
            username='test_agent',
            email='test_agent@estateiq.com',
            phone_number='+919999988888',
            role=User.Role.AGENT
        )
        self.prop = Property.objects.create(
            title='3 BHK Test Luxury Flat',
            description='Test property description',
            city='Ahmedabad',
            locality='Bodakdev',
            property_type='Apartment',
            bhk=3,
            area_sqft=1800,
            price=Decimal('9500000.00'),
            latitude=23.03,
            longitude=72.51
        )
        self.listing = Listing.objects.create(
            property=self.prop,
            user=self.user,
            listing_type=Listing.ListingType.BUY,
            status=Listing.Status.LIVE,
            is_verified=True
        )
        InvestmentListing.objects.create(
            property=self.prop,
            expected_roi_percentage=12.5,
            projected_rental_yield=7.2,
            min_investment_amount=Decimal('2500000.00'),
            is_pre_launch=True,
            is_active=True
        )

    def test_list_listings_api(self):
        response = self.client.get('/api/listings/')
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertGreaterEqual(len(data), 1)
        titles = [item['property']['title'] for item in data]
        self.assertIn('3 BHK Test Luxury Flat', titles)

    def test_listing_detail_api(self):
        response = self.client.get(f'/api/listings/{self.listing.id}/')
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data['property']['locality'], 'Bodakdev')
        self.assertEqual(data['property']['price'], '9500000.00')

    def test_ml_valuation_api(self):
        response = self.client.get(f'/api/listings/{self.listing.id}/valuation/')
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn('predicted_price', data)
        self.assertIn('deal_tag', data)
        self.assertEqual(data['status'], 'success')

    def test_predict_custom_price_api(self):
        payload = {
            "city": "Mumbai",
            "locality": "Bandra West",
            "bhk": 3,
            "area_sqft": 1800,
            "property_type": "Apartment",
            "listed_price": 40000000
        }
        response = self.client.post('/api/predict-price/', data=payload, content_type='application/json')
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn('predicted_price', data)
        self.assertEqual(data['currency'], 'INR')
        self.assertIn('deal_tag', data)

    def test_locality_heatmap_api(self):
        response = self.client.get('/api/localities/heatmap/')
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIsInstance(data, list)
        self.assertGreater(len(data), 0)
        self.assertIn('city', data[0])
        self.assertIn('locality', data[0])

    def test_rera_lookup_api(self):
        response = self.client.get('/api/rera/lookup/?rera_number=PR/GJ/AHMEDABAD/10293/2026')
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn('compliance_score', data)
        self.assertIn('official_portal_url', data)
        self.assertIn('Gujarat RERA', data['state_authority'])

    def test_specific_gujrera_full_number(self):
        full_num = 'PR/GJ/AHMEDABAD/AHMEDABAD CITY/AUDA/RAA05186/EX1/171219'
        response = self.client.get(f'/api/rera/lookup/?rera_number={full_num}')
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data['state_authority'], 'Gujarat RERA (GujRERA)')
        self.assertEqual(data['official_portal_url'], 'https://gujrera.gujarat.gov.in/projectSearch')
