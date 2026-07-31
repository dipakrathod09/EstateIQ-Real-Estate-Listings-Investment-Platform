from django.db import models
from django.conf import settings

class Property(models.Model):
    class PropertyType(models.TextChoices):
        APARTMENT = 'Apartment', 'Apartment'
        INDEPENDENT_HOUSE = 'Independent House', 'Independent House'
        VILLA = 'Villa', 'Villa'
        PLOT = 'Plot', 'Plot'
        COMMERCIAL = 'Commercial', 'Commercial'

    class Furnishing(models.TextChoices):
        UNFURNISHED = 'Unfurnished', 'Unfurnished'
        SEMI_FURNISHED = 'Semi-Furnished', 'Semi-Furnished'
        FULLY_FURNISHED = 'Fully Furnished', 'Fully Furnished'

    class Facing(models.TextChoices):
        EAST = 'East', 'East'
        WEST = 'West', 'West'
        NORTH = 'North', 'North'
        SOUTH = 'South', 'South'
        NORTH_EAST = 'North-East', 'North-East'
        SOUTH_EAST = 'South-East', 'South-East'
        NORTH_WEST = 'North-West', 'North-West'
        SOUTH_WEST = 'South-West', 'South-West'

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    city = models.CharField(max_length=100, default='Ahmedabad', db_index=True)
    sub_market = models.CharField(max_length=100, blank=True, null=True, help_text="Sub-market or cluster area")
    locality = models.CharField(max_length=150, db_index=True)
    property_type = models.CharField(max_length=50, choices=PropertyType.choices, default=PropertyType.APARTMENT, db_index=True)
    bhk = models.IntegerField(default=2)
    area_sqft = models.FloatField(help_text="Total area in square feet")
    floor = models.IntegerField(default=0)
    total_floors = models.IntegerField(default=1)
    age_years = models.IntegerField(default=0)
    furnishing = models.CharField(max_length=30, choices=Furnishing.choices, default=Furnishing.UNFURNISHED)
    facing = models.CharField(max_length=20, choices=Facing.choices, default=Facing.EAST)
    price = models.DecimalField(max_digits=12, decimal_places=2, db_index=True)
    rera_number = models.CharField(max_length=100, blank=True, null=True, db_index=True)
    
    # Geocoding & Proximity
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    dist_metro_km = models.FloatField(null=True, blank=True)
    dist_school_km = models.FloatField(null=True, blank=True)
    dist_hospital_km = models.FloatField(null=True, blank=True)
    dist_it_hub_km = models.FloatField(null=True, blank=True)

    # Amenity Booleans
    has_gym = models.BooleanField(default=False)
    has_pool = models.BooleanField(default=False)
    has_clubhouse = models.BooleanField(default=False)
    has_security = models.BooleanField(default=False)
    has_power_backup = models.BooleanField(default=False)
    has_parking = models.BooleanField(default=False)
    has_lift = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Properties"
        indexes = [
            models.Index(fields=['city', 'property_type', 'price']),
            models.Index(fields=['locality', 'bhk']),
        ]

    def __str__(self):
        return f"{self.title} ({self.locality}, {self.city})"


class PropertyImage(models.Model):
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='property_images/', blank=True, null=True)
    image_url = models.URLField(blank=True, null=True, help_text="External URL or S3 URL")
    order = models.PositiveIntegerField(default=0)
    is_primary = models.BooleanField(default=False)

    class Meta:
        ordering = ['order', '-is_primary']

    def __str__(self):
        return f"Image for {self.property.title}"


class Listing(models.Model):
    class ListingType(models.TextChoices):
        BUY = 'buy', 'Buy'
        RENT = 'rent', 'Rent'

    class Status(models.TextChoices):
        DRAFT = 'draft', 'Draft'
        PENDING_REVIEW = 'pending_review', 'Pending Review'
        LIVE = 'live', 'Live'
        SOLD = 'sold', 'Sold'
        RENTED = 'rented', 'Rented'
        REJECTED = 'rejected', 'Rejected'

    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='listings')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='listings')
    listing_type = models.CharField(max_length=10, choices=ListingType.choices, default=ListingType.BUY)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT, db_index=True)
    admin_notes = models.TextField(blank=True)
    is_verified = models.BooleanField(default=False)
    is_duplicate_flagged = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Listing: {self.property.title} - {self.get_status_display()}"


class Inquiry(models.Model):
    class Status(models.TextChoices):
        NEW = 'new', 'New'
        CONTACTED = 'contacted', 'Contacted'
        CLOSED = 'closed', 'Closed'

    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name='inquiries')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='inquiries')
    name = models.CharField(max_length=150)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    message = models.TextField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.NEW)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Inquiry from {self.name} for {self.listing.property.title}"


class SiteVisit(models.Model):
    class Status(models.TextChoices):
        SCHEDULED = 'scheduled', 'Scheduled'
        COMPLETED = 'completed', 'Completed'
        CANCELLED = 'cancelled', 'Cancelled'

    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name='site_visits')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='site_visits')
    preferred_date = models.DateField()
    preferred_time = models.CharField(max_length=20)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.SCHEDULED)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"SiteVisit on {self.preferred_date} for {self.listing.property.title}"


class Favorite(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='favorites')
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='favorited_by')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'property')

    def __str__(self):
        return f"{self.user.username} favorited {self.property.title}"


class SavedSearch(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='saved_searches')
    title = models.CharField(max_length=150)
    query_params = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"SavedSearch '{self.title}' by {self.user.username}"


class InvestmentListing(models.Model):
    property = models.OneToOneField(Property, on_delete=models.CASCADE, related_name='investment_details')
    expected_roi_percentage = models.FloatField(help_text="Expected Annual ROI %")
    projected_rental_yield = models.FloatField(help_text="Projected Rental Yield %")
    min_investment_amount = models.DecimalField(max_digits=12, decimal_places=2)
    lock_in_period_months = models.IntegerField(default=12)
    is_pre_launch = models.BooleanField(default=False)
    early_access_ends_at = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Investment Details for {self.property.title}"


class Review(models.Model):
    class TargetType(models.TextChoices):
        PROPERTY = 'property', 'Property'
        BUILDER = 'builder', 'Builder'
        AGENT = 'agent', 'Agent'
        LOCALITY = 'locality', 'Locality'

    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending Review'
        APPROVED = 'approved', 'Approved'
        REJECTED = 'rejected', 'Rejected'

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reviews')
    target_type = models.CharField(max_length=20, choices=TargetType.choices, default=TargetType.PROPERTY)
    target_id = models.IntegerField(db_index=True)
    rating = models.IntegerField(default=5)
    comment = models.TextField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.APPROVED)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Review ({self.rating}/5) by {self.user.username} on {self.target_type} #{self.target_id}"


class Event(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    event_type = models.CharField(max_length=50, db_index=True, help_text="search, view, favorite, inquiry")
    properties_payload = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)


class RERAProject(models.Model):
    class RegistrationStatus(models.TextChoices):
        APPROVED = 'approved', 'Approved & Valid'
        DELAYED = 'delayed', 'Timeline Delayed'
        UNDER_REVIEW = 'under_review', 'Under Renewal / Review'
        REVOKED = 'revoked', 'Revoked / Blacklisted'

    rera_number = models.CharField(max_length=100, unique=True, db_index=True)
    state_authority = models.CharField(max_length=100, default='Gujarat RERA (GujRERA)')
    project_name = models.CharField(max_length=255)
    promoter_name = models.CharField(max_length=255)
    registration_status = models.CharField(max_length=30, choices=RegistrationStatus.choices, default=RegistrationStatus.APPROVED)
    compliance_score = models.IntegerField(default=95, help_text="RERA Trust Index Score 0-100")
    promised_completion_date = models.DateField(null=True, blank=True)
    revised_completion_date = models.DateField(null=True, blank=True)
    escrow_verified = models.BooleanField(default=True, help_text="70% Buyer Fund Escrow Account Verified")
    escrow_bank_name = models.CharField(max_length=150, default='HDFC Bank Ltd (Escrow Branch)')
    litigation_count = models.IntegerField(default=0, help_text="Active legal complaints count")
    approved_floors = models.IntegerField(default=15)
    total_units = models.IntegerField(default=120)
    official_portal_url = models.URLField(max_length=500, blank=True, null=True)
    document_url = models.URLField(max_length=500, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.project_name} ({self.rera_number}) - {self.compliance_score}/100"


