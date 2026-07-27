from django.http import JsonResponse, HttpResponse
from django.template import loader

try:
    from rest_framework.decorators import api_view, permission_classes
    from rest_framework.permissions import AllowAny
    from rest_framework.response import Response

    @api_view(['GET'])
    @permission_classes([AllowAny])
    def health_check(request):
        """
        Health check endpoint for infrastructure and frontend connectivity verification.
        """
        return Response({
            "status": "ok",
            "service": "EstateIQ Backend API",
            "version": "1.0.0"
        })

except ImportError:
    def health_check(request):
        return JsonResponse({
            "status": "ok",
            "service": "EstateIQ Backend API",
            "version": "1.0.0"
        })


def robots_txt(request):
    content = "User-agent: *\nAllow: /\nDisallow: /admin/\nSitemap: http://localhost:8000/sitemap.xml\n"
    return HttpResponse(content, content_type="text/plain")


def sitemap_xml(request):
    from listings.models import Listing
    live_listings = Listing.objects.filter(status=Listing.Status.LIVE).values_list('id', flat=True)

    urls = [
        "http://localhost:5173/",
        "http://localhost:5173/search",
        "http://localhost:5173/investments",
        "http://localhost:5173/calculators",
        "http://localhost:5173/terms",
        "http://localhost:5173/privacy",
    ]

    for listing_id in live_listings:
        urls.append(f"http://localhost:5173/property/{listing_id}")

    xml_lines = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for url in urls:
        xml_lines.append(f"  <url><loc>{url}</loc></url>")
    xml_lines.append('</urlset>')

    return HttpResponse("\n".join(xml_lines), content_type="application/xml")

