import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'leaflet/dist/leaflet.css';
import './App.css';
import TripForm from './components/TripForm';
import RouteMap from './components/RouteMap';
import ELDLogs from './components/ELDLogs';
import { Container, Nav, Navbar } from 'react-bootstrap';

function App() {
  const [activeTab, setActiveTab] = useState('trip-form');
  const [currentTrip, setCurrentTrip] = useState(null);
  const [tripData, setTripData] = useState(null);

  const handleTripCreated = (trip, route, compliance) => {
    setCurrentTrip(trip);
    setTripData({ trip, route, compliance });
    setActiveTab('route-map');
  };

  return (
    <div className="App">
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container>
                  <Navbar.Brand
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setActiveTab('trip-form');
          }}
          style={{ cursor: 'pointer' }}
        >
          <i className="fas fa-truck mr-2"></i>
          TruckSafe ELD
        </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link
                active={activeTab === 'trip-form'}
                onClick={() => setActiveTab('trip-form')}
              >
                Trip Planning
              </Nav.Link>
              <Nav.Link
                active={activeTab === 'route-map'}
                onClick={() => setActiveTab('route-map')}
                disabled={!currentTrip}
              >
                Route & Map
              </Nav.Link>
              <Nav.Link
                active={activeTab === 'eld-logs'}
                onClick={() => setActiveTab('eld-logs')}
                disabled={!currentTrip}
              >
                ELD Logs
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container fluid className="mt-4">
        {activeTab === 'trip-form' && (
          <TripForm onTripCreated={handleTripCreated} />
        )}

        {activeTab === 'route-map' && tripData && (
          <RouteMap tripData={tripData} />
        )}

        {activeTab === 'eld-logs' && currentTrip && (
          <ELDLogs tripId={currentTrip.id} />
        )}
      </Container>
    </div>
  );
}

export default App;
