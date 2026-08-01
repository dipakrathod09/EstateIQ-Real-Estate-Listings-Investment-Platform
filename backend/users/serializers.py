from rest_framework import serializers
from users.models import User, BuilderProfile, DataDeletionRequest

class BuilderProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = BuilderProfile
        fields = ('id', 'company_name', 'rera_registration', 'created_at')

class UserSerializer(serializers.ModelSerializer):
    builder_profile = BuilderProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = (
            'id', 'username', 'email', 'first_name', 'last_name',
            'role', 'roles', 'phone_number', 'is_phone_verified', 'is_email_verified',
            'preferences', 'consent_given_at', 'consent_policy_version', 'builder_profile'
        )
        read_only_fields = ('id', 'is_phone_verified', 'is_email_verified', 'consent_given_at')

class RequestEmailOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()

class VerifyEmailOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6)
    role = serializers.ChoiceField(choices=User.Role.choices, default=User.Role.BUYER)
    name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    consent = serializers.BooleanField(required=True)

class GoogleAuthSerializer(serializers.Serializer):
    email = serializers.EmailField()
    name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    credential = serializers.CharField(required=False, allow_blank=True)
    role = serializers.ChoiceField(choices=User.Role.choices, default=User.Role.BUYER)
    consent = serializers.BooleanField(required=True)

class VerifyPhoneSerializer(serializers.Serializer):
    phone_number = serializers.CharField(max_length=20)
    otp = serializers.CharField(max_length=6)

class PasswordRegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(min_length=6)
    name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    role = serializers.ChoiceField(choices=User.Role.choices, default=User.Role.BUYER)
    consent = serializers.BooleanField(required=True)

class PasswordLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

class PasswordResetConfirmSerializer(serializers.Serializer):
    email = serializers.EmailField()
    code = serializers.CharField(max_length=6)
    new_password = serializers.CharField(min_length=6)

class RequestOTPSerializer(serializers.Serializer):
    phone_number = serializers.CharField(max_length=20)

class VerifyOTPSerializer(serializers.Serializer):
    phone_number = serializers.CharField(max_length=20)
    otp = serializers.CharField(max_length=6)
    role = serializers.ChoiceField(choices=User.Role.choices, default=User.Role.BUYER)
    name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    email = serializers.EmailField(required=False, allow_blank=True)
