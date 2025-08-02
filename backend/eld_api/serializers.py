from rest_framework import serializers
from .models import Trip, RouteStop, ELDLog, HOSViolation

class RouteStopSerializer(serializers.ModelSerializer):
    class Meta:
        model = RouteStop
        fields = '__all__'

class ELDLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ELDLog
        fields = '__all__'

class HOSViolationSerializer(serializers.ModelSerializer):
    class Meta:
        model = HOSViolation
        fields = '__all__'

class TripSerializer(serializers.ModelSerializer):
    stops = RouteStopSerializer(many=True, read_only=True)
    eld_logs = ELDLogSerializer(many=True, read_only=True)
    hos_violations = HOSViolationSerializer(many=True, read_only=True)

    class Meta:
        model = Trip
        fields = '__all__'

class TripCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Trip
        fields = ['current_location', 'pickup_location', 'dropoff_location', 'current_cycle_hours']

    def validate_current_cycle_hours(self, value):
        if value < 0 or value > 70:
            raise serializers.ValidationError("Current cycle hours must be between 0 and 70")
        return value
