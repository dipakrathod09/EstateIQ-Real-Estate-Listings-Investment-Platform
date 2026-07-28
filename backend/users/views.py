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

from users.models import User, BuilderProfile
from users.serializers import UserSerializer, RequestOTPSerializer, VerifyOTPSerializer


@api_view(['POST'])
@permission_classes([AllowAny])
def request_otp(request):
    serializer = RequestOTPSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    phone_number = serializer.validated_data['phone_number']
    # Simulated OTP generation for development mode
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
            'email': email,
            'first_name': name.split()[0] if name else '',
            'last_name': " ".join(name.split()[1:]) if len(name.split()) > 1 else '',
            'is_phone_verified': True
        }
    )

    if not created:
        user.is_phone_verified = True
        if role: user.role = role
        if email: user.email = email
        if name:
            user.first_name = name.split()[0]
            if len(name.split()) > 1:
                user.last_name = " ".join(name.split()[1:])
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

        # Update or create BuilderProfile if builder role
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
