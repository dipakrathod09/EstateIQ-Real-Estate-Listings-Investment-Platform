from django.urls import path
from listings.views import (
    list_listings, get_listing_detail, create_listing, update_listing, submit_for_review,
    upload_property_image, moderate_listing, handle_inquiries, handle_site_visits,
    handle_favorites, remove_favorite, handle_saved_searches, emi_calculator,
    stamp_duty_calculator, loan_eligibility_calculator, list_investments,
    create_razorpay_order, razorpay_webhook, log_event, get_similar_listings,
    get_ml_valuation, handle_reviews, locality_heatmap, predict_custom_price, rera_lookup
)

urlpatterns = [
    # Properties & Listings List & Details (supporting both /listings/ and /properties/ path specs)
    path('listings/', list_listings, name='listings-list'),
    path('properties/', list_listings, name='properties-list'),
    path('listings/create/', create_listing, name='listings-create'),
    path('properties/', create_listing, name='properties-create'),
    path('listings/<int:pk>/', get_listing_detail, name='listings-detail'),
    path('properties/<int:pk>/', get_listing_detail, name='properties-detail'),
    path('listings/<int:pk>/similar/', get_similar_listings, name='listings-similar'),
    path('properties/<int:pk>/similar/', get_similar_listings, name='properties-similar'),
    path('listings/<int:pk>/valuation/', get_ml_valuation, name='listings-valuation'),
    path('predict-price/', predict_custom_price, name='predict-custom-price'),

    # Listing management & workflow transitions
    path('listings/<int:pk>/update/', update_listing, name='listings-update'),
    path('properties/<int:pk>/', update_listing, name='properties-update'),
    path('listings/<int:pk>/submit-review/', submit_for_review, name='listings-submit-review'),
    path('listings/<int:pk>/images/', upload_property_image, name='listings-upload-images'),
    path('listings/<int:pk>/moderate/', moderate_listing, name='listings-moderate'),

    # Engagement & Leads
    path('inquiries/', handle_inquiries, name='inquiries'),
    path('site-visits/', handle_site_visits, name='site-visits'),
    path('favorites/', handle_favorites, name='favorites'),
    path('favorites/<int:property_id>/', remove_favorite, name='favorites-remove'),
    path('saved-searches/', handle_saved_searches, name='saved-searches'),
    path('reviews/', handle_reviews, name='reviews'),

    # Calculators & Intelligence
    path('calculators/emi/', emi_calculator, name='calc-emi'),
    path('calculators/stamp-duty/', stamp_duty_calculator, name='calc-stamp-duty'),
    path('calculators/loan-eligibility/', loan_eligibility_calculator, name='calc-loan-eligibility'),
    path('localities/heatmap/', locality_heatmap, name='locality-heatmap'),
    path('rera/lookup/', rera_lookup, name='rera-lookup'),

    # Investment & Payments
    path('investments/', list_investments, name='investments-list'),
    path('payments/create-order/', create_razorpay_order, name='payments-create-order'),
    path('payments/webhook/', razorpay_webhook, name='payments-webhook'),
    path('events/log/', log_event, name='events-log'),
]

