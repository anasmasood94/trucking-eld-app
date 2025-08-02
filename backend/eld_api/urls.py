from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TripViewSet, RouteStopViewSet, ELDLogViewSet, HOSViolationViewSet

router = DefaultRouter()
router.register(r'trips', TripViewSet)
router.register(r'route-stops', RouteStopViewSet)
router.register(r'eld-logs', ELDLogViewSet)
router.register(r'hos-violations', HOSViolationViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
]
