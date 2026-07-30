import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.test import TestCase, Client

class CalculatorsAPITestCase(TestCase):
    def setUp(self):
        self.client = Client()

    def test_emi_calculator_api(self):
        payload = {
            "loan_amount": 5000000,
            "interest_rate": 8.5,
            "tenure_years": 20
        }
        response = self.client.post('/api/calculators/emi/', data=payload, content_type='application/json')
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn(round(data['monthly_emi']), [43391, 43392])
        self.assertGreater(data['total_payment'], 5000000)

    def test_stamp_duty_calculator_api(self):
        payload = {
            "state": "Gujarat",
            "property_value": 8500000,
            "gender": "male"
        }
        response = self.client.post('/api/calculators/stamp-duty/', data=payload, content_type='application/json')
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data['stamp_duty_percentage'], 4.9)
        self.assertEqual(data['stamp_duty_amount'], 416500.0)

    def test_loan_eligibility_calculator_api(self):
        payload = {
            "monthly_income": 120000,
            "existing_emis": 15000,
            "tenure_years": 20,
            "interest_rate": 8.5
        }
        response = self.client.post('/api/calculators/loan-eligibility/', data=payload, content_type='application/json')
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data['max_affordable_emi'], 45000.0)
        self.assertGreater(data['max_eligible_loan'], 0)
