import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL ||
  (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:8000/api');

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API service methods
export const apiService = {
  // Trip management
  createTrip: async (tripData) => {
    const response = await api.post('/trips/', tripData);
    return response.data;
  },

  getTrip: async (tripId) => {
    const response = await api.get(`/trips/${tripId}/`);
    return response.data;
  },

  getTripRoute: async (tripId) => {
    const response = await api.get(`/trips/${tripId}/route/`);
    return response.data;
  },

  getTripELDLogs: async (tripId) => {
    const response = await api.get(`/trips/${tripId}/eld_logs/`);
    return response.data;
  },

  getTripHOSCompliance: async (tripId) => {
    const response = await api.get(`/trips/${tripId}/hos_compliance/`);
    return response.data;
  },

  // Route stops
  getRouteStops: async (tripId) => {
    const response = await api.get(`/route-stops/?trip_id=${tripId}`);
    return response.data;
  },

  // ELD logs
  getELDLogs: async (tripId) => {
    const response = await api.get(`/eld-logs/?trip_id=${tripId}`);
    return response.data;
  },

  // HOS violations
  getHOSViolations: async (tripId) => {
    const response = await api.get(`/hos-violations/?trip_id=${tripId}`);
    return response.data;
  },
};

export default apiService;
