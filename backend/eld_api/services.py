import requests
from datetime import datetime, timedelta, time
from typing import List, Dict, Tuple
from .models import Trip, RouteStop, ELDLog, HOSViolation

class RouteService:
    """Service for calculating routes and stops using OpenRouteService API"""

    def __init__(self):
        # Using OpenRouteService (free API) - you'll need to get an API key
        self.base_url = "https://api.openrouteservice.org"
        # For demo purposes, we'll simulate the API responses

    def get_coordinates(self, address: str) -> Tuple[float, float]:
        """Get latitude and longitude for an address"""
        # In a real implementation, you'd use a geocoding service
        # For demo, returning mock coordinates
        mock_coords = {
            "New York": (40.7128, -74.0060),
            "Los Angeles": (34.0522, -118.2437),
            "Chicago": (41.8781, -87.6298),
            "Houston": (29.7604, -95.3698),
            "Phoenix": (33.4484, -112.0740),
            "Philadelphia": (39.9526, -75.1652),
            "San Antonio": (29.4241, -98.4936),
            "San Diego": (32.7157, -117.1611),
            "Dallas": (32.7767, -96.7970),
            "San Jose": (37.3382, -121.8863),
            "Detroit": (42.3314, -83.0458),
            "Atlanta": (33.7490, -84.3880),
            "Boston": (42.3601, -71.0589),
            "Miami": (25.7617, -80.1918),
            "Seattle": (47.6062, -122.3321),
            "Denver": (39.7392, -104.9903),
            "Las Vegas": (36.1699, -115.1398),
            "Nashville": (36.1627, -86.7816),
            "Memphis": (35.1495, -90.0490),
            "Milwaukee": (43.0389, -87.9065),
            "Orlando": (28.5383, -81.3792),
            "Jacksonville": (30.3322, -81.6557),
            "Tampa": (27.9506, -82.4572),
            "Austin": (30.2672, -97.7431),
        }

        # Simple matching - in production you'd use proper geocoding
        for city, coords in mock_coords.items():
            if city.lower() in address.lower():
                return coords

        # Default coordinates if not found
        return (39.8283, -98.5795)  # Geographic center of US

    def calculate_route(self, trip: Trip) -> Dict:
        """Calculate route with stops and breaks"""
        # Get coordinates for locations
        current_coords = self.get_coordinates(trip.current_location)
        pickup_coords = self.get_coordinates(trip.pickup_location)
        dropoff_coords = self.get_coordinates(trip.dropoff_location)

        # Calculate distance and duration (simplified calculation)
        total_distance = self._calculate_distance(pickup_coords, dropoff_coords)
        driving_duration = total_distance / 55  # Assuming 55 mph average speed

        # Update trip with calculated values
        trip.total_distance = total_distance
        trip.estimated_duration = driving_duration
        trip.save()

        # Create route stops
        stops = self._generate_route_stops(trip, current_coords, pickup_coords, dropoff_coords, total_distance, driving_duration)

        return {
            'total_distance': total_distance,
            'estimated_duration': driving_duration,
            'stops': stops,
            'route_geometry': self._generate_route_geometry(current_coords, pickup_coords, dropoff_coords)
        }

    def _calculate_distance(self, coord1: Tuple[float, float], coord2: Tuple[float, float]) -> float:
        """Calculate distance between two coordinates (simplified)"""
        import math

        lat1, lon1 = coord1
        lat2, lon2 = coord2

        # Haversine formula
        R = 3959  # Earth's radius in miles
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
        distance = R * c

        return distance

    def _generate_route_stops(self, trip: Trip, current_coords, pickup_coords, dropoff_coords, total_distance, driving_duration) -> List[Dict]:
        """Generate required stops based on HOS regulations"""
        stops = []
        current_time = datetime.now()
        order = 0

        # Pickup stop
        stops.append({
            'trip': trip,
            'stop_type': 'pickup',
            'location': trip.pickup_location,
            'latitude': pickup_coords[0],
            'longitude': pickup_coords[1],
            'estimated_arrival': current_time + timedelta(hours=1),  # 1 hour to get to pickup
            'duration_minutes': 60,  # 1 hour for pickup
            'order': order
        })
        order += 1

        # Calculate mandatory breaks and fuel stops
        current_time = current_time + timedelta(hours=2)  # After pickup
        distance_covered = 0

        # Add fuel stops every 1000 miles
        fuel_intervals = int(total_distance / 1000)
        for i in range(fuel_intervals):
            distance_covered += 1000
            fuel_time = current_time + timedelta(hours=(distance_covered / 55))

            stops.append({
                'trip': trip,
                'stop_type': 'fuel_stop',
                'location': f"Fuel Stop {i+1}",
                'latitude': pickup_coords[0] + (dropoff_coords[0] - pickup_coords[0]) * (distance_covered / total_distance),
                'longitude': pickup_coords[1] + (dropoff_coords[1] - pickup_coords[1]) * (distance_covered / total_distance),
                'estimated_arrival': fuel_time,
                'duration_minutes': 30,
                'order': order
            })
            order += 1

        # Add mandatory rest breaks based on HOS regulations
        if driving_duration > 8:  # Need mandatory 30-min break after 8 hours
            break_time = current_time + timedelta(hours=8)
            stops.append({
                'trip': trip,
                'stop_type': 'mandatory_break',
                'location': "Mandatory Rest Break",
                'latitude': pickup_coords[0] + (dropoff_coords[0] - pickup_coords[0]) * 0.6,
                'longitude': pickup_coords[1] + (dropoff_coords[1] - pickup_coords[1]) * 0.6,
                'estimated_arrival': break_time,
                'duration_minutes': 30,
                'order': order
            })
            order += 1

        # Dropoff stop
        final_arrival = current_time + timedelta(hours=driving_duration + 1)  # Include breaks
        stops.append({
            'trip': trip,
            'stop_type': 'dropoff',
            'location': trip.dropoff_location,
            'latitude': dropoff_coords[0],
            'longitude': dropoff_coords[1],
            'estimated_arrival': final_arrival,
            'duration_minutes': 60,  # 1 hour for dropoff
            'order': order
        })

        # Create RouteStop objects and return serializable data
        created_stops = []
        for stop_data in stops:
            route_stop = RouteStop.objects.create(**stop_data)
            created_stops.append({
                'id': route_stop.id,
                'trip_id': str(route_stop.trip.id),
                'stop_type': route_stop.stop_type,
                'location': route_stop.location,
                'latitude': route_stop.latitude,
                'longitude': route_stop.longitude,
                'estimated_arrival': route_stop.estimated_arrival.isoformat(),
                'duration_minutes': route_stop.duration_minutes,
                'order': route_stop.order
            })

        return created_stops

    def _generate_route_geometry(self, current_coords, pickup_coords, dropoff_coords) -> List[List[float]]:
        """Generate simple route geometry (in production, use routing API)"""
        return [
            [current_coords[1], current_coords[0]],  # Current location
            [pickup_coords[1], pickup_coords[0]],    # Pickup
            [dropoff_coords[1], dropoff_coords[0]]   # Dropoff
        ]

class HOSService:
    """Service for Hours of Service calculations and compliance"""

    def calculate_hos_compliance(self, trip: Trip) -> Dict:
        """Calculate HOS compliance and generate ELD logs"""
        violations = []
        eld_logs = []

        # Check current cycle hours
        if trip.current_cycle_hours >= 70:
            violations.append({
                'trip': trip,
                'violation_type': 'cycle_limit',
                'description': 'Driver has reached 70-hour limit for 8-day cycle',
                'severity': 'violation'
            })
        elif trip.current_cycle_hours >= 60:
            violations.append({
                'trip': trip,
                'violation_type': 'cycle_limit',
                'description': 'Driver approaching 70-hour limit for 8-day cycle',
                'severity': 'warning'
            })

        # Generate ELD logs based on trip
        self._generate_eld_logs(trip, eld_logs)

        # Check for violations in generated logs
        self._check_daily_violations(eld_logs, violations, trip)

        # Create violation records and prepare serializable response
        created_violations = []
        for violation_data in violations:
            violation = HOSViolation.objects.create(**violation_data)
            created_violations.append({
                'id': violation.id,
                'trip_id': str(violation.trip.id),
                'violation_type': violation.violation_type,
                'description': violation.description,
                'severity': violation.severity,
                'created_at': violation.created_at.isoformat()
            })

        return {
            'violations': created_violations,
            'eld_logs': eld_logs,
            'remaining_hours': 70 - trip.current_cycle_hours,
            'can_complete_trip': len([v for v in created_violations if v['severity'] == 'violation']) == 0
        }

    def _generate_eld_logs(self, trip: Trip, eld_logs: List[Dict]):
        """Generate clean, simple ELD log entries"""
        current_date = datetime.now().date()
        current_time = datetime.combine(current_date, time(8, 0))  # Start at 8 AM
        total_distance = trip.total_distance or 1000
        total_driving_hours = min(11, total_distance / 55)

        # 1. Pre-trip inspection (30 minutes)
        end_time = current_time + timedelta(minutes=30)
        eld_logs.append({
            'trip': trip,
            'date': current_date,
            'start_time': current_time.time(),
            'end_time': end_time.time(),
            'duty_status': 'on_duty_not_driving',
            'location': trip.current_location,
            'vehicle_miles': 0,
            'total_hours': 0.5,
            'driving_time': 0,
            'on_duty_time': 0.5
        })
        current_time = end_time

        # 2. Travel to pickup (1 hour)
        end_time = current_time + timedelta(hours=1)
        eld_logs.append({
            'trip': trip,
            'date': current_date,
            'start_time': current_time.time(),
            'end_time': end_time.time(),
            'duty_status': 'driving',
            'location': f"En route to {trip.pickup_location}",
            'vehicle_miles': 50,
            'total_hours': 1.0,
            'driving_time': 1.0,
            'on_duty_time': 1.0
        })
        current_time = end_time

        # 3. Pickup (1 hour)
        end_time = current_time + timedelta(hours=1)
        eld_logs.append({
            'trip': trip,
            'date': current_date,
            'start_time': current_time.time(),
            'end_time': end_time.time(),
            'duty_status': 'on_duty_not_driving',
            'location': trip.pickup_location,
            'vehicle_miles': 0,
            'total_hours': 1.0,
            'driving_time': 0,
            'on_duty_time': 1.0
        })
        current_time = end_time

        # 4. Main driving leg (8-10 hours, broken up by fuel stops and breaks)
        # For long trips, we'll add fuel stops and mandatory breaks
        if total_distance > 1000:
            # First driving segment (4 hours to Fuel Stop 1)
            end_time = current_time + timedelta(hours=4)
            eld_logs.append({
                'trip': trip,
                'date': current_date,
                'start_time': current_time.time(),
                'end_time': end_time.time(),
                'duty_status': 'driving',
                'location': "En route to Fuel Stop 1",
                'vehicle_miles': 220,  # 4 hours * 55 mph
                'total_hours': 4.0,
                'driving_time': 4.0,
                'on_duty_time': 4.0
            })
            current_time = end_time

            # Fuel Stop 1 (30 minutes)
            end_time = current_time + timedelta(minutes=30)
            eld_logs.append({
                'trip': trip,
                'date': current_date,
                'start_time': current_time.time(),
                'end_time': end_time.time(),
                'duty_status': 'on_duty_not_driving',
                'location': "Fuel Stop 1",
                'vehicle_miles': 0,
                'total_hours': 0.5,
                'driving_time': 0,
                'on_duty_time': 0.5
            })
            current_time = end_time

            # Second driving segment (4 hours to Fuel Stop 2)
            end_time = current_time + timedelta(hours=4)
            eld_logs.append({
                'trip': trip,
                'date': current_date,
                'start_time': current_time.time(),
                'end_time': end_time.time(),
                'duty_status': 'driving',
                'location': "En route to Fuel Stop 2",
                'vehicle_miles': 220,
                'total_hours': 4.0,
                'driving_time': 4.0,
                'on_duty_time': 4.0
            })
            current_time = end_time

            # Fuel Stop 2 (30 minutes)
            end_time = current_time + timedelta(minutes=30)
            eld_logs.append({
                'trip': trip,
                'date': current_date,
                'start_time': current_time.time(),
                'end_time': end_time.time(),
                'duty_status': 'on_duty_not_driving',
                'location': "Fuel Stop 2",
                'vehicle_miles': 0,
                'total_hours': 0.5,
                'driving_time': 0,
                'on_duty_time': 0.5
            })
            current_time = end_time

            # Mandatory break (30 minutes sleeper berth)
            if total_driving_hours > 8:
                end_time = current_time + timedelta(minutes=30)
                eld_logs.append({
                    'trip': trip,
                    'date': current_date,
                    'start_time': current_time.time(),
                    'end_time': end_time.time(),
                    'duty_status': 'sleeper_berth',
                    'location': "Mandatory Rest Break",
                    'vehicle_miles': 0,
                    'total_hours': 0.5,
                    'driving_time': 0,
                    'on_duty_time': 0
                })
                current_time = end_time

            # Final driving segment to dropoff
            remaining_hours = max(1, total_driving_hours - 8)  # At least 1 hour
            end_time = current_time + timedelta(hours=remaining_hours)
            eld_logs.append({
                'trip': trip,
                'date': current_date,
                'start_time': current_time.time(),
                'end_time': end_time.time(),
                'duty_status': 'driving',
                'location': f"En route to {trip.dropoff_location}",
                'vehicle_miles': int(remaining_hours * 55),
                'total_hours': remaining_hours,
                'driving_time': remaining_hours,
                'on_duty_time': remaining_hours
            })
            current_time = end_time
        else:
            # Short trip - single driving segment
            end_time = current_time + timedelta(hours=total_driving_hours)
            eld_logs.append({
                'trip': trip,
                'date': current_date,
                'start_time': current_time.time(),
                'end_time': end_time.time(),
                'duty_status': 'driving',
                'location': f"En route to {trip.dropoff_location}",
                'vehicle_miles': int(total_distance),
                'total_hours': total_driving_hours,
                'driving_time': total_driving_hours,
                'on_duty_time': total_driving_hours
            })
            current_time = end_time

        # 5. Dropoff (1 hour)
        end_time = current_time + timedelta(hours=1)
        eld_logs.append({
            'trip': trip,
            'date': current_date,
            'start_time': current_time.time(),
            'end_time': end_time.time(),
            'duty_status': 'on_duty_not_driving',
            'location': trip.dropoff_location,
            'vehicle_miles': 0,
            'total_hours': 1.0,
            'driving_time': 0,
            'on_duty_time': 1.0
        })
        current_time = end_time

        # Create ELD log records and update eld_logs with serializable data
        temp_logs = eld_logs.copy()  # Keep the original data for database creation
        eld_logs.clear()  # Clear to rebuild with serializable data

        for log_data in temp_logs:
            eld_log = ELDLog.objects.create(**log_data)
            eld_logs.append({
                'id': eld_log.id,
                'trip_id': str(eld_log.trip.id),
                'date': eld_log.date.isoformat(),
                'start_time': eld_log.start_time.strftime('%H:%M:%S'),
                'end_time': eld_log.end_time.strftime('%H:%M:%S'),
                'duty_status': eld_log.duty_status,
                'location': eld_log.location,
                'vehicle_miles': eld_log.vehicle_miles,
                'total_hours': eld_log.total_hours,
                'driving_time': eld_log.driving_time,
                'on_duty_time': eld_log.on_duty_time
            })

    def _check_daily_violations(self, eld_logs: List[Dict], violations: List[Dict], trip: Trip):
        """Check for daily HOS violations"""
        total_driving = sum(log['driving_time'] for log in eld_logs)
        total_on_duty = sum(log['on_duty_time'] for log in eld_logs)

        # 11-hour driving rule
        if total_driving > 11:
            violations.append({
                'trip': trip,
                'violation_type': 'daily_driving',
                'description': f'Daily driving time ({total_driving:.1f} hours) exceeds 11-hour limit',
                'severity': 'violation'
            })
        elif total_driving > 10:
            violations.append({
                'trip': trip,
                'violation_type': 'daily_driving',
                'description': f'Daily driving time ({total_driving:.1f} hours) approaching 11-hour limit',
                'severity': 'warning'
            })

        # 14-hour duty rule
        if total_on_duty > 14:
            violations.append({
                'trip': trip,
                'violation_type': 'daily_duty',
                'description': f'Daily on-duty time ({total_on_duty:.1f} hours) exceeds 14-hour limit',
                'severity': 'violation'
            })
        elif total_on_duty > 12:
            violations.append({
                'trip': trip,
                'violation_type': 'daily_duty',
                'description': f'Daily on-duty time ({total_on_duty:.1f} hours) approaching 14-hour limit',
                'severity': 'warning'
            })
