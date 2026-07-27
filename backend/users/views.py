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

from users.models import User
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

    if otp != "123456":
        return Response({"error": "Invalid OTP code. Use 123456 for testing."}, status=status.HTTP_400_BAD_REQUEST)

    username = f"user_{phone_number[-6:]}"
    user, created = User.objects.get_or_create(
        phone_number=phone_number,
        defaults={
            'username': username,
            'role': role,
            'is_phone_verified': True
        }
    )
    if not user.is_phone_verified:
        user.is_phone_verified = True
        user.save()

    refresh = RefreshToken.for_user(user)
    return Response({
        "access": str(refresh.access_token),
        "refresh": str(refresh),
        "user": UserSerializer(user).data
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)
