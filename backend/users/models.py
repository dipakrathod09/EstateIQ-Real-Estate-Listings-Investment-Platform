from django.contrib.auth.models import AbstractUser
from django.db import models
import uuid

class User(AbstractUser):
    class Role(models.TextChoices):
        BUYER = 'buyer', 'Buyer'
        OWNER = 'owner', 'Owner'
        AGENT = 'agent', 'Agent'
        BUILDER = 'builder', 'Builder'
        ADMIN = 'admin', 'Admin'

    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.BUYER,
        help_text="Primary display role of the user"
    )
    # Multi-role support (Section 3)
    roles = models.JSONField(default=list, blank=True, help_text="List of roles held by this account")

    phone_number = models.CharField(max_length=20, unique=True, null=True, blank=True)
    is_phone_verified = models.BooleanField(default=False)
    is_email_verified = models.BooleanField(default=False)
    is_role_verified = models.BooleanField(default=False, help_text="Admin verified standing for Builder/Agent professional roles")

    # Email OTP & Magic Link Auth (Section 2)
    email_otp = models.CharField(max_length=6, blank=True, null=True)
    email_otp_expires_at = models.DateTimeField(blank=True, null=True)
    magic_link_token = models.UUIDField(blank=True, null=True, default=uuid.uuid4)
    magic_link_expires_at = models.DateTimeField(blank=True, null=True)

    # Password Reset (Traditional Password Auth)
    password_reset_code = models.CharField(max_length=6, blank=True, null=True)
    password_reset_expires_at = models.DateTimeField(blank=True, null=True)

    # Post-login Onboarding Preferences (Section 4)
    preferences = models.JSONField(default=dict, blank=True)

    # Compliance & Data Privacy (Section 5)
    consent_given_at = models.DateTimeField(blank=True, null=True)
    consent_policy_version = models.CharField(max_length=20, default='1.0', blank=True)

    def save(self, *args, **kwargs):
        if not self.roles:
            self.roles = [self.role] if self.role else [User.Role.BUYER]
        elif self.role and self.role not in self.roles:
            self.roles.append(self.role)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"


class BuilderProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='builder_profile')
    company_name = models.CharField(max_length=255)
    rera_registration = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.company_name} ({self.user.username})"


class DataDeletionRequest(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='deletion_requests')
    request_type = models.CharField(max_length=20, default='deletion') # 'deletion' or 'export'
    status = models.CharField(max_length=20, default='pending') # 'pending', 'processed'
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Data {self.request_type} request by {self.user.email} at {self.created_at}"
