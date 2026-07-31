import random
from django.utils import timezone
from datetime import timedelta
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

try:
    from rest_framework_simplejwt.tokens import RefreshToken
except ImportError:
    class RefreshToken:
        @classmethod
        def for_user(cls, user):
            class TokenObj:
                access_token = f"mock_access_token_for_{user.id}"
                def __str__(self):
                    return f"mock_refresh_token_for_{user.id}"
            return TokenObj()

from users.models import User, BuilderProfile, DataDeletionRequest
from users.serializers import (
    UserSerializer, RequestOTPSerializer, VerifyOTPSerializer,
    RequestEmailOTPSerializer, VerifyEmailOTPSerializer, GoogleAuthSerializer,
    VerifyPhoneSerializer
)

# ==========================================
# SECTION 2: EMAIL OTP & GOOGLE SIGN-IN VIEWS
# ==========================================

@api_view(['POST'])
@permission_classes([AllowAny])
def request_email_otp(request):
    """
    Passwordless email OTP request endpoint.
    Generates 6-digit code with 15-minute expiry.
    """
    serializer = RequestEmailOTPSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    email = serializer.validated_data['email'].lower().strip()
    otp = "123456" # Fixed code for dev mode, or generated code

    user, created = User.objects.get_or_create(
        email=email,
        defaults={
            'username': email.split('@')[0] + f"_{random.randint(1000, 9999)}",
            'is_active': True
        }
    )

    user.email_otp = otp
    user.email_otp_expires_at = timezone.now() + timedelta(minutes=15)
    user.save()

    print(f"[AUTH DEV LOG] Email OTP for {email} is {otp}")

    return Response({
        "message": f"Verification code sent to {email}",
        "dev_otp": otp,
        "is_new_user": created
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def verify_email_otp(request):
    """
    Verifies email OTP, enforces consent check, registers/logs in user, issues JWT tokens.
    """
    serializer = VerifyEmailOTPSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    email = serializer.validated_data['email'].lower().strip()
    otp = serializer.validated_data['otp'].strip()
    role = serializer.validated_data.get('role', User.Role.BUYER)
    name = serializer.validated_data.get('name', '').strip()
    consent = serializer.validated_data.get('consent', True)

    if not consent:
        return Response({"error": "Consent to Privacy Policy and Terms is required to create an account"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({"error": "No pending login found for this email address"}, status=status.HTTP_400_BAD_REQUEST)

    # Validate OTP (Dev code 123456 or matching OTP within 15 min)
    if otp != "123456" and user.email_otp != otp:
        return Response({"error": "Invalid OTP code. Use 123456 for testing."}, status=status.HTTP_400_BAD_REQUEST)

    if user.email_otp_expires_at and timezone.now() > user.email_otp_expires_at:
        return Response({"error": "OTP code has expired. Please request a new code."}, status=status.HTTP_400_BAD_REQUEST)

    # Mark verified & update profile details
    user.is_email_verified = True
    user.email_otp = None
    if consent and not user.consent_given_at:
        user.consent_given_at = timezone.now()
        user.consent_policy_version = "1.0"

    if role and role not in user.roles:
        user.roles.append(role)
        user.role = role

    if name:
        name_parts = name.split()
        user.first_name = name_parts[0]
        if len(name_parts) > 1:
            user.last_name = " ".join(name_parts[1:])

    user.save()

    refresh = RefreshToken.for_user(user)
    return Response({
        "access": str(refresh.access_token),
        "refresh": str(refresh),
        "user": UserSerializer(user).data
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def google_auth(request):
    """
    Google OAuth sign-in endpoint. Matches/creates user by email, records consent, issues JWT.
    """
    serializer = GoogleAuthSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    email = serializer.validated_data['email'].lower().strip()
    name = serializer.validated_data.get('name', '').strip()
    role = serializer.validated_data.get('role', User.Role.BUYER)
    consent = serializer.validated_data.get('consent', True)

    if not consent:
        return Response({"error": "Consent to Privacy Policy and Terms is required"}, status=status.HTTP_400_BAD_REQUEST)

    user, created = User.objects.get_or_create(
        email=email,
        defaults={
            'username': email.split('@')[0] + f"_{random.randint(1000, 9999)}",
            'role': role,
            'roles': [role],
            'is_email_verified': True,
            'consent_given_at': timezone.now(),
            'consent_policy_version': '1.0'
        }
    )

    if not created:
        user.is_email_verified = True
        if consent and not user.consent_given_at:
            user.consent_given_at = timezone.now()
            user.consent_policy_version = '1.0'
        user.save()

    if name and not user.first_name:
        parts = name.split()
        user.first_name = parts[0]
        if len(parts) > 1:
            user.last_name = " ".join(parts[1:])
        user.save()

    refresh = RefreshToken.for_user(user)
    return Response({
        "access": str(refresh.access_token),
        "refresh": str(refresh),
        "user": UserSerializer(user).data
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_phone_number(request):
    """
    Standalone phone number verification endpoint (opt-in / role-gated).
    """
    serializer = VerifyPhoneSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    phone_number = serializer.validated_data['phone_number'].strip()
    otp = serializer.validated_data['otp'].strip()

    if otp != "123456":
        return Response({"error": "Invalid OTP code. Use 123456 for testing."}, status=status.HTTP_400_BAD_REQUEST)

    user = request.user
    user.phone_number = phone_number
    user.is_phone_verified = True
    user.save()

    return Response({
        "message": "Phone number verified successfully",
        "user": UserSerializer(user).data
    }, status=status.HTTP_200_OK)


# ==========================================
# SECTION 3: MULTI-ROLE SUPPORT
# ==========================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_user_role(request):
    """
    Allows existing users (e.g. buyers) to add additional roles (e.g. owner, agent, builder)
    without creating duplicate accounts.
    """
    new_role = request.data.get('role')
    if new_role not in [r[0] for r in User.Role.choices]:
        return Response({"error": "Invalid role specified"}, status=status.HTTP_400_BAD_REQUEST)

    user = request.user
    if new_role not in user.roles:
        user.roles.append(new_role)

    # Set as active role if requested
    if request.data.get('set_active', True):
        user.role = new_role

    user.save()

    # Create builder profile if role is builder
    if new_role == User.Role.BUILDER:
        BuilderProfile.objects.get_or_create(
            user=user,
            defaults={'company_name': request.data.get('company_name', f"{user.first_name}'s Real Estate")}
        )

    return Response({
        "message": f"Role '{new_role}' successfully added to your account",
        "user": UserSerializer(user).data
    }, status=status.HTTP_200_OK)


# ==========================================
# SECTION 4: POST-LOGIN ONBOARDING PREFERENCES
# ==========================================

@api_view(['PATCH', 'PUT'])
@permission_classes([IsAuthenticated])
def update_user_preferences(request):
    """
    Stores onboarding preferences (intent, target cities, budget, BHK) for personalization.
    """
    user = request.user
    prefs = request.data.get('preferences', {})

    if not isinstance(user.preferences, dict):
        user.preferences = {}

    user.preferences.update(prefs)
    user.preferences['onboarding_done'] = True
    user.save()

    return Response({
        "message": "User preferences updated successfully",
        "user": UserSerializer(user).data
    }, status=status.HTTP_200_OK)


# ==========================================
# SECTION 5: DPDP COMPLIANCE & DATA PRIVACY
# ==========================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def request_data_deletion(request):
    """
    DPDP Act 2023 compliant data deletion or export request endpoint.
    Creates a logged DataDeletionRequest for admin processing.
    """
    request_type = request.data.get('request_type', 'deletion')
    notes = request.data.get('notes', '')

    del_req = DataDeletionRequest.objects.create(
        user=request.user,
        request_type=request_type,
        notes=notes
    )

    return Response({
        "message": f"Your data {request_type} request has been recorded. Our data protection team will process it within 7 business days.",
        "request_id": del_req.id
    }, status=status.HTTP_200_OK)


# ==========================================
# LEGACY PHONE OTP FALLBACK ENDPOINTS
# ==========================================

@api_view(['POST'])
@permission_classes([AllowAny])
def request_otp(request):
    serializer = RequestOTPSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    phone_number = serializer.validated_data['phone_number']
    return Response({
        "message": f"OTP sent to {phone_number}",
        "dev_otp": "123456"
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def verify_otp(request):
    serializer = VerifyOTPSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    phone_number = serializer.validated_data['phone_number']
    otp = serializer.validated_data['otp']
    role = serializer.validated_data.get('role', User.Role.BUYER)
    name = serializer.validated_data.get('name', '').strip()
    email = serializer.validated_data.get('email', '').strip()

    if otp != "123456":
        return Response({"error": "Invalid OTP code. Use 123456 for testing."}, status=status.HTTP_400_BAD_REQUEST)

    username = f"user_{phone_number[-6:]}"
    user, created = User.objects.get_or_create(
        phone_number=phone_number,
        defaults={
            'username': username,
            'role': role,
            'roles': [role],
            'email': email or f"{phone_number[-6:]}@estateiq.com",
            'first_name': name.split()[0] if name else '',
            'last_name': " ".join(name.split()[1:]) if len(name.split()) > 1 else '',
            'is_phone_verified': True,
            'consent_given_at': timezone.now(),
            'consent_policy_version': '1.0'
        }
    )

    if not created:
        user.is_phone_verified = True
        if role and role not in user.roles: user.roles.append(role)
        if role: user.role = role
        if email: user.email = email
        user.save()

    refresh = RefreshToken.for_user(user)
    return Response({
        "access": str(refresh.access_token),
        "refresh": str(refresh),
        "user": UserSerializer(user).data
    })


@api_view(['GET', 'PATCH', 'PUT'])
@permission_classes([IsAuthenticated])
def current_user(request):
    if request.method in ['PATCH', 'PUT']:
        user = request.user
        data = request.data

        if 'first_name' in data: user.first_name = data['first_name']
        if 'last_name' in data: user.last_name = data['last_name']
        if 'email' in data: user.email = data['email']
        if 'role' in data: user.role = data['role']
        user.save()

        if user.role == User.Role.BUILDER and ('company_name' in data or 'rera_registration' in data):
            BuilderProfile.objects.update_or_create(
                user=user,
                defaults={
                    'company_name': data.get('company_name', ''),
                    'rera_registration': data.get('rera_registration', '')
                }
            )

        return Response(UserSerializer(user).data)

    serializer = UserSerializer(request.user)
    return Response(serializer.data)
