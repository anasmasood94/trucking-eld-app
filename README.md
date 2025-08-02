# 🚛 TruckSafe ELD

## 🏆 Key Features

### 📊 **Federal Compliance Engine**
- ✅ **70-hour/8-day cycle tracking** (FMCSA regulations)
- ✅ **11-hour daily driving limit** enforcement
- ✅ **14-hour duty period** monitoring
- ✅ **Mandatory 30-minute break** scheduling
- ✅ **10-hour rest period** validation

### 🗺️ **Intelligent Route Planning**
- 🛣️ **Dynamic route calculation** with traffic considerations
- ⛽ **Automatic fuel stop scheduling** (every 1,000 miles)
- 🛌 **Mandatory rest break placement**
- 🎯 **Pickup/dropoff time allocation**

---

## 🛠️ Technology Stack

### **Backend (API Layer)**
```
🐍 Django 5.2.4          - Robust web framework
📡 Django REST Framework  - RESTful API development
🗄️ SQLite/PostgreSQL     - Reliable data storage
🚀 WSGI/ASGI            - Production deployment
```

### **Frontend (User Interface)**
```
⚛️ React 18              - Modern UI framework
🎨 Bootstrap 5           - Professional styling
🗺️ Leaflet Maps          - Interactive mapping
📞 Axios HTTP Client     - API communication
🎯 FontAwesome Icons     - Professional iconography
```

---

## ⚡ Quick Start

### Local Development**

```bash
# Clone the repository
git clone https://github.com/yourusername/trucking-eld-app.git
cd trucking-eld-app

# Install dependencies
npm install

# Start both frontend and backend
npm run dev

# Access the application
open http://localhost:3000
```

**🎯 Ready to test in 60 seconds!**

---

## 📋 Demo Test Scenarios

### **Test Case 1: Compliant Regional Trip** 🟢
```
📍 Current Location: Dallas, TX
📍 Pickup: Houston, TX
📍 Dropoff: Austin, TX
⏰ Current Cycle Hours: 25

Expected: Green compliance status, clean route planning
```

### **Test Case 2: Cross-Country Haul** 🗺️
```
📍 Current Location: New York, NY
📍 Pickup: Boston, MA
📍 Dropoff: Los Angeles, CA
⏰ Current Cycle Hours: 20

Expected: Multi-day planning with fuel stops and rest breaks
```

### **Test Case 3: HOS Violation Detection** 🚨
```
📍 Current Location: Seattle, WA
📍 Pickup: Los Angeles, CA
📍 Dropoff: Miami, FL
⏰ Current Cycle Hours: 30

Expected: Violation alerts, mandatory rest requirements
```

---

## 📁 Project Structure

```
trucking-eld-app/
├── 🎨 frontend/                 # React application
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── services/          # API service layer
│   │   ├── constants/         # App configuration
│   │   └── utils/             # Helper functions
│   └── public/                # Static assets
├── 🛠️ backend/                  # Django API
│   ├── config/                # Project settings
│   ├── eld_api/              # Core ELD functionality
│   │   ├── models.py         # Data models
│   │   ├── views.py          # API endpoints
│   │   ├── serializers.py    # Data serialization
│   │   └── services.py       # Business logic
│   └── manage.py             # Django management
├── 🚀 vercel.json              # Deployment configuration
├── 📋 package.json             # Project dependencies
└── 📖 README.md               # This file
```

---

## 🔧 Development

### **Prerequisites**
- Python 3.8+ 🐍
- Node.js 16+ ⚡
- npm/yarn 📦

### **Backend Setup**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### **Frontend Setup**
```bash
cd frontend
npm install
npm start
```

### **Full Stack Development**
```bash
# From project root
npm run dev  # Starts both backend and frontend
```
