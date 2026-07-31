from django.urls import path
from users.views import (
    request_email_otp, verify_email_otp, google_auth, verify_phone_number,
    add_user_role, update_user_preferences, request_data_deletion,
    request_otp, verify_otp, current_user
)

urlpatterns = [
    # Email & Google Primary Auth (Section 2)
    path('auth/email/request/', request_email_otp, name='auth-email-request'),
    path('auth/email/verify/', verify_email_otp, name='auth-email-verify'),
    path('auth/google/', google_auth, name='auth-google'),
    path('users/verify-phone/', verify_phone_number, name='users-verify-phone'),

    # Multi-Role & Preferences (Section 3 & Section 4)
    path('users/add-role/', add_user_role, name='users-add-role'),
    path('users/preferences/', update_user_preferences, name='users-preferences'),

    # Compliance & Data Privacy (Section 5)
    path('users/data-deletion-request/', request_data_deletion, name='users-data-deletion-request'),

    # Legacy Phone OTP Fallback
    path('auth/otp/request/', request_otp, name='auth-otp-request'),
    path('auth/otp/verify/', verify_otp, name='auth-otp-verify'),

    # User Profile
    path('auth/me/', current_user, name='auth-me'),
]
