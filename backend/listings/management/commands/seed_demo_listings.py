import random
from decimal import Decimal
from datetime import timedelta
from django.utils import timezone
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from listings.models import Property, PropertyImage, Listing, InvestmentListing, Review, RERAProject

User = get_user_model()

CITY_DATA = {
    'Ahmedabad': {
        'lat_range': (22.95, 23.10),
        'lng_range': (72.50, 72.65),
        'psf_range': (5200, 9500),
        'localities': ['Bodakdev', 'Satellite', 'Prahlad Nagar', 'Thaltej', 'Vastrapur', 'SG Highway', 'GIFT City', 'Bopal']
    },
    'Mumbai': {
        'lat_range': (18.95, 19.25),
        'lng_range': (72.80, 72.95),
        'psf_range': (22000, 48000),
        'localities': ['Bandra West', 'Andheri West', 'Juhu', 'Powai', 'Worli', 'Lower Parel', 'Thane West', 'Vashi']
    },
    'Delhi NCR': {
        'lat_range': (28.40, 28.70),
        'lng_range': (77.00, 77.35),
        'psf_range': (9500, 24000),
        'localities': ['DLF Phase 5', 'Golf Course Road', 'Gurgaon Sector 49', 'Dwarka', 'Noida Sector 150', 'Vasant Kunj']
    },
    'Bengaluru': {
        'lat_range': (12.85, 13.05),
        'lng_range': (77.55, 77.75),
        'psf_range': (8500, 16500),
        'localities': ['Whitefield', 'Sarjapur Road', 'Electronic City', 'Koramangala', 'HSR Layout', 'Indiranagar']
    },
    'Pune': {
        'lat_range': (18.45, 18.65),
        'lng_range': (73.75, 73.95),
        'psf_range': (7500, 14000),
        'localities': ['Baner', 'Hinjewadi', 'Kharadi', 'Wakad', 'Aundh', 'Koregaon Park', 'Viman Nagar']
    }
}

PROPERTY_TYPES = [
    (Property.PropertyType.APARTMENT, 0.65),
    (Property.PropertyType.VILLA, 0.15),
    (Property.PropertyType.INDEPENDENT_HOUSE, 0.10),
    (Property.PropertyType.COMMERCIAL, 0.10),
]

IMAGES = [
    'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=800&q=80',
]

class Command(BaseCommand):
    help = 'Seeds 75 realistic real estate properties & listings across 5 major Indian cities'

    def handle(self, *args, **kwargs):
        self.stdout.write("Seeding 5-city real estate demo listings...")

        demo_user, _ = User.objects.get_or_create(
            username='demo_agent',
            defaults={
                'email': 'agent@estateiq.com',
                'role': User.Role.AGENT,
                'phone_number': '+919876543210',
                'is_phone_verified': True
            }
        )

        created_count = 0
        for city, info in CITY_DATA.items():
            for i in range(1, 16): # 15 listings per city = 75 listings total
                locality = random.choice(info['localities'])
                bhk = random.choice([2, 3, 4, 5])
                area = bhk * random.randint(450, 600)
                
                psf = random.randint(info['psf_range'][0], info['psf_range'][1])
                price = Decimal(str(int(area * psf)))

                lat = round(random.uniform(info['lat_range'][0], info['lat_range'][1]), 6)
                lng = round(random.uniform(info['lng_range'][0], info['lng_range'][1]), 6)

                rera_state = "GJ" if city == "Ahmedabad" else ("MH" if city in ["Mumbai", "Pune"] else "DL")
                rera_num = f"PR/{rera_state}/{city.upper().replace(' ', '_')}/{random.randint(10000, 99999)}/2026"
                
                authority_name = "Gujarat RERA (GujRERA)" if rera_state == "GJ" else ("Maharashtra RERA (MahaRERA)" if rera_state == "MH" else "Delhi/NCR RERA")
                portal_url = "https://gujrera.gujarat.gov.in/projectSearch" if rera_state == "GJ" else ("https://maharerait.mahaonline.gov.in/SearchList/Search" if rera_state == "MH" else "https://haryanarera.gov.in")

                RERAProject.objects.get_or_create(
                    rera_number=rera_num,
                    defaults={
                        'state_authority': authority_name,
                        'project_name': f"{locality} Skyline Enclave",
                        'promoter_name': f"{city} Apex Infrastructure Developers Ltd",
                        'registration_status': RERAProject.RegistrationStatus.APPROVED,
                        'compliance_score': random.randint(92, 99),
                        'escrow_verified': True,
                        'escrow_bank_name': 'HDFC Bank RERA Escrow Account',
                        'litigation_count': 0,
                        'approved_floors': 22,
                        'total_units': 160,
                        'official_portal_url': portal_url,
                        'document_url': portal_url
                    }
                )

                prop_type = random.choices([p[0] for p in PROPERTY_TYPES], [p[1] for p in PROPERTY_TYPES])[0]

                prop = Property.objects.create(
                    title=f"{bhk} BHK Premium {prop_type} in {locality}",
                    description=f"Luxury {bhk} BHK {prop_type} situated in prime {locality}, {city}. Features state-of-the-art architecture, 24/7 security, club amenities, and excellent connectivity to major transit hubs.",
                    city=city,
                    sub_market=f"{city} Central",
                    locality=locality,
                    property_type=prop_type,
                    bhk=bhk,
                    area_sqft=area,
                    floor=random.randint(1, 18),
                    total_floors=20,
                    age_years=random.randint(0, 4),
                    furnishing=random.choice([Property.Furnishing.UNFURNISHED, Property.Furnishing.SEMI_FURNISHED, Property.Furnishing.FULLY_FURNISHED]),
                    facing=random.choice([Property.Facing.EAST, Property.Facing.NORTH_EAST, Property.Facing.NORTH]),
                    price=price,
                    rera_number=rera_num,
                    latitude=lat,
                    longitude=lng,
                    dist_metro_km=round(random.uniform(0.5, 4.0), 1),
                    dist_school_km=round(random.uniform(0.3, 2.5), 1),
                    dist_hospital_km=round(random.uniform(0.5, 3.0), 1),
                    dist_it_hub_km=round(random.uniform(1.0, 6.0), 1),
                    has_gym=random.choice([True, False]),
                    has_pool=random.choice([True, False]),
                    has_clubhouse=True,
                    has_security=True,
                    has_power_backup=True,
                    has_parking=True,
                    has_lift=True,
                )

                # Primary & gallery images
                PropertyImage.objects.create(
                    property=prop,
                    image_url=random.choice(IMAGES),
                    order=0,
                    is_primary=True
                )
                PropertyImage.objects.create(
                    property=prop,
                    image_url=random.choice(IMAGES),
                    order=1,
                    is_primary=False
                )

                # Listing
                listing_obj = Listing.objects.create(
                    property=prop,
                    user=demo_user,
                    listing_type=random.choice([Listing.ListingType.BUY, Listing.ListingType.RENT]),
                    status=Listing.Status.LIVE,
                    is_verified=True
                )

                # Investment Listing (1 out of every 3)
                if (created_count % 3) == 0:
                    is_pre = (created_count % 6) == 0
                    InvestmentListing.objects.create(
                        property=prop,
                        expected_roi_percentage=round(random.uniform(9.0, 15.5), 1),
                        projected_rental_yield=round(random.uniform(6.0, 8.9), 1),
                        min_investment_amount=Decimal('2500000.00'),
                        lock_in_period_months=12,
                        is_pre_launch=is_pre,
                        early_access_ends_at=timezone.now() + timedelta(days=14) if is_pre else None,
                        is_active=True
                    )

                # Seed sample review
                Review.objects.create(
                    user=demo_user,
                    target_type=Review.TargetType.PROPERTY,
                    target_id=prop.id,
                    rating=random.choice([4, 5]),
                    comment=f"Excellent property structure and prime location in {locality}, {city}. Great investment value!",
                    status=Review.Status.APPROVED
                )

                created_count += 1

        self.stdout.write(self.style.SUCCESS(f"Successfully seeded {created_count} listings across all 5 launch cities!"))
