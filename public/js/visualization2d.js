// 2D Map Visualization using Leaflet

const Visualization2D = {
    map: null,
    impactMarker: null,
    craterCircle: null,
    severeCircle: null,
    moderateCircle: null,
    
    /**
     * Initialize Leaflet map
     */
    init() {
        // Create map centered on default location
        this.map = L.map('map-container', {
            center: [40.7128, -74.0060],
            zoom: 8,
            zoomControl: true
        });
        
        // Add tile layer (OpenStreetMap)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 18
        }).addTo(this.map);
        
        // Add click handler for selecting impact location
        this.map.on('click', (e) => {
            const { lat, lng } = e.latlng;
            
            console.log(`2D Map clicked: Lat ${lat.toFixed(4)}°, Lon ${lng.toFixed(4)}°`);
            
            // Update location picker inputs
            const latInput = document.getElementById('latitude-input');
            const lonInput = document.getElementById('longitude-input');
            if (latInput) latInput.value = lat.toFixed(2);
            if (lonInput) lonInput.value = lng.toFixed(2);
            
            // Update legacy inputs if they exist
            const legacyLatInput = document.getElementById('lat');
            const legacyLonInput = document.getElementById('lon');
            if (legacyLatInput) legacyLatInput.value = lat.toFixed(4);
            if (legacyLonInput) legacyLonInput.value = lng.toFixed(4);
            
            // Update marker on map
            this.updateImpactLocation(lat, lng);
            
            // Update 3D visualization marker
            if (window.Visualization3D) {
                console.log(`Updating 3D marker to: ${lat.toFixed(2)}°, ${lng.toFixed(2)}°`);
                window.Visualization3D.placeLocationMarker(lat, lng);
            } else {
                console.warn('Visualization3D not available');
            }
            
            // Show notification
            if (window.UI) {
                window.UI.showNotification(`Location set to ${lat.toFixed(2)}°, ${lng.toFixed(2)}°`, 'success');
            }
        });
        
        console.log('2D Map initialized');
    },
    
    /**
     * Update impact location marker
     */
    updateImpactLocation(lat, lon) {
        // Remove existing marker
        if (this.impactMarker) {
            this.map.removeLayer(this.impactMarker);
        }
        
        // Create custom icon
        const impactIcon = L.divIcon({
            className: 'impact-marker',
            html: '<div style="background: #ff0000; width: 20px; height: 20px; border-radius: 50%; border: 3px solid #fff; box-shadow: 0 0 10px rgba(255,0,0,0.8);"></div>',
            iconSize: [20, 20],
            iconAnchor: [10, 10]
        });
        
        // Add new marker
        this.impactMarker = L.marker([lat, lon], {
            icon: impactIcon,
            draggable: true
        }).addTo(this.map);
        
        // Update coordinates on drag
        this.impactMarker.on('dragend', (e) => {
            const pos = e.target.getLatLng();
            
            // Update location picker inputs
            const latInput = document.getElementById('latitude-input');
            const lonInput = document.getElementById('longitude-input');
            if (latInput) latInput.value = pos.lat.toFixed(2);
            if (lonInput) lonInput.value = pos.lng.toFixed(2);
            
            // Update legacy inputs if they exist
            const legacyLatInput = document.getElementById('lat');
            const legacyLonInput = document.getElementById('lon');
            if (legacyLatInput) legacyLatInput.value = pos.lat.toFixed(4);
            if (legacyLonInput) legacyLonInput.value = pos.lng.toFixed(4);
            
            // Update 3D visualization marker
            if (window.Visualization3D) {
                window.Visualization3D.placeLocationMarker(pos.lat, pos.lng);
            }
        });
        
        // Center map on location
        this.map.setView([lat, lon], this.map.getZoom());
    },
    
    /**
     * Visualize impact zones
     */
    visualizeImpact(lat, lon, zones) {
        // Clear existing circles
        this.clearImpactZones();
        
        // Crater zone (red)
        if (zones.crater) {
            this.craterCircle = L.circle([lat, lon], {
                radius: zones.crater * 1000, // Convert km to meters
                color: '#ff0000',
                fillColor: '#ff0000',
                fillOpacity: 0.3,
                weight: 2
            }).addTo(this.map);
            
            this.craterCircle.bindPopup(`<b>Crater Zone</b><br>Radius: ${zones.crater.toFixed(2)} km<br>Complete destruction`);
        }
        
        // Severe damage zone (orange)
        if (zones.severe) {
            this.severeCircle = L.circle([lat, lon], {
                radius: zones.severe * 1000,
                color: '#ff6600',
                fillColor: '#ff6600',
                fillOpacity: 0.2,
                weight: 2
            }).addTo(this.map);
            
            this.severeCircle.bindPopup(`<b>Severe Damage Zone</b><br>Radius: ${zones.severe.toFixed(2)} km<br>20 psi overpressure<br>Most buildings destroyed`);
        }
        
        // Moderate damage zone (yellow)
        if (zones.moderate) {
            this.moderateCircle = L.circle([lat, lon], {
                radius: zones.moderate * 1000,
                color: '#ffcc00',
                fillColor: '#ffcc00',
                fillOpacity: 0.15,
                weight: 2
            }).addTo(this.map);
            
            this.moderateCircle.bindPopup(`<b>Moderate Damage Zone</b><br>Radius: ${zones.moderate.toFixed(2)} km<br>5 psi overpressure<br>Residential buildings damaged`);
        }
        
        // Fit map to show all zones
        if (this.moderateCircle) {
            this.map.fitBounds(this.moderateCircle.getBounds(), { padding: [50, 50] });
        }
    },
    
    /**
     * Add heatmap overlay for damage intensity
     */
    addDamageHeatmap(lat, lon, intensity) {
        // Create gradient overlay
        const bounds = [
            [lat - 1, lon - 1],
            [lat + 1, lon + 1]
        ];
        
        // In a real implementation, this would use actual heatmap libraries
        // For now, we'll use the circle visualization
        console.log(`Damage intensity: ${intensity}`);
    },
    
    /**
     * Visualize tsunami zones (for ocean impacts)
     */
    visualizeTsunami(lat, lon, waveHeight) {
        if (waveHeight <= 0) return;
        
        // Create tsunami warning circle
        const tsunamiCircle = L.circle([lat, lon], {
            radius: waveHeight * 50000, // Rough estimate of affected area
            color: '#0088ff',
            fillColor: '#0088ff',
            fillOpacity: 0.15,
            weight: 2,
            dashArray: '10, 10'
        }).addTo(this.map);
        
        tsunamiCircle.bindPopup(`<b>⚠️ Tsunami Warning Zone</b><br>Estimated wave height: ${waveHeight.toFixed(1)}m<br>Coastal areas at risk`);
    },
    
    /**
     * Show comparison between scenarios
     */
    showComparison(scenario1, scenario2) {
        // Clear existing visualization
        this.clearImpactZones();
        
        // Show both scenarios with different colors
        // Scenario 1 (original) - red
        if (scenario1) {
            L.circle([scenario1.lat, scenario1.lon], {
                radius: scenario1.zones.moderate * 1000,
                color: '#ff0000',
                fillColor: '#ff0000',
                fillOpacity: 0.2,
                weight: 2
            }).addTo(this.map).bindPopup('<b>Original Impact</b>');
        }
        
        // Scenario 2 (mitigated) - green
        if (scenario2) {
            L.circle([scenario2.lat, scenario2.lon], {
                radius: scenario2.zones.moderate * 1000,
                color: '#00ff00',
                fillColor: '#00ff00',
                fillOpacity: 0.2,
                weight: 2
            }).addTo(this.map).bindPopup('<b>Mitigated Impact</b>');
        }
    },
    
    /**
     * Add measurement tools
     */
    addMeasurementTool() {
        // Add distance measurement
        let measurementLine = null;
        let measurementPoints = [];
        
        this.map.on('contextmenu', (e) => {
            measurementPoints.push(e.latlng);
            
            if (measurementPoints.length === 2) {
                const distance = this.map.distance(measurementPoints[0], measurementPoints[1]) / 1000;
                
                if (measurementLine) {
                    this.map.removeLayer(measurementLine);
                }
                
                measurementLine = L.polyline(measurementPoints, {
                    color: '#4a9eff',
                    weight: 3,
                    dashArray: '5, 10'
                }).addTo(this.map);
                
                measurementLine.bindPopup(`Distance: ${distance.toFixed(2)} km`).openPopup();
                
                measurementPoints = [];
            }
        });
    },
    
    /**
     * Clear impact zone circles
     */
    clearImpactZones() {
        if (this.craterCircle) {
            this.map.removeLayer(this.craterCircle);
            this.craterCircle = null;
        }
        if (this.severeCircle) {
            this.map.removeLayer(this.severeCircle);
            this.severeCircle = null;
        }
        if (this.moderateCircle) {
            this.map.removeLayer(this.moderateCircle);
            this.moderateCircle = null;
        }
    },
    
    /**
     * Export map as image
     */
    exportAsImage() {
        // This would require additional library like leaflet-image
        console.log('Map export functionality');
    },
    
    /**
     * Reset map view
     */
    reset() {
        this.clearImpactZones();
        if (this.impactMarker) {
            this.map.removeLayer(this.impactMarker);
            this.impactMarker = null;
        }
        this.map.setView([40.7128, -74.0060], 8);
    }
};

// Make available globally
window.Visualization2D = Visualization2D;
