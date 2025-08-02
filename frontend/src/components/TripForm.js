import React, { useState } from 'react';
import { Card, Form, Button, Alert, Row, Col, Spinner } from 'react-bootstrap';
import { apiService } from '../services/api';

const TripForm = ({ onTripCreated }) => {
  const [formData, setFormData] = useState({
    current_location: '',
    pickup_location: '',
    dropoff_location: '',
    current_cycle_hours: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validate form
      if (!formData.current_location || !formData.pickup_location || !formData.dropoff_location) {
        throw new Error('Please fill in all location fields');
      }

      if (formData.current_cycle_hours < 0 || formData.current_cycle_hours > 70) {
        throw new Error('Current cycle hours must be between 0 and 70');
      }

      // Create trip
      const response = await apiService.createTrip(formData);
      setSuccess('Trip created successfully! Calculating route and HOS compliance...');

      // Call parent callback with trip data
      onTripCreated(response.trip, response.route, response.hos_compliance);

      // Reset form
      setFormData({
        current_location: '',
        pickup_location: '',
        dropoff_location: '',
        current_cycle_hours: 0
      });

    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create trip');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Row className="justify-content-center">
      <Col md={8} lg={6}>
        <Card>
          <Card.Header className="bg-primary text-white">
            <h4 className="mb-0">
              <i className="fas fa-route mr-2"></i>
              Trip Planning
            </h4>
          </Card.Header>
          <Card.Body>
            <p className="text-muted mb-4">
              Enter your trip details to calculate route, stops, and ELD logs according to HOS regulations.
            </p>

            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>
                  <i className="fas fa-map-marker-alt mr-2"></i>
                  Current Location
                </Form.Label>
                <Form.Control
                  type="text"
                  name="current_location"
                  value={formData.current_location}
                  onChange={handleInputChange}
                  placeholder="e.g., New York, NY"
                  required
                />
                <Form.Text className="text-muted">
                  Enter your current location or terminal
                </Form.Text>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>
                  <i className="fas fa-play mr-2"></i>
                  Pickup Location
                </Form.Label>
                <Form.Control
                  type="text"
                  name="pickup_location"
                  value={formData.pickup_location}
                  onChange={handleInputChange}
                  placeholder="e.g., Chicago, IL"
                  required
                />
                <Form.Text className="text-muted">
                  Where you need to pick up the load
                </Form.Text>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>
                  <i className="fas fa-stop mr-2"></i>
                  Dropoff Location
                </Form.Label>
                <Form.Control
                  type="text"
                  name="dropoff_location"
                  value={formData.dropoff_location}
                  onChange={handleInputChange}
                  placeholder="e.g., Los Angeles, CA"
                  required
                />
                <Form.Text className="text-muted">
                  Final delivery destination
                </Form.Text>
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>
                  <i className="fas fa-clock mr-2"></i>
                  Current Cycle Hours Used
                </Form.Label>
                <Form.Control
                  type="number"
                  name="current_cycle_hours"
                  value={formData.current_cycle_hours}
                  onChange={handleInputChange}
                  min="0"
                  max="70"
                  step="0.5"
                  required
                />
                <Form.Text className="text-muted">
                  Hours already used in your current 8-day cycle (0-70 hours)
                </Form.Text>
              </Form.Group>

              <div className="d-grid">
                <Button
                  variant="primary"
                  type="submit"
                  size="lg"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        className="mr-2"
                      />
                      Creating Trip...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-plus mr-2"></i>
                      Create Trip & Calculate Route
                    </>
                  )}
                </Button>
              </div>
            </Form>

            <hr className="my-4" />

            <div className="text-muted">
              <h6>HOS Regulations Applied:</h6>
              <ul className="small">
                <li>Property-carrying driver (70hrs/8days cycle)</li>
                <li>11-hour driving limit</li>
                <li>14-hour on-duty limit</li>
                <li>Mandatory 30-minute break after 8 hours</li>
                <li>Fuel stop every 1,000 miles</li>
                <li>1 hour allocated for pickup and drop-off</li>
              </ul>
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default TripForm;
