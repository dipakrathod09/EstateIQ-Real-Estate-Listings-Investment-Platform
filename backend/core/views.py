from django.http import JsonResponse

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
