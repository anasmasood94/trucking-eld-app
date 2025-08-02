# Trucking ELD Application

A full-stack Electronic Logging Device (ELD) application for trucking companies, built with Django REST API backend and React frontend. This application helps drivers plan trips, track Hours of Service (HOS) compliance, and generate required ELD logs.

## Features

### Core Functionality
- **Trip Planning**: Input current location, pickup location, dropoff location, and current cycle hours
- **Route Calculation**: Automatic route planning with mandatory stops and breaks
- **HOS Compliance**: Real-time tracking of 70-hour/8-day cycle regulations
- **ELD Log Generation**: Automatic generation of driver daily logs
- **Interactive Map**: Visual route display with stops and breaks
- **Compliance Monitoring**: Warnings and violations for HOS regulations

### HOS Regulations Implemented
- Property-carrying driver regulations (70hrs/8days cycle)
- 11-hour daily driving limit
- 14-hour daily on-duty limit
- Mandatory 30-minute break after 8 hours of driving
- Automatic fuel stops every 1,000 miles
- 1-hour allocation for pickup and drop-off operations

## Technology Stack

### Backend
- **Django 5.2.4**: Web framework
- **Django REST Framework**: API development
- **SQLite**: Database (development)
- **Python 3.x**: Programming language

### Frontend
- **React 18**: Frontend framework
- **Bootstrap 5**: UI framework
- **Leaflet**: Interactive maps
- **Axios**: HTTP client
- **FontAwesome**: Icons

## Installation & Setup

### Prerequisites
- Python 3.8+
- Node.js 14+
- npm or yarn

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd trucking-eld-app
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run migrations**
   ```bash
   cd backend
   python manage.py makemigrations
   python manage.py migrate
   ```

5. **Start Django server**
   ```bash
   python manage.py runserver
   ```

   Backend will be available at: `http://localhost:8000`

### Frontend Setup

1. **Install Node.js dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Start React development server**
   ```bash
   npm start
   ```

   Frontend will be available at: `http://localhost:3000`

## Usage

1. **Access the application** at `http://localhost:3000`

2. **Plan a Trip**:
   - Navigate to "Trip Planning" tab
   - Enter your current location
   - Enter pickup location
   - Enter dropoff location
   - Enter current cycle hours used (0-70)
   - Click "Create Trip & Calculate Route"

3. **View Route & Map**:
   - Automatically redirected after trip creation
   - View interactive map with route and stops
   - Check HOS compliance status
   - Review mandatory breaks and fuel stops

4. **Review ELD Logs**:
   - Navigate to "ELD Logs" tab
   - View visual daily log chart
   - Review detailed log entries
   - Check daily summary and remaining hours

## API Endpoints

### Trips
- `POST /api/trips/` - Create new trip
- `GET /api/trips/{id}/` - Get trip details
- `GET /api/trips/{id}/route/` - Get trip route information
- `GET /api/trips/{id}/eld_logs/` - Get trip ELD logs
- `GET /api/trips/{id}/hos_compliance/` - Get HOS compliance status

### Route Stops
- `GET /api/route-stops/?trip_id={id}` - Get route stops for trip

### ELD Logs
- `GET /api/eld-logs/?trip_id={id}` - Get ELD logs for trip

### HOS Violations
- `GET /api/hos-violations/?trip_id={id}` - Get HOS violations for trip

## Project Structure

```
trucking-eld-app/
├── backend/                 # Django backend
│   ├── backend/            # Project settings
│   ├── eld_api/           # Main API app
│   │   ├── models.py      # Database models
│   │   ├── views.py       # API views
│   │   ├── serializers.py # Data serializers
│   │   └── services.py    # Business logic
│   └── manage.py
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── TripForm.js
│   │   │   ├── RouteMap.js
│   │   │   └── ELDLogs.js
│   │   ├── services/      # API services
│   │   └── App.js         # Main app component
│   └── package.json
├── requirements.txt        # Python dependencies
└── README.md
```

## Compliance Notes

- This application simulates ELD functionality for demonstration purposes
- In production, certified ELD devices would be required for legal compliance
- HOS calculations are based on FMCSA regulations for property-carrying drivers
- The application assumes no adverse driving conditions and normal operations

## Development

### Running Tests
```bash
# Backend tests
cd backend
python manage.py test

# Frontend tests
cd frontend
npm test
```

### Building for Production
```bash
# Frontend build
cd frontend
npm run build
```

## Deployment

The application can be deployed to various platforms:

### Vercel (Frontend) + Heroku (Backend)
1. Deploy backend to Heroku with PostgreSQL addon
2. Deploy frontend to Vercel
3. Update CORS settings and API URLs

### Docker Deployment
1. Create Dockerfiles for both frontend and backend
2. Use docker-compose for local development
3. Deploy to cloud container services

## License

This project is created for educational/assessment purposes.

## Contact

For questions about this implementation, please refer to the development documentation or contact the development team.
