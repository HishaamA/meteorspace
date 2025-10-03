// UI Controller for handling user interactions

const UI = {
    currentScenario: null,
    
    /**
     * Initialize UI event listeners
     */
    init() {
        // Slider value displays
        this.setupSliders();
        
        // Mitigation strategy toggle
        this.setupMitigation();
        
        // Tooltips
        this.setupTooltips();
        
        // NEO selector
        this.setupNEOSelector();
        
        // Map selection button
        document.getElementById('select-on-map').addEventListener('click', () => {
            alert('Click on the map below to select an impact location');
        });
        
        // Simulate button
        document.getElementById('simulate-btn').addEventListener('click', () => {
            this.runSimulation();
        });
        
        // Compare button
        document.getElementById('compare-btn').addEventListener('click', () => {
            this.compareScenarios();
        });
        
        console.log('UI initialized');
    },
    
    /**
     * Setup slider value displays
     */
    setupSliders() {
        const sliders = [
            { id: 'diameter', display: 'diameter-value', suffix: ' m' },
            { id: 'velocity', display: 'velocity-value', suffix: ' km/s' },
            { id: 'angle', display: 'angle-value', suffix: '°' },
            { id: 'warning-time', display: 'warning-time-value', suffix: ' years' },
            { id: 'velocity-change', display: 'velocity-change-value', suffix: ' cm/s' }
        ];
        
        sliders.forEach(slider => {
            const element = document.getElementById(slider.id);
            const display = document.getElementById(slider.display);
            
            if (element && display) {
                element.addEventListener('input', (e) => {
                    display.textContent = e.target.value + slider.suffix;
                });
            }
        });
    },
    
    /**
     * Setup mitigation strategy controls
     */
    setupMitigation() {
        const mitigationSelect = document.getElementById('mitigation');
        const mitigationParams = document.getElementById('mitigation-params');
        
        mitigationSelect.addEventListener('change', (e) => {
            if (e.target.value === 'none') {
                mitigationParams.classList.add('hidden');
            } else {
                mitigationParams.classList.remove('hidden');
            }
        });
    },
    
    /**
     * Setup tooltip system
     */
    setupTooltips() {
        const tooltipIcons = document.querySelectorAll('.tooltip-icon');
        const tooltipPopup = document.getElementById('tooltip-popup');
        
        tooltipIcons.forEach(icon => {
            icon.addEventListener('mouseenter', (e) => {
                const text = e.target.dataset.tooltip;
                tooltipPopup.textContent = text;
                tooltipPopup.classList.remove('hidden');
                
                const rect = e.target.getBoundingClientRect();
                tooltipPopup.style.left = rect.left + 'px';
                tooltipPopup.style.top = (rect.bottom + 5) + 'px';
            });
            
            icon.addEventListener('mouseleave', () => {
                tooltipPopup.classList.add('hidden');
            });
        });
    },
    
    /**
     * Setup NEO selector
     */
    setupNEOSelector() {
        const neoSelect = document.getElementById('neo-select');
        
        neoSelect.addEventListener('change', async (e) => {
            if (e.target.value === 'fetch') {
                await this.loadNEOData();
            }
        });
    },
    
    /**
     * Load NEO data from NASA API
     */
    async loadNEOData() {
        this.showLoading(true);
        
        try {
            const data = await API.browseNEOs();
            
            // Parse NEO data and populate parameters
            if (data.near_earth_objects && data.near_earth_objects.length > 0) {
                const neo = data.near_earth_objects[0];
                
                // Extract parameters
                const diameter = neo.estimated_diameter?.meters?.estimated_diameter_max || 100;
                const velocity = neo.close_approach_data?.[0]?.relative_velocity?.kilometers_per_second || 20;
                
                // Update UI
                document.getElementById('diameter').value = Math.round(diameter);
                document.getElementById('diameter-value').textContent = Math.round(diameter) + ' m';
                document.getElementById('velocity').value = Math.round(velocity);
                document.getElementById('velocity-value').textContent = Math.round(velocity) + ' km/s';
                
                // Update NEO selector
                const neoSelect = document.getElementById('neo-select');
                neoSelect.innerHTML = `<option value="custom">Custom Asteroid</option>
                                       <option value="fetch">Load from NASA NEO API...</option>
                                       <option value="${neo.id}" selected>${neo.name}</option>`;
                
                this.showNotification(`Loaded data for ${neo.name}`, 'success');
            }
        } catch (error) {
            this.showNotification('Failed to load NEO data. Using custom parameters.', 'error');
            console.error(error);
        } finally {
            this.showLoading(false);
        }
    },
    
    /**
     * Run impact simulation
     */
    async runSimulation() {
        this.showLoading(true);
        
        try {
            // Gather parameters
            const params = {
                diameter: parseFloat(document.getElementById('diameter').value),
                velocity: parseFloat(document.getElementById('velocity').value),
                angle: parseFloat(document.getElementById('angle').value),
                density: parseFloat(document.getElementById('density').value),
                lat: parseFloat(document.getElementById('lat').value),
                lon: parseFloat(document.getElementById('lon').value)
            };
            
            // Calculate impact
            const results = await API.calculateImpact(params);
            
            // Store scenario
            this.currentScenario = { params, results };
            
            // Update visualizations
            this.displayResults(results);
            this.visualizeImpact(params, results);
            
            // Check for mitigation
            const mitigationType = document.getElementById('mitigation').value;
            if (mitigationType !== 'none') {
                await this.runMitigation(params, results);
            }
            
            this.showNotification('Simulation complete', 'success');
        } catch (error) {
            this.showNotification('Simulation failed: ' + error.message, 'error');
            console.error(error);
        } finally {
            this.showLoading(false);
        }
    },
    
    /**
     * Display results in UI
     */
    displayResults(results) {
        document.getElementById('energy-result').textContent = results.energy;
        document.getElementById('crater-result').textContent = results.craterDiameter;
        document.getElementById('seismic-result').textContent = results.seismicMagnitude;
        document.getElementById('area-result').textContent = Number(results.affectedArea).toLocaleString();
        document.getElementById('fireball-result').textContent = results.fireballRadius;
        document.getElementById('tsunami-result').textContent = results.tsunamiRisk;
    },
    
    /**
     * Visualize impact on 3D and 2D views
     */
    visualizeImpact(params, results) {
        // Update 2D map
        Visualization2D.updateImpactLocation(params.lat, params.lon);
        Visualization2D.visualizeImpact(params.lat, params.lon, results.zones);
        
        // Update 3D visualization
        const impactPos = Physics.latLonToCartesian(params.lat, params.lon, 50);
        Visualization3D.addImpactMarker(params.lat, params.lon);
        
        // Create asteroid
        const asteroidStartPos = {
            x: impactPos.x * 3,
            y: impactPos.y * 3 + 100,
            z: impactPos.z * 3
        };
        Visualization3D.createAsteroid(params.diameter, asteroidStartPos);
        Visualization3D.drawTrajectory(asteroidStartPos, impactPos);
        
        // Animate impact
        setTimeout(() => {
            Visualization3D.animateImpact(asteroidStartPos, impactPos, 3000);
        }, 500);
    },
    
    /**
     * Run mitigation simulation
     */
    async runMitigation(asteroidParams, originalResults) {
        const mitigationType = document.getElementById('mitigation').value;
        const warningTime = parseFloat(document.getElementById('warning-time').value);
        const velocityChange = parseFloat(document.getElementById('velocity-change').value);
        
        const mitigationParams = {
            asteroidParams,
            mitigationType,
            warningTime,
            velocityChange
        };
        
        const mitigationResults = await API.calculateMitigation(mitigationParams);
        
        // Display mitigation results
        const mitigationResult = document.getElementById('mitigation-result');
        const mitigationText = document.getElementById('mitigation-text');
        
        mitigationResult.classList.remove('hidden');
        mitigationText.innerHTML = `
            <strong>${mitigationResults.message}</strong><br>
            <br>
            <strong>Strategy:</strong> ${this.formatMitigationType(mitigationType)}<br>
            <strong>Success Probability:</strong> ${mitigationResults.successProbability}%<br>
            <strong>Deflection Distance:</strong> ${mitigationResults.deflectionDistance} km<br>
            <strong>Warning Time:</strong> ${warningTime} years<br>
            <strong>Velocity Change:</strong> ${velocityChange} cm/s
        `;
        
        // Change color based on success
        if (mitigationResults.success) {
            mitigationResult.style.borderColor = 'var(--accent-green)';
            mitigationResult.querySelector('h4').style.color = 'var(--accent-green)';
        } else {
            mitigationResult.style.borderColor = 'var(--accent-orange)';
            mitigationResult.querySelector('h4').style.color = 'var(--accent-orange)';
        }
    },
    
    /**
     * Compare scenarios
     */
    compareScenarios() {
        if (!this.currentScenario) {
            this.showNotification('Run a simulation first', 'error');
            return;
        }
        
        this.showNotification('Comparison mode - adjust parameters and simulate again', 'info');
    },
    
    /**
     * Format mitigation type for display
     */
    formatMitigationType(type) {
        const types = {
            'kinetic': 'Kinetic Impactor',
            'gravity': 'Gravity Tractor',
            'nuclear': 'Nuclear Deflection'
        };
        return types[type] || type;
    },
    
    /**
     * Show/hide loading overlay
     */
    showLoading(show) {
        const overlay = document.getElementById('loading-overlay');
        if (show) {
            overlay.classList.remove('hidden');
        } else {
            overlay.classList.add('hidden');
        }
    },
    
    /**
     * Show notification message
     */
    showNotification(message, type = 'info') {
        // Simple console log for now - could be enhanced with toast notifications
        const styles = {
            info: 'color: #4a9eff',
            success: 'color: #4caf50',
            error: 'color: #ef5350'
        };
        console.log(`%c${message}`, styles[type]);
        
        // Could add a toast notification system here
        if (type === 'error') {
            alert(message);
        }
    }
};

// Make available globally
window.UI = UI;
