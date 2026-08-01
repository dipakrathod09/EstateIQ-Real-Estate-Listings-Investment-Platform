import random
from decimal import Decimal
from datetime import timedelta
from django.utils import timezone
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from listings.models import Property, PropertyImage, Listing, InvestmentListing, Review

User = get_user_model()

# Pinpoint High-Accuracy GPS Coordinates & Real Project Names for Metro Cities
REAL_LOCALITY_DATA = {
    'Ahmedabad': {
        'Bodakdev': {'lat': 23.0373, 'lng': 72.5117, 'psf': 7800, 'projects': ['Godrej Garden City', 'Shivalik Shilp', 'Venus Riviera']},
        'Satellite': {'lat': 23.0304, 'lng': 72.5178, 'psf': 7200, 'projects': ['Iscon Platinum', 'Shivalik Highstreet', 'Applewoods Villa']},
        'Prahlad Nagar': {'lat': 23.0130, 'lng': 72.5020, 'psf': 7500, 'projects': ['Venus Atlantis', 'Titanium Heights', 'Dev Corporate']},
        'Thaltej': {'lat': 23.0500, 'lng': 72.5075, 'psf': 8100, 'projects': ['Stavan Heights', 'Zaveri Crest', 'Sahajanand Enclave']},
        'GIFT City': {'lat': 23.1610, 'lng': 72.6845, 'psf': 9200, 'projects': ['GIFT One Tower', 'Brigade IFC Centre', 'Sobha Dream Acres']},
        'Vastrapur': {'lat': 23.0350, 'lng': 72.5290, 'psf': 6800, 'projects': ['Vastrapur Lake Residency', 'Alpha One Towers']},
        'Bopal': {'lat': 23.0330, 'lng': 72.4640, 'psf': 5400, 'projects': ['Aarohi Crest', 'South Bopal Trade Center']},
    },
    'Mumbai': {
        'Bandra West': {'lat': 19.0600, 'lng': 72.8290, 'psf': 42000, 'projects': ['Pali Hill Manor', 'Carter Road Residency', 'Perry Cross Enclave']},
        'Andheri West': {'lat': 19.1410, 'lng': 72.8270, 'psf': 26000, 'projects': ['Lokhandwala Heights', 'Oberoi Sky Heights', 'Four Bungalows Plaza']},
        'Powai': {'lat': 19.1197, 'lng': 72.9050, 'psf': 28500, 'projects': ['Hiranandani Gardens', 'Lake Homes Powai', 'Kanakia Silicon Valley']},
        'Worli': {'lat': 19.0176, 'lng': 72.8172, 'psf': 48000, 'projects': ['World One Towers', 'Worli Sea Face Residency', 'Lodha Park']},
        'Juhu': {'lat': 19.1075, 'lng': 72.8263, 'psf': 45000, 'projects': ['Juhu Beach Enclave', 'Gulmohar Grand Manor']},
        'Thane West': {'lat': 19.2183, 'lng': 72.9781, 'psf': 16500, 'projects': ['Rustomjee Urbania', 'Hiranandani Estate Thane']},
    },
    'Delhi NCR': {
        'DLF Phase 5': {'lat': 28.4480, 'lng': 77.0920, 'psf': 18500, 'projects': ['DLF The Aralias', 'DLF The Crest', 'Bani Square']},
        'Golf Course Road': {'lat': 28.4390, 'lng': 77.1060, 'psf': 21000, 'projects': ['M3M Golfestate', 'Central Park Resorts', 'Paras Quartier']},
        'Noida Sector 150': {'lat': 28.4410, 'lng': 77.4810, 'psf': 9500, 'projects': ['ATS Pristine', 'Godrej Nurture', 'Tata Eureka Park']},
        'Dwarka': {'lat': 28.5520, 'lng': 77.0580, 'psf': 11200, 'projects': ['Dwarka Heights Sector 21', 'DDA Golf View Apartments']},
    },
    'Bengaluru': {
        'Whitefield': {'lat': 12.9850, 'lng': 77.7320, 'psf': 9800, 'projects': ['Prestige Shantiniketan', 'Brigade Metropolis', 'Sobha Rose']},
        'Koramangala': {'lat': 12.9340, 'lng': 77.6240, 'psf': 14500, 'projects': ['Raheja Residency', 'Koramangala 4th Block Manor']},
        'HSR Layout': {'lat': 12.9120, 'lng': 77.6440, 'psf': 11500, 'projects': ['Sobha Evergreens', 'Purva Vantage']},
        'Sarjapur Road': {'lat': 12.9010, 'lng': 77.6870, 'psf': 8900, 'projects': ['Prestige Ferns Residency', 'Assetz 63 Degree East']},
    },
    'Pune': {
        'Baner': {'lat': 18.5590, 'lng': 73.7860, 'psf': 9200, 'projects': ['Kasturi Building Baner', 'Rohan Leher', 'VTP Alpine']},
        'Hinjewadi': {'lat': 18.5910, 'lng': 73.7380, 'psf': 7600, 'projects': ['Megapolis Hinjewadi', 'Paranjape Blue Ridge', 'Godrej Elements']},
        'Kharadi': {'lat': 18.5510, 'lng': 73.9520, 'psf': 8800, 'projects': ['Panchshil Towers Kharadi', 'Gera World of Joy']},
        'Koregaon Park': {'lat': 18.5360, 'lng': 73.8930, 'psf': 14000, 'projects': ['Koregaon Park Suites', 'Marvel Residency']},
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
    help = 'Seeds 75 realistic real estate properties with pinpoint GPS coordinates across 5 major Indian cities'

    def handle(self, *args, **kwargs):
        self.stdout.write("Seeding high-accuracy pinpoint GPS real estate demo listings...")

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
        for city, localities in REAL_LOCALITY_DATA.items():
            locality_names = list(localities.keys())
            for i in range(1, 16): # 15 properties per city = 75 total
                locality = locality_names[(i - 1) % len(locality_names)]
                loc_info = localities[locality]

                # Add tiny random GPS micro-offset (+-300 meters) so pins don't overlap exactly
                lat = round(loc_info['lat'] + random.uniform(-0.0035, 0.0035), 6)
                lng = round(loc_info['lng'] + random.uniform(-0.0035, 0.0035), 6)

                bhk = random.choice([2, 3, 4, 5])
                area = bhk * random.randint(450, 600)
                psf = loc_info['psf'] + random.randint(-400, 400)
                price = Decimal(str(int(area * psf)))

                project_name = random.choice(loc_info['projects'])
                rera_state = "GJ" if city == "Ahmedabad" else ("MH" if city in ["Mumbai", "Pune"] else "DL")
                rera_num = f"PR/{rera_state}/{city.upper().replace(' ', '_')}/{random.randint(10000, 99999)}/2026"
                prop_type = random.choices([p[0] for p in PROPERTY_TYPES], [p[1] for p in PROPERTY_TYPES])[0]

                prop = Property.objects.create(
                    title=f"{bhk} BHK Luxury {prop_type} at {project_name}",
                    description=f"Spacious {bhk} BHK {prop_type} situated in prime {locality}, {city} near {project_name}. Features modern architecture, 24/7 security, club amenities, and direct access to transit hubs.",
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
                    dist_metro_km=round(random.uniform(0.5, 3.5), 1),
                    dist_school_km=round(random.uniform(0.3, 2.0), 1),
                    dist_hospital_km=round(random.uniform(0.5, 2.5), 1),
                    dist_it_hub_km=round(random.uniform(1.0, 5.0), 1),
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
                    comment=f"Excellent property structure at {project_name} in prime {locality}, {city}. Great investment value!",
                    status=Review.Status.APPROVED
                )

                created_count += 1

        self.stdout.write(self.style.SUCCESS(f"Successfully seeded {created_count} high-precision real location listings across all 5 launch cities!"))
