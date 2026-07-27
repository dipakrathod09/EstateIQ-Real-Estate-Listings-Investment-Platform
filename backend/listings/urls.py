from django.urls import path
from listings.views import (
    list_listings, get_listing_detail, create_listing, moderate_listing,
    handle_inquiries, handle_site_visits, handle_favorites, remove_favorite,
    handle_saved_searches, emi_calculator, stamp_duty_calculator, loan_eligibility_calculator,
    list_investments, create_razorpay_order, razorpay_webhook, log_event
)


urlpatterns = [
    path('listings/', list_listings, name='listings-list'),
    path('listings/create/', create_listing, name='listings-create'),
    path('listings/<int:pk>/', get_listing_detail, name='listings-detail'),
    path('listings/<int:pk>/moderate/', moderate_listing, name='listings-moderate'),

    path('inquiries/', handle_inquiries, name='inquiries'),
    path('site-visits/', handle_site_visits, name='site-visits'),
    path('favorites/', handle_favorites, name='favorites'),
    path('favorites/<int:property_id>/', remove_favorite, name='favorites-remove'),
    path('saved-searches/', handle_saved_searches, name='saved-searches'),

    path('calculators/emi/', emi_calculator, name='calc-emi'),
    path('calculators/stamp-duty/', stamp_duty_calculator, name='calc-stamp-duty'),
    path('calculators/loan-eligibility/', loan_eligibility_calculator, name='calc-loan-eligibility'),

    path('investments/', list_investments, name='investments-list'),
    path('payments/create-order/', create_razorpay_order, name='payments-create-order'),
    path('payments/webhook/', razorpay_webhook, name='payments-webhook'),
    path('events/log/', log_event, name='events-log'),
]

