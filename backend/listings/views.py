from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q
from decimal import Decimal

from listings.models import (
    Property, PropertyImage, Listing, Inquiry, SiteVisit, Favorite, SavedSearch, InvestmentListing
)
from listings.serializers import (
    PropertySerializer, ListingSerializer, CreatePropertyListingSerializer,
    InquirySerializer, SiteVisitSerializer, FavoriteSerializer, SavedSearchSerializer,
    InvestmentListingSerializer, EMICalculatorSerializer, StampDutyCalculatorSerializer, LoanEligibilitySerializer
)

@api_view(['GET'])
@permission_classes([AllowAny])
def list_listings(request):
    """
    Public paginated list & search for property listings.
    Supports filtering by city, locality, property_type, bhk, price range, rera_verified.
    """
    queryset = Listing.objects.filter(status=Listing.Status.LIVE).select_related('property', 'user')

    city = request.query_params.get('city')
    if city:
        queryset = queryset.filter(property__city__iexact=city)

    locality = request.query_params.get('locality')
    if locality:
        queryset = queryset.filter(property__locality__icontains=locality)

    property_type = request.query_params.get('property_type')
    if property_type:
        queryset = queryset.filter(property__property_type__iexact=property_type)

    bhk = request.query_params.get('bhk')
    if bhk:
        queryset = queryset.filter(property__bhk=int(bhk))

    min_price = request.query_params.get('min_price')
    if min_price:
        queryset = queryset.filter(property__price__gte=Decimal(min_price))

    max_price = request.query_params.get('max_price')
    if max_price:
        queryset = queryset.filter(property__price__lte=Decimal(max_price))

    listing_type = request.query_params.get('listing_type')
    if listing_type:
        queryset = queryset.filter(listing_type=listing_type)

    is_verified = request.query_params.get('is_verified')
    if is_verified:
        queryset = queryset.filter(is_verified=(is_verified.lower() == 'true'))

    search = request.query_params.get('search')
    if search:
        queryset = queryset.filter(
            Q(property__title__icontains=search) |
            Q(property__locality__icontains=search) |
            Q(property__city__icontains=search) |
            Q(property__description__icontains=search)
        )

    serializer = ListingSerializer(queryset, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_listing_detail(request, pk):
    """
    Public endpoint for detailed property listing information.
    """
    try:
        listing = Listing.objects.select_related('property', 'user').get(pk=pk)
        serializer = ListingSerializer(listing)
        return Response(serializer.data)
    except Listing.DoesNotExist:
        return Response({"error": "Listing not found"}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_listing(request):
    """
    Creates a new property and listing. Includes duplicate detection check.
    If same locality + area +-5% + price +-5% exists -> flags for admin review.
    """
    serializer = CreatePropertyListingSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    data = serializer.validated_data
    price = Decimal(str(data['price']))
    area = float(data['area_sqft'])

    # Duplicate listing detection algorithm
    min_area, max_area = area * 0.95, area * 1.05
    min_price, max_price = price * Decimal('0.95'), price * Decimal('1.05')

    duplicate_exists = Property.objects.filter(
        locality__iexact=data['locality'],
        area_sqft__gte=min_area,
        area_sqft__lte=max_area,
        price__gte=min_price,
        price__lte=max_price
    ).exists()

    property_obj = Property.objects.create(
        title=data['title'],
        description=data.get('description', ''),
        city=data.get('city', 'Ahmedabad'),
        sub_market=data.get('sub_market', ''),
        locality=data['locality'],
        property_type=data.get('property_type', Property.PropertyType.APARTMENT),
        bhk=data.get('bhk', 2),
        area_sqft=area,
        floor=data.get('floor', 0),
        total_floors=data.get('total_floors', 1),
        age_years=data.get('age_years', 0),
        furnishing=data.get('furnishing', Property.Furnishing.UNFURNISHED),
        facing=data.get('facing', Property.Facing.EAST),
        price=price,
        rera_number=data.get('rera_number', ''),
        has_gym=data.get('has_gym', False),
        has_pool=data.get('has_pool', False),
        has_clubhouse=data.get('has_clubhouse', False),
        has_security=data.get('has_security', False),
        has_power_backup=data.get('has_power_backup', False),
        has_parking=data.get('has_parking', False),
        has_lift=data.get('has_lift', False),
    )

    # Attach images if provided
    image_urls = data.get('image_urls', [])
    for idx, url in enumerate(image_urls):
        PropertyImage.objects.create(
            property=property_obj,
            image_url=url,
            order=idx,
            is_primary=(idx == 0)
        )

    has_rera = bool(data.get('rera_number', '').strip())
    initial_status = Listing.Status.PENDING_REVIEW if not duplicate_exists else Listing.Status.DRAFT

    listing_obj = Listing.objects.create(
        property=property_obj,
        user=request.user,
        listing_type=data.get('listing_type', Listing.ListingType.BUY),
        status=initial_status,
        is_verified=has_rera,
        is_duplicate_flagged=duplicate_exists,
        admin_notes="Flagged for duplicate property review" if duplicate_exists else ""
    )

    return Response({
        "message": "Property listing created successfully",
        "listing": ListingSerializer(listing_obj).data,
        "duplicate_flagged": duplicate_exists
    }, status=status.HTTP_201_CREATED)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def moderate_listing(request, pk):
    """
    Admin moderation endpoint to approve (LIVE) or reject listings.
    """
    if request.user.role != 'admin' and not request.user.is_staff:
        return Response({"error": "Admin permission required"}, status=status.HTTP_403_FORBIDDEN)

    try:
        listing = Listing.objects.get(pk=pk)
        new_status = request.data.get('status')
        admin_notes = request.data.get('admin_notes', '')

        if new_status in [Listing.Status.LIVE, Listing.Status.REJECTED, Listing.Status.SOLD, Listing.Status.RENTED]:
            listing.status = new_status
            if new_status == Listing.Status.LIVE:
                listing.is_verified = True
            if admin_notes:
                listing.admin_notes = admin_notes
            listing.save()
            return Response(ListingSerializer(listing).data)
        return Response({"error": "Invalid status value"}, status=status.HTTP_400_BAD_REQUEST)
    except Listing.DoesNotExist:
        return Response({"error": "Listing not found"}, status=status.HTTP_404_NOT_FOUND)


# ==========================================
# INQUIRIES & SITE VISITS
# ==========================================

@api_view(['POST', 'GET'])
@permission_classes([AllowAny])
def handle_inquiries(request):
    if request.method == 'POST':
        serializer = InquirySerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        inquiry = serializer.save(user=request.user if request.user.is_authenticated else None)
        return Response(InquirySerializer(inquiry).data, status=status.HTTP_201_CREATED)
    
    if not request.user.is_authenticated:
        return Response({"error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)
    
    inquiries = Inquiry.objects.filter(listing__user=request.user)
    return Response(InquirySerializer(inquiries, many=True).data)


@api_view(['POST', 'GET'])
@permission_classes([IsAuthenticated])
def handle_site_visits(request):
    if request.method == 'POST':
        serializer = SiteVisitSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        visit = serializer.save(user=request.user)
        return Response(SiteVisitSerializer(visit).data, status=status.HTTP_201_CREATED)

    visits = SiteVisit.objects.filter(user=request.user)
    return Response(SiteVisitSerializer(visits, many=True).data)


# ==========================================
# FAVORITES & SAVED SEARCHES
# ==========================================

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def handle_favorites(request):
    if request.method == 'POST':
        property_id = request.data.get('property_id')
        try:
            property_obj = Property.objects.get(pk=property_id)
            fav, created = Favorite.objects.get_or_create(user=request.user, property=property_obj)
            return Response({"message": "Favorited successfully", "created": created})
        except Property.DoesNotExist:
            return Response({"error": "Property not found"}, status=status.HTTP_404_NOT_FOUND)

    favorites = Favorite.objects.filter(user=request.user).select_related('property')
    return Response(FavoriteSerializer(favorites, many=True).data)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_favorite(request, property_id):
    Favorite.objects.filter(user=request.user, property_id=property_id).delete()
    return Response({"message": "Favorite removed"})


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def handle_saved_searches(request):
    if request.method == 'POST':
        serializer = SavedSearchSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        saved = serializer.save(user=request.user)
        return Response(SavedSearchSerializer(saved).data, status=status.HTTP_201_CREATED)

    searches = SavedSearch.objects.filter(user=request.user)
    return Response(SavedSearchSerializer(searches, many=True).data)


# ==========================================
# CALCULATORS API
# ==========================================

@api_view(['POST'])
@permission_classes([AllowAny])
def emi_calculator(request):
    serializer = EMICalculatorSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    p = serializer.validated_data['loan_amount']
    annual_rate = serializer.validated_data['interest_rate']
    tenure_years = serializer.validated_data['tenure_years']

    r = (annual_rate / 12) / 100
    n = tenure_years * 12

    emi = (p * r * ((1 + r) ** n)) / (((1 + r) ** n) - 1)
    total_payment = emi * n
    total_interest = total_payment - p

    return Response({
        "monthly_emi": round(emi, 2),
        "total_interest": round(total_interest, 2),
        "total_payment": round(total_payment, 2),
        "principal": p
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def stamp_duty_calculator(request):
    serializer = StampDutyCalculatorSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    state = serializer.validated_data['state'].lower().strip()
    val = serializer.validated_data['property_value']
    gender = serializer.validated_data['gender']

    # State Lookup Table Rates
    state_rates = {
        'gujarat': {'male': 4.9, 'female': 4.9, 'joint': 4.9, 'registration': 1.0},
        'maharashtra': {'male': 5.0, 'female': 4.0, 'joint': 4.5, 'registration': 1.0},
        'delhi': {'male': 6.0, 'female': 4.0, 'joint': 5.0, 'registration': 1.0},
        'karnataka': {'male': 5.0, 'female': 5.0, 'joint': 5.0, 'registration': 1.0},
        'haryana': {'male': 7.0, 'female': 5.0, 'joint': 6.0, 'registration': 1.0},
    }

    rates = state_rates.get(state, state_rates['gujarat'])
    stamp_rate = rates.get(gender, rates['male'])
    reg_rate = rates['registration']

    stamp_duty_amount = (val * stamp_rate) / 100.0
    registration_fee = (val * reg_rate) / 100.0

    return Response({
        "state": state.capitalize(),
        "property_value": val,
        "stamp_duty_percentage": stamp_rate,
        "stamp_duty_amount": round(stamp_duty_amount, 2),
        "registration_fee": round(registration_fee, 2),
        "total_tax": round(stamp_duty_amount + registration_fee, 2)
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def loan_eligibility_calculator(request):
    serializer = LoanEligibilitySerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    income = serializer.validated_data['monthly_income']
    existing_emis = serializer.validated_data['existing_emis']
    tenure_years = serializer.validated_data['tenure_years']
    annual_rate = serializer.validated_data['interest_rate']

    available_emi = (income * 0.5) - existing_emis
    if available_emi <= 0:
        return Response({
            "max_eligible_loan": 0,
            "max_affordable_emi": 0,
            "message": "Existing EMIs exceed 50% FOIR threshold"
        })

    r = (annual_rate / 12) / 100
    n = tenure_years * 12
    max_loan = (available_emi * (((1 + r) ** n) - 1)) / (r * ((1 + r) ** n))

    return Response({
        "max_eligible_loan": round(max_loan, 2),
        "max_affordable_emi": round(available_emi, 2),
        "tenure_years": tenure_years,
        "interest_rate": annual_rate
    })


# ==========================================
# INVESTMENT LISTINGS
# ==========================================

@api_view(['GET'])
@permission_classes([AllowAny])
def list_investments(request):
    investments = InvestmentListing.objects.filter(is_active=True).select_related('property')
    serializer = InvestmentListingSerializer(investments, many=True)
    return Response(serializer.data)


# ==========================================
# PAYMENTS API (RAZORPAY STUB)
# ==========================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_razorpay_order(request):
    amount = request.data.get('amount', 49900) # Default Rs 499.00 in paise
    listing_id = request.data.get('listing_id')

    # Mock Razorpay Order ID generator for local dev / testing
    import uuid
    order_id = f"order_{uuid.uuid4().hex[:12]}"

    return Response({
        "order_id": order_id,
        "currency": "INR",
        "amount": amount,
        "key_id": "rzp_test_estateiq_2026",
        "status": "created"
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def razorpay_webhook(request):
    # Signature verification stub
    return Response({"status": "received"})


@api_view(['POST'])
@permission_classes([AllowAny])
def log_event(request):
    event_type = request.data.get('event_type', 'unknown')
    payload = request.data.get('payload', {})
    user = request.user if request.user.is_authenticated else None
    
    from listings.models import Event
    Event.objects.create(
        user=user,
        event_type=event_type,
        properties_payload=payload
    )
    return Response({"status": "logged"})


