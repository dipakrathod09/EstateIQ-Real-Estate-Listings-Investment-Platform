from rest_framework import serializers
from listings.models import (
    Property, PropertyImage, Listing, Inquiry, SiteVisit, Favorite, SavedSearch, InvestmentListing, Review, RERAProject
)
from users.serializers import UserSerializer

class RERAProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = RERAProject
        fields = '__all__'

class PropertyImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyImage
        fields = ('id', 'image', 'image_url', 'order', 'is_primary')

class PropertySerializer(serializers.ModelSerializer):
    images = PropertyImageSerializer(many=True, read_only=True)
    primary_image = serializers.SerializerMethodField()
    rera_details = serializers.SerializerMethodField()

    class Meta:
        model = Property
        fields = '__all__'

    def get_primary_image(self, obj):
        primary = obj.images.filter(is_primary=True).first() or obj.images.first()
        if primary:
            if primary.image_url:
                return primary.image_url
            if primary.image:
                return primary.image.url
        return "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80"

    def get_rera_details(self, obj):
        if not obj.rera_number:
            return None
        project = RERAProject.objects.filter(rera_number__iexact=obj.rera_number).first()
        if project:
            return RERAProjectSerializer(project).data
        return None

class ListingSerializer(serializers.ModelSerializer):
    property = PropertySerializer(read_only=True)
    user = UserSerializer(read_only=True)

    class Meta:
        model = Listing
        fields = ('id', 'property', 'user', 'listing_type', 'status', 'admin_notes', 'is_verified', 'is_duplicate_flagged', 'created_at')

class CreatePropertyListingSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=255)
    description = serializers.CharField(required=False, allow_blank=True)
    city = serializers.CharField(max_length=100, default='Ahmedabad')
    sub_market = serializers.CharField(max_length=100, required=False, allow_blank=True)
    locality = serializers.CharField(max_length=150)
    property_type = serializers.ChoiceField(choices=Property.PropertyType.choices, default=Property.PropertyType.APARTMENT)
    bhk = serializers.IntegerField(default=2)
    area_sqft = serializers.FloatField()
    floor = serializers.IntegerField(default=0)
    total_floors = serializers.IntegerField(default=1)
    age_years = serializers.IntegerField(default=0)
    furnishing = serializers.ChoiceField(choices=Property.Furnishing.choices, default=Property.Furnishing.UNFURNISHED)
    facing = serializers.ChoiceField(choices=Property.Facing.choices, default=Property.Facing.EAST)
    price = serializers.DecimalField(max_digits=12, decimal_places=2)
    rera_number = serializers.CharField(max_length=100, required=False, allow_blank=True)
    listing_type = serializers.ChoiceField(choices=Listing.ListingType.choices, default=Listing.ListingType.BUY)
    
    # Amenities
    has_gym = serializers.BooleanField(default=False)
    has_pool = serializers.BooleanField(default=False)
    has_clubhouse = serializers.BooleanField(default=False)
    has_security = serializers.BooleanField(default=False)
    has_power_backup = serializers.BooleanField(default=False)
    has_parking = serializers.BooleanField(default=False)
    has_lift = serializers.BooleanField(default=False)
    image_urls = serializers.ListField(child=serializers.URLField(), required=False)

class InquirySerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Inquiry
        fields = '__all__'

class SiteVisitSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = SiteVisit
        fields = '__all__'

class FavoriteSerializer(serializers.ModelSerializer):
    property = PropertySerializer(read_only=True)

    class Meta:
        model = Favorite
        fields = '__all__'

class SavedSearchSerializer(serializers.ModelSerializer):
    class Meta:
        model = SavedSearch
        fields = '__all__'

class InvestmentListingSerializer(serializers.ModelSerializer):
    property = PropertySerializer(read_only=True)

    class Meta:
        model = InvestmentListing
        fields = '__all__'

class ReviewSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Review
        fields = '__all__'

class EMICalculatorSerializer(serializers.Serializer):
    loan_amount = serializers.FloatField()
    interest_rate = serializers.FloatField()
    tenure_years = serializers.IntegerField()

class StampDutyCalculatorSerializer(serializers.Serializer):
    state = serializers.CharField()
    property_value = serializers.FloatField()
    gender = serializers.CharField(default='male')

class LoanEligibilitySerializer(serializers.Serializer):
    monthly_income = serializers.FloatField()
    existing_emis = serializers.FloatField(default=0)
    tenure_years = serializers.IntegerField(default=20)
    interest_rate = serializers.FloatField(default=8.5)
