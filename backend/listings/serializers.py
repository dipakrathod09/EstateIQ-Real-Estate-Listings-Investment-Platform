from rest_framework import serializers
from listings.models import (
    Property, PropertyImage, Listing, Inquiry, SiteVisit, Favorite, SavedSearch, InvestmentListing, Review
)
from users.serializers import UserSerializer

class PropertyImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyImage
        fields = ('id', 'image', 'image_url', 'order', 'is_primary')

class PropertySerializer(serializers.ModelSerializer):
    images = PropertyImageSerializer(many=True, read_only=True)
    primary_image = serializers.SerializerMethodField()


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
    
    # Optional image URLs array
    image_urls = serializers.ListField(child=serializers.URLField(), required=False)

class InquirySerializer(serializers.ModelSerializer):
    class Meta:
        model = Inquiry
        fields = ('id', 'listing', 'name', 'email', 'phone', 'message', 'status', 'created_at')

class SiteVisitSerializer(serializers.ModelSerializer):
    listing_details = ListingSerializer(source='listing', read_only=True)

    class Meta:
        model = SiteVisit
        fields = ('id', 'listing', 'listing_details', 'preferred_date', 'preferred_time', 'status', 'created_at')
        read_only_fields = ('id', 'status', 'created_at')

class FavoriteSerializer(serializers.ModelSerializer):
    property = PropertySerializer(read_only=True)

    class Meta:
        model = Favorite
        fields = ('id', 'property', 'created_at')

class SavedSearchSerializer(serializers.ModelSerializer):
    class Meta:
        model = SavedSearch
        fields = ('id', 'title', 'query_params', 'created_at')

class InvestmentListingSerializer(serializers.ModelSerializer):
    property = PropertySerializer(read_only=True)

    class Meta:
        model = InvestmentListing
        fields = ('id', 'property', 'expected_roi_percentage', 'projected_rental_yield', 'min_investment_amount', 'lock_in_period_months', 'is_pre_launch', 'early_access_ends_at', 'is_active', 'created_at')


class ReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)

    class Meta:
        model = Review
        fields = ('id', 'user', 'user_name', 'target_type', 'target_id', 'rating', 'comment', 'status', 'created_at')
        read_only_fields = ('id', 'user', 'user_name', 'status', 'created_at')

# Calculator Serializers
class EMICalculatorSerializer(serializers.Serializer):
    loan_amount = serializers.FloatField(min_value=10000)
    interest_rate = serializers.FloatField(min_value=0.1, max_value=30.0)
    tenure_years = serializers.IntegerField(min_value=1, max_value=30)

class StampDutyCalculatorSerializer(serializers.Serializer):
    state = serializers.CharField(max_length=50)
    property_value = serializers.FloatField(min_value=10000)
    gender = serializers.ChoiceField(choices=['male', 'female', 'joint'], default='male')

class LoanEligibilitySerializer(serializers.Serializer):
    monthly_income = serializers.FloatField(min_value=10000)
    existing_emis = serializers.FloatField(default=0.0)
    tenure_years = serializers.IntegerField(default=20)
    interest_rate = serializers.FloatField(default=8.5)
