import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { Card, Row, Col, Badge, Alert, ListGroup } from 'react-bootstrap';
import { COLORS, STOP_TYPES } from '../constants';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Custom icons for different stop types
const createCustomIcon = (color, icon) => {
  return L.divIcon({
    html: `<div style="background-color: ${color}; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"><i class="fas ${icon}" style="color: white; font-size: 12px;"></i></div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
    className: 'custom-div-icon'
  });
};

const stopIcons = {
  pickup: createCustomIcon('#28a745', 'fa-play'),
  dropoff: createCustomIcon('#dc3545', 'fa-stop'),
  fuel_stop: createCustomIcon('#ffc107', 'fa-gas-pump'),
  mandatory_break: createCustomIcon('#17a2b8', 'fa-bed'),
  rest_stop: createCustomIcon('#6c757d', 'fa-coffee')
};

const RouteMap = ({ tripData }) => {
  const [mapCenter, setMapCenter] = useState([39.8283, -98.5795]); // Center of US
  const [mapZoom, setMapZoom] = useState(4);

  useEffect(() => {
    // Calculate map center and zoom based on route
    if (tripData.route.route_geometry && tripData.route.route_geometry.length > 0) {
      const lats = tripData.route.route_geometry.map(coord => coord[1]);
      const lngs = tripData.route.route_geometry.map(coord => coord[0]);

      const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
      const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;

      setMapCenter([centerLat, centerLng]);
      setMapZoom(6);
    }
  }, [tripData]);

  const formatDuration = (hours) => {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return `${wholeHours}h ${minutes}m`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getStopTypeLabel = (stopType) => {
    const labels = {
      pickup: 'Pickup',
      dropoff: 'Dropoff',
      fuel_stop: 'Fuel Stop',
      mandatory_break: 'Mandatory Break',
      rest_stop: 'Rest Stop'
    };
    return labels[stopType] || stopType;
  };

  const getStopTypeVariant = (stopType) => {
    const variants = {
      pickup: 'success',
      dropoff: 'danger',
      fuel_stop: 'warning',
      mandatory_break: 'info',
      rest_stop: 'secondary'
    };
    return variants[stopType] || 'secondary';
  };

  // Convert route geometry to format expected by Polyline
  const routeCoordinates = tripData.route.route_geometry?.map(coord => [coord[1], coord[0]]) || [];

  return (
    <Row>
      <Col lg={8}>
        <Card>
          <Card.Header className="bg-success text-white">
            <h5 className="mb-0">
              <i className="fas fa-map mr-2"></i>
              Route Map
            </h5>
          </Card.Header>
          <Card.Body style={{ padding: 0 }}>
            <MapContainer
              center={mapCenter}
              zoom={mapZoom}
              style={{ height: '500px', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* Route line */}
              {routeCoordinates.length > 0 && (
                <Polyline
                  positions={routeCoordinates}
                  color="blue"
                  weight={4}
                  opacity={0.7}
                />
              )}

              {/* Stop markers */}
              {tripData.route.stops?.map((stop, index) => (
                <Marker
                  key={index}
                  position={[stop.latitude, stop.longitude]}
                  icon={stopIcons[stop.stop_type] || stopIcons.rest_stop}
                >
                  <Popup>
                    <div>
                      <h6>{getStopTypeLabel(stop.stop_type)}</h6>
                      <p><strong>Location:</strong> {stop.location}</p>
                      <p><strong>Arrival:</strong> {formatDate(stop.estimated_arrival)}</p>
                      <p><strong>Duration:</strong> {stop.duration_minutes} minutes</p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </Card.Body>
        </Card>

        {/* Trip Summary */}
        <Card className="mt-3">
          <Card.Header className="bg-info text-white">
            <h6 className="mb-0">
              <i className="fas fa-info-circle mr-2"></i>
              Trip Summary
            </h6>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={6}>
                <p><strong>Total Distance:</strong> {tripData.route.total_distance?.toFixed(1)} miles</p>
                <p><strong>Estimated Duration:</strong> {formatDuration(tripData.route.estimated_duration)}</p>
              </Col>
              <Col md={6}>
                <p><strong>From:</strong> {tripData.trip.pickup_location}</p>
                <p><strong>To:</strong> {tripData.trip.dropoff_location}</p>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </Col>

      <Col lg={4}>
        {/* Route Stops */}
        <Card>
          <Card.Header className="bg-primary text-white">
            <h6 className="mb-0">
              <i className="fas fa-list mr-2"></i>
              Route Stops
            </h6>
          </Card.Header>
          <Card.Body style={{ maxHeight: '400px', overflowY: 'auto' }}>
            <ListGroup variant="flush">
              {tripData.route.stops?.map((stop, index) => (
                <ListGroup.Item key={index} className="px-0">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <Badge variant={getStopTypeVariant(stop.stop_type)} className="mb-1">
                        {getStopTypeLabel(stop.stop_type)}
                      </Badge>
                      <p className="mb-1 font-weight-bold">{stop.location}</p>
                      <small className="text-muted">
                        {formatDate(stop.estimated_arrival)}
                      </small>
                    </div>
                    <small className="text-muted">
                      {stop.duration_minutes}min
                    </small>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card.Body>
        </Card>

        {/* HOS Compliance Status */}
        <Card className="mt-3">
          <Card.Header className="bg-warning text-dark">
            <h6 className="mb-0">
              <i className="fas fa-exclamation-triangle mr-2"></i>
              HOS Compliance
            </h6>
          </Card.Header>
          <Card.Body>
            {tripData.compliance.violations?.length > 0 ? (
              <div>
                {tripData.compliance.violations.map((violation, index) => (
                  <Alert
                    key={index}
                    variant={violation.severity === 'violation' ? 'danger' : 'warning'}
                    className="mb-2"
                  >
                    <small>
                      <strong>{violation.violation_type.replace('_', ' ').toUpperCase()}:</strong><br />
                      {violation.description}
                    </small>
                  </Alert>
                ))}
              </div>
            ) : (
              <Alert variant="success" className="mb-0">
                <i className="fas fa-check-circle mr-2"></i>
                Trip is compliant with HOS regulations
              </Alert>
            )}

            <div className="mt-3">
              <p className="mb-1">
                <strong>Remaining Cycle Hours:</strong> {tripData.compliance.remaining_hours?.toFixed(1)} / 70
              </p>
              <div className="progress">
                <div
                  className="progress-bar"
                  role="progressbar"
                  style={{ width: `${(tripData.trip.current_cycle_hours / 70) * 100}%` }}
                  aria-valuenow={tripData.trip.current_cycle_hours}
                  aria-valuemin="0"
                  aria-valuemax="70"
                ></div>
              </div>
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default RouteMap;
