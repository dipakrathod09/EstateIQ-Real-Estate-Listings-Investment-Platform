from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from listings.models import Property, PropertyImage, Listing, InvestmentListing, Review

User = get_user_model()

class Command(BaseCommand):
    help = 'Clears all property listings, images, investments, reviews, and demo data from the database'

    def handle(self, *args, **kwargs):
        self.stdout.write("Clearing all property and listing data...")

        # Delete related child tables
        deleted_reviews, _ = Review.objects.all().delete()
        deleted_investments, _ = InvestmentListing.objects.all().delete()
        deleted_images, _ = PropertyImage.objects.all().delete()
        deleted_listings, _ = Listing.objects.all().delete()
        deleted_properties, _ = Property.objects.all().delete()

        # Delete demo agent user if exists
        User.objects.filter(username='demo_agent').delete()

        self.stdout.write(
            self.style.SUCCESS(
                f"Successfully removed demo data:\n"
                f" - {deleted_properties} Properties\n"
                f" - {deleted_listings} Listings\n"
                f" - {deleted_images} Property Images\n"
                f" - {deleted_investments} Investment Listings\n"
                f" - {deleted_reviews} Reviews"
            )
        )
