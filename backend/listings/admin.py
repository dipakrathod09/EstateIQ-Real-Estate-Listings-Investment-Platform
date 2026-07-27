from django.contrib import admin
from listings.models import (
    Property, PropertyImage, Listing, Inquiry, SiteVisit, Favorite, SavedSearch, InvestmentListing, Event
)


class PropertyImageInline(admin.TabularInline):
    model = PropertyImage
    extra = 1

@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    list_display = ('title', 'city', 'locality', 'property_type', 'bhk', 'price', 'rera_number', 'created_at')
    list_filter = ('city', 'property_type', 'bhk', 'furnishing', 'facing')
    search_fields = ('title', 'locality', 'city', 'rera_number')
    inlines = [PropertyImageInline]

@admin.register(Listing)
class ListingAdmin(admin.ModelAdmin):
    list_display = ('property', 'user', 'listing_type', 'status', 'is_verified', 'is_duplicate_flagged', 'created_at')
    list_filter = ('listing_type', 'status', 'is_verified', 'is_duplicate_flagged')
    search_fields = ('property__title', 'user__username', 'user__email')
    actions = ['approve_listings', 'reject_listings']

    def approve_listings(self, request, queryset):
        queryset.update(status=Listing.Status.LIVE, is_verified=True)
    approve_listings.short_description = "Approve selected listings (set LIVE)"

    def reject_listings(self, request, queryset):
        queryset.update(status=Listing.Status.REJECTED)
    reject_listings.short_description = "Reject selected listings"

@admin.register(Inquiry)
class InquiryAdmin(admin.ModelAdmin):
    list_display = ('listing', 'name', 'email', 'phone', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('name', 'email', 'phone', 'listing__property__title')

@admin.register(SiteVisit)
class SiteVisitAdmin(admin.ModelAdmin):
    list_display = ('listing', 'user', 'preferred_date', 'preferred_time', 'status', 'created_at')
    list_filter = ('status', 'preferred_date')
    search_fields = ('user__username', 'listing__property__title')

@admin.register(Favorite)
class FavoriteAdmin(admin.ModelAdmin):
    list_display = ('user', 'property', 'created_at')

@admin.register(SavedSearch)
class SavedSearchAdmin(admin.ModelAdmin):
    list_display = ('user', 'title', 'created_at')

@admin.register(InvestmentListing)
class InvestmentListingAdmin(admin.ModelAdmin):
    list_display = ('property', 'expected_roi_percentage', 'projected_rental_yield', 'min_investment_amount', 'is_active')
    list_filter = ('is_active',)

@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ('event_type', 'user', 'created_at')
    list_filter = ('event_type', 'created_at')

