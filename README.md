# 🛡️ Coast Guard Monitoring System

A comprehensive real-time vessel monitoring and communication system for Coast Guard operations and fisherman safety.

## 🚀 Features

### **Fisherman Portal**
- **Vessel Registration**: Register vessels with AIS ID, boat ID, captain name, and contact info
- **Real-time GPS Tracking**: Live location updates with speed and heading
- **Status Management**: Update vessel status (safe, warning, danger)
- **Alert System**: Receive Coast Guard messages and alerts
- **Prohibited Zone Alerts**: Automatic warnings when entering restricted areas

### **Coast Guard Dashboard**
- **Fleet Monitoring**: Real-time tracking of all registered vessels
- **Interactive World Map**: Visual representation with proper icon spacing
- **Message Center**: Send priority messages to vessels
- **Vessel Management**: Update vessel status and monitor activities
- **Location Tracking**: Coast Guard vessel position tracking
- **Smart Zoom Control**: Manual zoom with auto-adjustment disabled during user interaction

### **Advanced Features**
- **Icon Overlap Prevention**: Smart positioning to avoid vessel icon overlap
- **Real-time Synchronization**: Immediate updates across browser tabs
- **Responsive Design**: Works on desktop and mobile devices
- **Debug Logging**: Comprehensive console logging for troubleshooting
- **Test Functionality**: Built-in test vessel creation for demonstration

## 🛠️ Technical Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Maps**: Leaflet + React-Leaflet
- **Icons**: Lucide React
- **State Management**: React Hooks + localStorage

## 📦 Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd finalproject/project
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser** and navigate to `http://localhost:5173/`

## 🎯 Usage

### **For Fishermen**
1. Select "Fisherman" from the main menu
2. Register your vessel with the required information
3. Grant location permissions for GPS tracking
4. Monitor your position and receive Coast Guard communications

### **For Coast Guard**
1. Select "Coast Guard" from the main menu
2. View all registered vessels on the interactive map
3. Use the message center to communicate with vessels
4. Monitor vessel status and update as needed
5. Use the "Reset View" button to return to optimal map view

### **Demo Credentials**
- **AIS ID**: `123456789`
- **Boat ID**: `VESSEL-001`
- **Captain Name**: `Captain Smith`
- **Phone**: `+1-555-0101`

## 🔧 Key Improvements Implemented

### **1. Vessel Registration Synchronization**
- ✅ Fixed issue where registered vessels weren't appearing in Coast Guard dashboard
- ✅ Implemented real-time localStorage synchronization
- ✅ Added custom events for immediate cross-tab communication
- ✅ Enhanced debugging with comprehensive console logging

### **2. Icon Overlap Prevention**
- ✅ Smart position offset for vessels at same location as Coast Guard
- ✅ Dynamic spacing for multiple vessels
- ✅ Visual indicators for offset positions
- ✅ Improved icon sizing and visual hierarchy

### **3. Map Zoom Control**
- ✅ Fixed automatic zoom interference with manual zooming
- ✅ User interaction detection to disable auto-adjustment
- ✅ Smart zoom level respect (only adjusts if too far out/close)
- ✅ Manual "Reset View" button for optimal positioning

### **4. Enhanced User Experience**
- ✅ Better visual feedback and status indicators
- ✅ Improved error handling and validation
- ✅ Responsive design for all screen sizes
- ✅ Comprehensive test functionality

## 📁 Project Structure

```
project/
├── src/
│   ├── components/
│   │   ├── AIMonitor.tsx              # AI monitoring component
│   │   ├── AlertSystem.tsx            # Alert management
│   │   ├── CoastGuardDashboard.tsx    # Main Coast Guard interface
│   │   ├── CoastGuardLocationTracker.tsx # CG vessel tracking
│   │   ├── CoastGuardLogin.tsx        # CG login interface
│   │   ├── CoastGuardVesselStatus.tsx # CG vessel status
│   │   ├── Dashboard.tsx              # Fisherman dashboard
│   │   ├── ErrorBoundary.tsx          # Error handling
│   │   ├── LocationTracker.tsx        # GPS tracking
│   │   ├── RegistrationForm.tsx       # Vessel registration
│   │   └── WorldMap.tsx               # Interactive map
│   ├── utils/
│   │   ├── geolocationDebug.ts        # GPS debugging
│   │   ├── safeAsync.ts               # Async safety utilities
│   │   └── sharedGeolocation.ts       # Shared GPS functions
│   ├── App.tsx                        # Main application
│   ├── main.tsx                       # Application entry point
│   └── index.css                      # Global styles
├── package.json                       # Dependencies and scripts
├── vite.config.ts                     # Vite configuration
├── tailwind.config.js                 # Tailwind CSS configuration
└── README.md                          # This file
```

## 🚨 Prohibited Zones

The system includes predefined prohibited fishing zones:
- **Marine Protected Area**: Red zone with 1000m radius
- **Spawning Ground**: Yellow zone with 800m radius  
- **Restricted Fishing Zone**: Red zone with 1200m radius

## 🔍 Debugging

The application includes comprehensive debugging:
- Console logs for vessel registration and updates
- Storage change detection logging
- GPS location update tracking
- Error boundary for graceful error handling

## 🎨 UI/UX Features

- **Modern Design**: Clean, professional interface with gradient backgrounds
- **Responsive Layout**: Works seamlessly on desktop and mobile
- **Visual Hierarchy**: Clear distinction between different vessel types
- **Interactive Elements**: Hover effects and smooth transitions
- **Status Indicators**: Color-coded status for easy identification

## 🔒 Security Features

- **Input Validation**: Comprehensive form validation
- **Safe Async Operations**: Error handling for GPS operations
- **Data Integrity**: localStorage with error recovery
- **User Permissions**: Proper GPS permission handling

## 🚀 Deployment

To build for production:
```bash
npm run build
```

To preview the production build:
```bash
npm run preview
```

## 📝 License

This project is developed for educational and demonstration purposes.

## 🤝 Contributing

This is a demonstration project showcasing modern web development practices for maritime safety applications.

---

**Built with ❤️ for maritime safety and Coast Guard operations** 