from rest_framework import serializers
from users.models import User, BuilderProfile

class BuilderProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = BuilderProfile
        fields = ('id', 'company_name', 'rera_registration', 'created_at')

class UserSerializer(serializers.ModelSerializer):
    builder_profile = BuilderProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'role', 'phone_number', 'is_phone_verified', 'builder_profile')
        read_only_fields = ('id', 'is_phone_verified')

class RequestOTPSerializer(serializers.Serializer):
    phone_number = serializers.CharField(max_length=20)

class VerifyOTPSerializer(serializers.Serializer):
    phone_number = serializers.CharField(max_length=20)
    otp = serializers.CharField(max_length=6)
    role = serializers.ChoiceField(choices=User.Role.choices, default=User.Role.BUYER)
