from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
import uuid

class Trip(models.Model):
    """Model for storing trip information"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    current_location = models.CharField(max_length=255, help_text="Current location of the driver")
    pickup_location = models.CharField(max_length=255, help_text="Pickup location for the trip")
    dropoff_location = models.CharField(max_length=255, help_text="Dropoff location for the trip")
    current_cycle_hours = models.FloatField(
        validators=[MinValueValidator(0), MaxValueValidator(70)],
        help_text="Current cycle hours used (0-70 hours for 8-day cycle)"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Trip metadata
    total_distance = models.FloatField(null=True, blank=True, help_text="Total trip distance in miles")
    estimated_duration = models.FloatField(null=True, blank=True, help_text="Estimated duration in hours")

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Trip from {self.pickup_location} to {self.dropoff_location}"

class RouteStop(models.Model):
    """Model for storing route stops and breaks"""
    STOP_TYPES = [
        ('mandatory_break', 'Mandatory Break'),
        ('fuel_stop', 'Fuel Stop'),
        ('rest_stop', 'Rest Stop'),
        ('pickup', 'Pickup'),
        ('dropoff', 'Dropoff'),
    ]

    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='stops')
    stop_type = models.CharField(max_length=20, choices=STOP_TYPES)
    location = models.CharField(max_length=255)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    estimated_arrival = models.DateTimeField()
    duration_minutes = models.IntegerField(help_text="Duration of stop in minutes")
    order = models.IntegerField(help_text="Order of stop in the route")

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.get_stop_type_display()} at {self.location}"

class ELDLog(models.Model):
    """Model for ELD log entries"""
    DUTY_STATUS_CHOICES = [
        ('off_duty', 'Off Duty'),
        ('sleeper_berth', 'Sleeper Berth'),
        ('driving', 'Driving'),
        ('on_duty_not_driving', 'On Duty (Not Driving)'),
    ]

    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='eld_logs')
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    duty_status = models.CharField(max_length=20, choices=DUTY_STATUS_CHOICES)
    location = models.CharField(max_length=255)
    vehicle_miles = models.IntegerField(default=0)
    total_hours = models.FloatField(help_text="Total hours for this log entry")

    # HOS tracking
    driving_time = models.FloatField(default=0, help_text="Driving time in hours")
    on_duty_time = models.FloatField(default=0, help_text="On duty time in hours")

    class Meta:
        ordering = ['date', 'start_time']

    def __str__(self):
        return f"{self.date} - {self.get_duty_status_display()}"

class HOSViolation(models.Model):
    """Model for tracking Hours of Service violations"""
    VIOLATION_TYPES = [
        ('daily_driving', 'Daily Driving Limit (11 hours)'),
        ('daily_duty', 'Daily Duty Limit (14 hours)'),
        ('cycle_limit', '70-Hour/8-Day Cycle Limit'),
        ('mandatory_break', 'Mandatory 30-minute Break'),
    ]

    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='hos_violations')
    violation_type = models.CharField(max_length=20, choices=VIOLATION_TYPES)
    description = models.TextField()
    severity = models.CharField(max_length=10, choices=[('warning', 'Warning'), ('violation', 'Violation')])
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.get_violation_type_display()} - {self.severity}"
