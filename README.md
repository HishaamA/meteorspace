# 🌍 Meteor Madness Simulator

**NASA Space Apps Challenge 2025 Submission**

An interactive web application for modeling asteroid impact scenarios, predicting environmental consequences, and evaluating planetary defense mitigation strategies using real NASA and USGS datasets.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![NASA](https://img.shields.io/badge/NASA-Space%20Apps-red)

---

## 🎯 Project Overview

Meteor Madness Simulator transforms complex asteroid impact physics into an accessible, educational, and decision-support tool. Users can:

- **Simulate realistic asteroid impacts** using scientifically accurate physics models
- **Visualize consequences** through interactive 3D trajectory views and 2D impact zone maps
- **Test mitigation strategies** including kinetic impactors, gravity tractors, and nuclear deflection
- **Explore real NASA NEO data** integrated from the Near-Earth Object API
- **Understand planetary defense** through educational tooltips and gamification

---

## ✨ Key Features

### 🔬 Scientific Accuracy
- **Physics-based calculations** for impact energy, crater formation, and seismic effects
- **Holsapple scaling laws** for crater size estimation
- **Real orbital mechanics** for trajectory visualization
- **Tsunami risk assessment** for ocean impacts

### 🎨 Interactive Visualization
- **3D asteroid trajectory** using Three.js with orbital path animation
- **2D impact mapping** using Leaflet with damage zone overlays
- **Real-time parameter adjustment** with instant visual feedback
- **Animated impact sequences** showing collision dynamics

### 🛡️ Mitigation Planning
- **Multiple deflection strategies**: Kinetic impactor, gravity tractor, nuclear deflection
- **Success probability calculations** based on warning time and asteroid properties
- **Before/after comparison** mode for strategy evaluation
- **Delta-v and deflection distance** modeling

### 📚 Educational Content
- **Interactive tooltips** explaining technical terms
- **Easy-to-understand visualizations** for non-experts
- **Real-world impact scenarios** using NASA NEO database
- **Accessible design** with colorblind-friendly palette

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v14 or higher)
- **npm** (comes with Node.js)
- **NASA API Key** (free from https://api.nasa.gov/)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/meteor-madness-simulator.git
   cd meteor-madness-simulator
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   # Copy the example environment file
   copy .env.example .env
   
   # Edit .env and add your NASA API key
   # NASA_API_KEY=your_api_key_here
   ```

4. **Start the server**
   ```bash
   npm start
   ```

5. **Open your browser**
   ```
   Navigate to: http://localhost:3000
   ```

---

## 📖 Usage Guide

### Basic Simulation Flow

1. **Select Asteroid Parameters**
   - Adjust diameter (10-1000 meters)
   - Set velocity (11-72 km/s)
   - Choose impact angle (15-90 degrees)
   - Select material type (ice, stony, iron)

2. **Choose Impact Location**
   - Enter latitude/longitude coordinates
   - OR click directly on the 2D map
   - Drag the impact marker to adjust

3. **Run Simulation**
   - Click "Simulate Impact" button
   - Watch the 3D trajectory animation
   - Review calculated impact effects
   - Analyze damage zones on the map

4. **Test Mitigation Strategies**
   - Select a deflection method
   - Set warning time (1-20 years)
   - Adjust velocity change (0.1-10 cm/s)
   - Run simulation to see outcome

### Loading Real NEO Data

1. Select "Load from NASA NEO API..." from the NEO dropdown
2. Application fetches current Near-Earth Objects
3. Parameters auto-populate with real asteroid data
4. Run simulation with actual threat scenarios

### Keyboard Shortcuts

- **Ctrl/Cmd + Enter**: Run simulation
- **Escape**: Reset map view

---

## 🔧 Technical Architecture

### Backend (Node.js/Express)

```
server.js
├── NASA NEO API proxy endpoints
├── Impact physics calculation engine
├── Mitigation strategy modeling
└── Static file serving
```

**Key Endpoints:**
- `GET /api/neo` - Fetch NEO data
- `GET /api/neo/browse` - Browse NEO catalog
- `POST /api/calculate-impact` - Calculate impact scenario
- `POST /api/calculate-mitigation` - Calculate deflection outcome

### Frontend (Vanilla JavaScript)

```
public/
├── index.html              # Main application page
├── styles.css              # Responsive styling
└── js/
    ├── physics.js          # Impact physics calculations
    ├── visualization3d.js  # Three.js 3D rendering
    ├── visualization2d.js  # Leaflet map integration
    ├── api.js              # Backend communication
    ├── ui.js               # User interface controller
    └── main.js             # Application initialization
```

### Physics Models

#### Impact Energy
```javascript
E = 0.5 × m × v²
```
Where:
- m = asteroid mass (kg)
- v = impact velocity (m/s)

#### Crater Diameter (Holsapple Scaling)
```javascript
D_crater = 1.8 × D_projectile × (ρ_p / ρ_t)^(1/3) × (v / v_s)^0.44 / sin(θ)^(1/3)
```

#### Seismic Magnitude
```javascript
M = 0.67 × log₁₀(E) - 5.87
```

#### Damage Zones
- **Fireball**: 0.28 × E^0.33 km
- **Severe Blast (20 psi)**: 0.22 × E^0.33 km
- **Moderate Blast (5 psi)**: 0.54 × E^0.33 km

---

## 📊 Data Sources

### NASA APIs
- **NEO (Near-Earth Object)**: Real asteroid orbital parameters
- **Close Approach Data**: Velocity and trajectory information
- **Size Estimates**: Diameter and mass calculations

### USGS (Future Integration)
- Topographic data for crater modeling
- Seismic activity baselines
- Tsunami propagation zones

---

## 🎮 Educational Features

### Interactive Tooltips
Hover over ℹ️ icons to learn about:
- **Eccentricity**: Orbital shape measurement
- **Impact Energy**: Kinetic energy conversion
- **Crater Formation**: Scaling laws and mechanics
- **Seismic Effects**: Earthquake magnitude correlation
- **Mitigation Strategies**: Deflection physics

### Scenario Exploration
- **Tunguska Event (1908)**: 50m asteroid, airburst
- **Chelyabinsk (2013)**: 20m asteroid, 500 kilotons
- **Chicxulub (66 mya)**: 10km asteroid, dinosaur extinction
- **Hypothetical Large Impact**: 1km asteroid scenarios

---

## 🛠️ Development

### Project Structure
```
meteor-madness-simulator/
├── server.js                 # Express backend server
├── package.json              # Dependencies and scripts
├── .env                      # Environment variables (not in repo)
├── .env.example              # Example environment configuration
├── .gitignore                # Git ignore rules
├── README.md                 # This file
└── public/                   # Static frontend files
    ├── index.html
    ├── styles.css
    └── js/
        ├── physics.js
        ├── visualization3d.js
        ├── visualization2d.js
        ├── api.js
        ├── ui.js
        └── main.js
```

### Dependencies

**Backend:**
- `express` - Web server framework
- `axios` - HTTP client for NASA API
- `cors` - Cross-origin resource sharing
- `dotenv` - Environment variable management

**Frontend:**
- `three.js` - 3D graphics rendering
- `leaflet` - Interactive mapping
- Vanilla JavaScript (no framework dependencies)

### Development Mode

```bash
# Install nodemon for auto-restart
npm install -g nodemon

# Run in development mode
npm run dev
```

---

## 🌐 Browser Compatibility

- **Chrome/Edge**: ✅ Fully supported
- **Firefox**: ✅ Fully supported
- **Safari**: ✅ Fully supported
- **Mobile**: ⚠️ Partial support (3D may be limited)

---

## 🔮 Future Enhancements

### Planned Features
- [ ] Real USGS topography integration
- [ ] Multiple simultaneous impact scenarios
- [ ] Time-lapse environmental effects
- [ ] Social sharing of scenarios
- [ ] VR mode for immersive experience
- [ ] Machine learning for impact prediction
- [ ] Multi-language support
- [ ] Mobile app version

### Potential Integrations
- **Weather patterns** post-impact modeling
- **Population density** casualty estimation
- **Infrastructure mapping** damage assessment
- **Economic impact** cost calculations

---

## 🤝 Contributing

This project was developed for the NASA Space Apps Challenge 2025. Contributions, suggestions, and improvements are welcome!

### How to Contribute
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙏 Acknowledgments

- **NASA** for Near-Earth Object data and APIs
- **USGS** for geological and seismic information
- **Three.js community** for 3D visualization tools
- **Leaflet** for mapping capabilities
- **NASA Space Apps Challenge** for the opportunity

---

## 🏆 NASA Space Apps Challenge 2025

**Challenge**: Meteor Madness - "Impactor-2025"  
**Theme**: Planetary Defense and Impact Modeling  
**Goal**: Make asteroid threats understandable and highlight the importance of mitigation planning

---

## 📚 References

### Scientific Papers
1. Holsapple, K.A. (1993). "The Scaling of Impact Processes in Planetary Sciences"
2. Collins, G.S. et al. (2005). "Earth Impact Effects Program"
3. Chesley, S.R. et al. (2014). "Asteroid Impact & Deflection Assessment mission"

### Datasets
- NASA NEO Web Service: https://api.nasa.gov/
- JPL Small-Body Database: https://ssd.jpl.nasa.gov/
- USGS Earthquake Hazards: https://earthquake.usgs.gov/

### Tools & Libraries
- Three.js: https://threejs.org/
- Leaflet: https://leafletjs.com/
- Express: https://expressjs.com/

---

## 🚀 Getting Started Checklist

- [ ] Install Node.js
- [ ] Clone repository
- [ ] Run `npm install`
- [ ] Get NASA API key
- [ ] Configure `.env` file
- [ ] Run `npm start`
- [ ] Open browser to localhost:3000
- [ ] Explore asteroid impacts!

---

**Made with 🌍 for planetary defense education and awareness**

*"The dinosaurs didn't have a space program. We do."*
