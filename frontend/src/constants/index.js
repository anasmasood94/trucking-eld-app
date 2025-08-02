// Application Constants

// HOS (Hours of Service) Regulations
export const HOS_LIMITS = {
  DAILY_DRIVING_LIMIT: 11, // hours
  DAILY_DUTY_LIMIT: 14, // hours
  WEEKLY_CYCLE_LIMIT: 70, // hours for 8-day cycle
  MANDATORY_BREAK_HOURS: 8, // hours before 30-min break required
  MANDATORY_BREAK_DURATION: 30, // minutes
  MINIMUM_REST_PERIOD: 10, // hours
  RESTART_PERIOD: 34 // hours for 70-hour restart
};

// Stop Types
export const STOP_TYPES = {
  PICKUP: 'pickup',
  DROPOFF: 'dropoff',
  FUEL_STOP: 'fuel_stop',
  MANDATORY_BREAK: 'mandatory_break',
  REST_STOP: 'rest_stop'
};

// Duty Status Types
export const DUTY_STATUS = {
  OFF_DUTY: 'off_duty',
  SLEEPER_BERTH: 'sleeper_berth',
  DRIVING: 'driving',
  ON_DUTY_NOT_DRIVING: 'on_duty_not_driving'
};

// Application Settings
export const APP_CONFIG = {
  DEFAULT_SPEED: 55, // mph average driving speed
  FUEL_STOP_INTERVAL: 1000, // miles between fuel stops
  MIN_FUEL_STOP_DURATION: 30, // minutes
  DEFAULT_PICKUP_DURATION: 60, // minutes
  DEFAULT_DROPOFF_DURATION: 60, // minutes
  MAP_DEFAULT_ZOOM: 4,
  MAP_ROUTE_ZOOM: 6
};

// API Endpoints
export const API_ENDPOINTS = {
  TRIPS: '/trips/',
  ROUTE_STOPS: '/route-stops/',
  ELD_LOGS: '/eld-logs/',
  HOS_VIOLATIONS: '/hos-violations/'
};

// Colors for UI consistency
export const COLORS = {
  SUCCESS: '#28a745',
  WARNING: '#ffc107',
  DANGER: '#dc3545',
  INFO: '#17a2b8',
  SECONDARY: '#6c757d',
  PRIMARY: '#007bff'
};
