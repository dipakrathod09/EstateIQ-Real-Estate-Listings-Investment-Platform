from django.urls import path
from users.views import request_otp, verify_otp, current_user

urlpatterns = [
    path('auth/otp/request/', request_otp, name='auth-otp-request'),
    path('auth/otp/verify/', verify_otp, name='auth-otp-verify'),
    path('auth/me/', current_user, name='auth-me'),
]
