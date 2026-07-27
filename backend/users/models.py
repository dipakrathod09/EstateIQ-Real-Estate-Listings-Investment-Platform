from django.contrib.auth.models import AbstractUser
from django.db import models

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
        help_text="Role of the user in the platform"
    )
    phone_number = models.CharField(max_length=20, unique=True, null=True, blank=True)
    is_phone_verified = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"


class BuilderProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='builder_profile')
    company_name = models.CharField(max_length=255)
    rera_registration = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.company_name} ({self.user.username})"
