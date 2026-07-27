import random
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from listings.models import Property, PropertyImage, Listing, InvestmentListing

User = get_user_model()

LOCALITIES = [
    'Bodakdev', 'Satellite', 'Prahlad Nagar', 'Thaltej', 'Vastrapur',
    'SG Highway', 'Science City', 'Bopal', 'South Bopal', 'Vaishno Devi Circle',
    'Shela', 'Ambli', 'GIFT City', 'Navrangpura', 'CG Road'
]

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
    help = 'Seeds 50 realistic Ahmedabad real estate properties & listings'

    def handle(self, *args, **kwargs):
        self.stdout.write("Seeding Ahmedabad real estate demo listings...")

        # Ensure demo owner user exists
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
        for i in range(1, 51):
            locality = random.choice(LOCALITIES)
            bhk = random.choice([2, 3, 4, 5])
            area = bhk * random.randint(450, 600)
            
            # Base price per sqft in Ahmedabad prime localities (₹4,500 to ₹9,500 / sqft)
            price_per_sqft = random.randint(4800, 9200)
            price = Decimal(str(int(area * price_per_sqft)))

            rera_num = f"PR/GJ/AHMEDABAD/{random.randint(10000, 99999)}/2026"
            prop_type = random.choices([p[0] for p in PROPERTY_TYPES], [p[1] for p in PROPERTY_TYPES])[0]

            prop = Property.objects.create(
                title=f"{bhk} BHK Premium {prop_type} in {locality}",
                description=f"Spacious and elegant {bhk} BHK {prop_type} located in prime {locality}, Ahmedabad. Close to SG Highway, top international schools, and metro station. Features 24/7 security, covered parking, and club amenities.",
                city='Ahmedabad',
                sub_market='Ahmedabad West' if locality in ['Bodakdev', 'Satellite', 'Thaltej', 'Vastrapur'] else 'Ahmedabad Outer',
                locality=locality,
                property_type=prop_type,
                bhk=bhk,
                area_sqft=area,
                floor=random.randint(1, 14),
                total_floors=15,
                age_years=random.randint(0, 5),
                furnishing=random.choice([Property.Furnishing.UNFURNISHED, Property.Furnishing.SEMI_FURNISHED, Property.Furnishing.FULLY_FURNISHED]),
                facing=random.choice([Property.Facing.EAST, Property.Facing.NORTH_EAST, Property.Facing.NORTH]),
                price=price,
                rera_number=rera_num,
                has_gym=random.choice([True, False]),
                has_pool=random.choice([True, False]),
                has_security=True,
                has_power_backup=True,
                has_parking=True,
                has_lift=True,
            )

            # Create primary image
            PropertyImage.objects.create(
                property=prop,
                image_url=random.choice(IMAGES),
                order=0,
                is_primary=True
            )

            # Create Listing
            Listing.objects.create(
                property=prop,
                user=demo_user,
                listing_type=random.choice([Listing.ListingType.BUY, Listing.ListingType.RENT]),
                status=Listing.Status.LIVE,
                is_verified=True
            )

            # Create Investment details for select properties
            if i % 5 == 0:
                InvestmentListing.objects.create(
                    property=prop,
                    expected_roi_percentage=round(random.uniform(9.5, 14.5), 1),
                    projected_rental_yield=round(random.uniform(6.2, 8.8), 1),
                    min_investment_amount=Decimal('2500000.00'),
                    lock_in_period_months=12,
                    is_active=True
                )

            created_count += 1

        self.stdout.write(self.style.SUCCESS(f"Successfully seeded {created_count} realistic Ahmedabad listings!"))
