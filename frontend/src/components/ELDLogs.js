import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { apiService } from '../services/api';

const ELDLogs = ({ tripId }) => {
  const [eldLogs, setEldLogs] = useState([]);
  const [dailySummary, setDailySummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchELDLogs = async () => {
      try {
        setLoading(true);
        const response = await apiService.getTripELDLogs(tripId);
        setEldLogs(response.logs || []);
        setDailySummary(response.daily_summary || {});
      } catch (err) {
        setError('Failed to fetch ELD logs');
        console.error('Error fetching ELD logs:', err);
      } finally {
        setLoading(false);
      }
    };

    if (tripId) {
      fetchELDLogs();
    }
  }, [tripId]);

  const getDutyStatusBadge = (status) => {
    const statusConfig = {
      off_duty: { variant: 'secondary', label: 'Off Duty', icon: 'fa-home' },
      sleeper_berth: { variant: 'info', label: 'Sleeper Berth', icon: 'fa-bed' },
      driving: { variant: 'success', label: 'Driving', icon: 'fa-truck' },
      on_duty_not_driving: { variant: 'warning', label: 'On Duty (Not Driving)', icon: 'fa-tools' }
    };

    const config = statusConfig[status] || statusConfig.off_duty;
    return (
      <Badge variant={config.variant}>
        <i className={`fas ${config.icon} mr-1`}></i>
        {config.label}
      </Badge>
    );
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };



  const groupLogsByDate = (logs) => {
    const grouped = {};
    logs.forEach(log => {
      const date = log.date;
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(log);
    });
    return grouped;
  };

  const getDutyStatusAbbreviation = (dutyStatus, duration) => {
    const abbreviations = {
      off_duty: 'OFF',
      sleeper_berth: 'SB',
      driving: 'DRIVING',
      on_duty_not_driving: 'ON DUTY'
    };

    // Only show text if block is wide enough (more than 2 hours)
    if (duration < 2) return '';

    // For very wide blocks (>6 hours), show full text for driving and on duty
    if (duration >= 6 && dutyStatus === 'on_duty_not_driving') {
      return 'ON DUTY';
    }

    return abbreviations[dutyStatus] || '';
  };



  if (loading) {
    return (
      <div className="text-center">
        <Spinner animation="border" role="status">
          <span className="sr-only">Loading ELD logs...</span>
        </Spinner>
        <p className="mt-2">Loading ELD logs...</p>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  return (
    <div>
      <Row>
        <Col>
          <Card>
            <Card.Header className="bg-dark text-white">
              <h4 className="mb-0">
                <i className="fas fa-clipboard-list mr-2"></i>
                Electronic Logging Device (ELD) Records
              </h4>
            </Card.Header>
            <Card.Body>
              <Row className="mb-4">
                <Col md={6}>
                  <h6>Daily Summary</h6>
                  <Table size="sm" bordered>
                    <tbody>
                      <tr>
                        <td><strong>Total Driving Time:</strong></td>
                        <td>{dailySummary.total_driving_time?.toFixed(1)} hours</td>
                      </tr>
                      <tr>
                        <td><strong>Total On-Duty Time:</strong></td>
                        <td>{dailySummary.total_on_duty_time?.toFixed(1)} hours</td>
                      </tr>
                      <tr>
                        <td><strong>Total Miles:</strong></td>
                        <td>{dailySummary.total_miles} miles</td>
                      </tr>
                      <tr>
                        <td><strong>Remaining Driving Time:</strong></td>
                        <td>{dailySummary.remaining_driving_time?.toFixed(1)} hours</td>
                      </tr>
                      <tr>
                        <td><strong>Remaining On-Duty Time:</strong></td>
                        <td>{dailySummary.remaining_on_duty_time?.toFixed(1)} hours</td>
                      </tr>
                    </tbody>
                  </Table>
                </Col>
                <Col md={6}>
                  <h6>HOS Limits</h6>
                  <div className="mb-2">
                    <small className="text-muted">Driving Time (11-hour limit)</small>
                    <div className="progress">
                      <div
                        className={`progress-bar ${dailySummary.total_driving_time > 11 ? 'bg-danger' : dailySummary.total_driving_time > 10 ? 'bg-warning' : 'bg-success'}`}
                        role="progressbar"
                        style={{ width: `${Math.min((dailySummary.total_driving_time / 11) * 100, 100)}%` }}
                      >
                        {dailySummary.total_driving_time?.toFixed(1)}h
                      </div>
                    </div>
                  </div>
                  <div className="mb-2">
                    <small className="text-muted">On-Duty Time (14-hour limit)</small>
                    <div className="progress">
                      <div
                        className={`progress-bar ${dailySummary.total_on_duty_time > 14 ? 'bg-danger' : dailySummary.total_on_duty_time > 12 ? 'bg-warning' : 'bg-success'}`}
                        role="progressbar"
                        style={{ width: `${Math.min((dailySummary.total_on_duty_time / 14) * 100, 100)}%` }}
                      >
                        {dailySummary.total_on_duty_time?.toFixed(1)}h
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>

              {/* Visual ELD Chart */}
              <div className="mb-4">
                <h6>Driver's Daily Log Chart</h6>
                <div
                  className="eld-visual-chart"
                  style={{
                    position: 'relative',
                    height: `${eldLogs.length * 35 + 50}px`,
                    border: '1px solid #dee2e6',
                    backgroundColor: '#f8f9fa',
                    padding: '10px'
                  }}
                >
                  {/* Time scale */}
                  <div style={{ display: 'flex', marginBottom: '10px' }}>
                    {Array.from({ length: 25 }, (_, i) => (
                      <div
                        key={i}
                        style={{
                          flex: 1,
                          textAlign: 'center',
                          fontSize: '10px',
                          borderLeft: i % 4 === 0 ? '1px solid #adb5bd' : '1px solid #e9ecef'
                        }}
                      >
                        {i < 24 ? i.toString().padStart(2, '0') : ''}
                      </div>
                    ))}
                  </div>

                  {/* Log bars */}
                                    {eldLogs.map((log, index) => {
                    const startHour = parseInt(log.start_time.split(':')[0]);
                    const startMinute = parseInt(log.start_time.split(':')[1]);

                    const startPosition = (startHour + startMinute / 60) * (100 / 24);
                    const duration = log.total_hours * (100 / 24);

                    const dutyStatusColors = {
                      off_duty: '#6c757d',
                      sleeper_berth: '#17a2b8',
                      driving: '#28a745',
                      on_duty_not_driving: '#ffc107'
                    };

                    return (
                      <div
                        key={index}
                        style={{
                          position: 'absolute',
                          left: `${startPosition}%`,
                          width: `${duration}%`,
                          height: '25px',
                          backgroundColor: dutyStatusColors[log.duty_status],
                          top: `${40 + index * 30}px`,
                          border: '1px solid #fff',
                          borderRadius: '3px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '10px',
                          fontWeight: 'bold',
                          textAlign: 'center',
                          overflow: 'hidden',
                          whiteSpace: 'nowrap'
                        }}
                        title={`${log.duty_status.replace('_', ' ').toUpperCase()}: ${formatTime(log.start_time)} - ${formatTime(log.end_time)} (${log.total_hours.toFixed(1)}h)`}
                      >
                        {/* {getDutyStatusAbbreviation(log.duty_status, log.total_hours)} */}
                      </div>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="mt-2">
                  <small className="text-muted">
                    <span className="mr-3">
                      <span style={{ backgroundColor: '#6c757d', width: '12px', height: '12px', display: 'inline-block', marginRight: '4px' }}></span>
                      Off Duty
                    </span>
                    <span className="mr-3">
                      <span style={{ backgroundColor: '#17a2b8', width: '12px', height: '12px', display: 'inline-block', marginRight: '4px' }}></span>
                      Sleeper Berth
                    </span>
                    <span className="mr-3">
                      <span style={{ backgroundColor: '#28a745', width: '12px', height: '12px', display: 'inline-block', marginRight: '4px' }}></span>
                      Driving
                    </span>
                    <span>
                      <span style={{ backgroundColor: '#ffc107', width: '12px', height: '12px', display: 'inline-block', marginRight: '4px' }}></span>
                      On Duty (Not Driving)
                    </span>
                  </small>
                  <br />
                  <small className="text-muted">
                    <em>Note: Abbreviations (OFF, SB, DRIVING, ON DUTY) are shown for shorter time blocks. Hover over blocks for detailed information.</em>
                  </small>
                </div>
              </div>

              {/* Detailed Log Table */}
              <h6>Detailed Log Entries</h6>
              <Table striped bordered hover size="sm">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Start Time</th>
                    <th>End Time</th>
                    <th>Duty Status</th>
                    <th>Location</th>
                    <th>Vehicle Miles</th>
                    <th>Total Hours</th>
                    <th>Driving Time</th>
                    <th>On Duty Time</th>
                  </tr>
                </thead>
                <tbody>
                  {eldLogs.map((log, index) => (
                    <tr key={index}>
                      <td>{formatDate(log.date)}</td>
                      <td>{formatTime(log.start_time)}</td>
                      <td>{formatTime(log.end_time)}</td>
                      <td>{getDutyStatusBadge(log.duty_status)}</td>
                      <td>{log.location}</td>
                      <td>{log.vehicle_miles}</td>
                      <td>{log.total_hours?.toFixed(1)}h</td>
                      <td>{log.driving_time?.toFixed(1)}h</td>
                      <td>{log.on_duty_time?.toFixed(1)}h</td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              <div className="mt-3">
                <small className="text-muted">
                  <strong>Note:</strong> This ELD log is automatically generated based on your trip plan and HOS regulations.
                  In a real-world scenario, drivers would use certified ELD devices to record actual duty status changes.
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ELDLogs;
