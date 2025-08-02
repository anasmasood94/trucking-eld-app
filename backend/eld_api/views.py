from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Trip, RouteStop, ELDLog, HOSViolation
from .serializers import (
    TripSerializer, TripCreateSerializer, RouteStopSerializer,
    ELDLogSerializer, HOSViolationSerializer
)
from .services import RouteService, HOSService

class TripViewSet(viewsets.ModelViewSet):
    """API ViewSet for Trip management"""
    queryset = Trip.objects.all()

    def get_serializer_class(self):
        if self.action == 'create':
            return TripCreateSerializer
        return TripSerializer

    def create(self, request, *args, **kwargs):
        """Create a new trip and calculate route and HOS compliance"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Create the trip
        trip = serializer.save()

        # Calculate route
        route_service = RouteService()
        route_data = route_service.calculate_route(trip)

        # Calculate HOS compliance
        hos_service = HOSService()
        hos_data = hos_service.calculate_hos_compliance(trip)

        # Return complete trip data
        trip_serializer = TripSerializer(trip)

        return Response({
            'trip': trip_serializer.data,
            'route': route_data,
            'hos_compliance': hos_data
        }, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'])
    def route(self, request, pk=None):
        """Get route information for a trip"""
        trip = get_object_or_404(Trip, pk=pk)
        stops = RouteStop.objects.filter(trip=trip)

        route_service = RouteService()

        return Response({
            'trip_id': trip.id,
            'total_distance': trip.total_distance,
            'estimated_duration': trip.estimated_duration,
            'stops': RouteStopSerializer(stops, many=True).data,
            'route_geometry': route_service._generate_route_geometry(
                route_service.get_coordinates(trip.current_location),
                route_service.get_coordinates(trip.pickup_location),
                route_service.get_coordinates(trip.dropoff_location)
            )
        })

    @action(detail=True, methods=['get'])
    def eld_logs(self, request, pk=None):
        """Get ELD logs for a trip"""
        trip = get_object_or_404(Trip, pk=pk)
        logs = ELDLog.objects.filter(trip=trip)

        return Response({
            'trip_id': trip.id,
            'logs': ELDLogSerializer(logs, many=True).data,
            'daily_summary': self._calculate_daily_summary(logs)
        })

    @action(detail=True, methods=['get'])
    def hos_compliance(self, request, pk=None):
        """Get HOS compliance information for a trip"""
        trip = get_object_or_404(Trip, pk=pk)
        violations = HOSViolation.objects.filter(trip=trip)

        hos_service = HOSService()

        return Response({
            'trip_id': trip.id,
            'current_cycle_hours': trip.current_cycle_hours,
            'remaining_hours': 70 - trip.current_cycle_hours,
            'violations': HOSViolationSerializer(violations, many=True).data,
            'compliance_status': 'compliant' if not violations.filter(severity='violation').exists() else 'violation'
        })

    def _calculate_daily_summary(self, logs):
        """Calculate daily summary from ELD logs"""
        total_driving = sum(log.driving_time for log in logs)
        total_on_duty = sum(log.on_duty_time for log in logs)
        total_miles = sum(log.vehicle_miles for log in logs)

        return {
            'total_driving_time': total_driving,
            'total_on_duty_time': total_on_duty,
            'total_miles': total_miles,
            'remaining_driving_time': max(0, 11 - total_driving),
            'remaining_on_duty_time': max(0, 14 - total_on_duty)
        }

class RouteStopViewSet(viewsets.ReadOnlyModelViewSet):
    """API ViewSet for Route Stops"""
    queryset = RouteStop.objects.all()
    serializer_class = RouteStopSerializer

    def get_queryset(self):
        queryset = RouteStop.objects.all()
        trip_id = self.request.query_params.get('trip_id', None)
        if trip_id is not None:
            queryset = queryset.filter(trip_id=trip_id)
        return queryset

class ELDLogViewSet(viewsets.ReadOnlyModelViewSet):
    """API ViewSet for ELD Logs"""
    queryset = ELDLog.objects.all()
    serializer_class = ELDLogSerializer

    def get_queryset(self):
        queryset = ELDLog.objects.all()
        trip_id = self.request.query_params.get('trip_id', None)
        if trip_id is not None:
            queryset = queryset.filter(trip_id=trip_id)
        return queryset

class HOSViolationViewSet(viewsets.ReadOnlyModelViewSet):
    """API ViewSet for HOS Violations"""
    queryset = HOSViolation.objects.all()
    serializer_class = HOSViolationSerializer

    def get_queryset(self):
        queryset = HOSViolation.objects.all()
        trip_id = self.request.query_params.get('trip_id', None)
        if trip_id is not None:
            queryset = queryset.filter(trip_id=trip_id)
        return queryset
