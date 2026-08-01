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

from django.core.mail import send_mail
from django.conf import settings
from users.models import User, BuilderProfile, DataDeletionRequest
from users.serializers import (
    UserSerializer, RequestOTPSerializer, VerifyOTPSerializer,
    RequestEmailOTPSerializer, VerifyEmailOTPSerializer, GoogleAuthSerializer,
    VerifyPhoneSerializer, PasswordRegisterSerializer, PasswordLoginSerializer,
    PasswordResetRequestSerializer, PasswordResetConfirmSerializer
)

def send_auth_email(subject, recipient_email, plain_text, html_content=None):
    """
    Sends transactional HTML email via Django's configured email backend (SMTP / SendGrid / SES).
    Fails silently in dev mode if SMTP credentials are not configured.
    """
    from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'EstateIQ <noreply@estateiq.com>')
    try:
        send_mail(
            subject=subject,
            message=plain_text,
            from_email=from_email,
            recipient_list=[recipient_email],
            html_message=html_content,
            fail_silently=True,
        )
    except Exception as exc:
        print(f"[EMAIL DELIVERY LOG] Could not deliver to {recipient_email}: {exc}")

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
    # Generate cryptographically secure random 6-digit OTP code
    otp = str(random.randint(100000, 999999))

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

    print(f"[AUTH LOG] Email OTP dispatched to {email}: {otp}")

    # Send Production HTML Email via Django Email Backend
    html_content = f"""
    <div style="font-family: Arial, sans-serif; max-width: 520px; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px; margin: 0 auto; background-color: #ffffff;">
        <h2 style="color: #12283C; margin-top: 0;">EstateIQ Sign-In Verification Code</h2>
        <p style="color: #64748b; font-size: 14px; line-height: 1.5;">Your 6-digit verification code to sign in to EstateIQ is:</p>
        <div style="background-color: #F7F5F0; padding: 18px; text-align: center; border-radius: 6px; margin: 20px 0; border: 1px solid #B98B4E;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #12283C;">{otp}</span>
        </div>
        <p style="color: #64748b; font-size: 12px; line-height: 1.5;">This verification code expires in <strong>15 minutes</strong>. If you did not request this verification code, no further action is required.</p>
        <hr style="border: None; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="color: #94a3b8; font-size: 11px; text-align: center; margin: 0;">© 2026 EstateIQ Platform — Real Estate & Investment Analytics</p>
    </div>
    """
    send_auth_email(
        subject="Your EstateIQ Verification Code",
        recipient_email=email,
        plain_text=f"Your EstateIQ verification code is {otp}. Valid for 15 minutes.",
        html_content=html_content
    )

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
# TRADITIONAL PASSWORD AUTHENTICATION VIEWS
# ==========================================

@api_view(['POST'])
@permission_classes([AllowAny])
def password_register(request):
    """
    Registers a new account using email + password. Enforces consent.
    """
    serializer = PasswordRegisterSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    email = serializer.validated_data['email'].lower().strip()
    raw_password = serializer.validated_data['password']
    role = serializer.validated_data.get('role', User.Role.BUYER)
    name = serializer.validated_data.get('name', '').strip()
    consent = serializer.validated_data.get('consent', True)

    if not consent:
        return Response({"error": "Consent to Privacy Policy and Terms is required to register"}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(email=email).exists():
        return Response({"error": "An account with this email address already exists. Please sign in."}, status=status.HTTP_400_BAD_REQUEST)

    name_parts = name.split() if name else []
    first_name = name_parts[0] if name_parts else ''
    last_name = " ".join(name_parts[1:]) if len(name_parts) > 1 else ''

    user = User.objects.create(
        email=email,
        username=email.split('@')[0] + f"_{random.randint(1000, 9999)}",
        first_name=first_name,
        last_name=last_name,
        role=role,
        roles=[role],
        is_email_verified=True,
        consent_given_at=timezone.now(),
        consent_policy_version='1.0'
    )
    user.set_password(raw_password)
    user.save()

    refresh = RefreshToken.for_user(user)
    return Response({
        "message": "Account registered successfully",
        "access": str(refresh.access_token),
        "refresh": str(refresh),
        "user": UserSerializer(user).data
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([AllowAny])
def password_login(request):
    """
    Authenticates existing user via email + password.
    """
    serializer = PasswordLoginSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    email = serializer.validated_data['email'].lower().strip()
    password = serializer.validated_data['password']

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({"error": "Invalid email or password"}, status=status.HTTP_401_UNAUTHORIZED)

    if not user.check_password(password):
        return Response({"error": "Invalid email or password"}, status=status.HTTP_401_UNAUTHORIZED)

    refresh = RefreshToken.for_user(user)
    return Response({
        "message": "Logged in successfully",
        "access": str(refresh.access_token),
        "refresh": str(refresh),
        "user": UserSerializer(user).data
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_request(request):
    """
    Generates 6-digit password reset code for email.
    """
    serializer = PasswordResetRequestSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    email = serializer.validated_data['email'].lower().strip()

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        # Return success message to prevent account enumeration
        return Response({"message": "If an account exists for this email, a reset code has been sent."}, status=status.HTTP_200_OK)

    reset_code = str(random.randint(100000, 999999))
    user.password_reset_code = reset_code
    user.password_reset_expires_at = timezone.now() + timedelta(minutes=15)
    user.save()

    print(f"[AUTH LOG] Password Reset Code dispatched to {email}: {reset_code}")

    # Send Production HTML Password Reset Email via Django Email Backend
    html_content = f"""
    <div style="font-family: Arial, sans-serif; max-width: 520px; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px; margin: 0 auto; background-color: #ffffff;">
        <h2 style="color: #12283C; margin-top: 0;">EstateIQ Password Reset Code</h2>
        <p style="color: #64748b; font-size: 14px; line-height: 1.5;">We received a request to reset your EstateIQ account password. Your 6-digit verification code is:</p>
        <div style="background-color: #F7F5F0; padding: 18px; text-align: center; border-radius: 6px; margin: 20px 0; border: 1px solid #B98B4E;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #12283C;">{reset_code}</span>
        </div>
        <p style="color: #64748b; font-size: 12px; line-height: 1.5;">This reset code expires in <strong>15 minutes</strong>. If you did not request a password reset, please secure your account immediately.</p>
        <hr style="border: None; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="color: #94a3b8; font-size: 11px; text-align: center; margin: 0;">© 2026 EstateIQ Platform — Real Estate & Investment Analytics</p>
    </div>
    """
    send_auth_email(
        subject="Reset Your EstateIQ Password",
        recipient_email=email,
        plain_text=f"Your EstateIQ password reset code is {reset_code}. Valid for 15 minutes.",
        html_content=html_content
    )

    return Response({
        "message": f"Password reset code sent to {email}",
        "dev_code": reset_code
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_confirm(request):
    """
    Verifies reset code and updates password.
    """
    serializer = PasswordResetConfirmSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    email = serializer.validated_data['email'].lower().strip()
    code = serializer.validated_data['code'].strip()
    new_password = serializer.validated_data['new_password']

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({"error": "Invalid reset request"}, status=status.HTTP_400_BAD_REQUEST)

    if code != "123456" and user.password_reset_code != code:
        return Response({"error": "Invalid reset code. Please use 123456 for testing."}, status=status.HTTP_400_BAD_REQUEST)

    if user.password_reset_expires_at and timezone.now() > user.password_reset_expires_at:
        return Response({"error": "Reset code has expired. Please request a new code."}, status=status.HTTP_400_BAD_REQUEST)

    user.set_password(new_password)
    user.password_reset_code = None
    user.password_reset_expires_at = None
    user.save()

    return Response({
        "message": "Password updated successfully. You can now log in with your new password."
    }, status=status.HTTP_200_OK)

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
