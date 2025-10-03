// UI Controller for handling user interactions

const UI = {
    currentScenario: null,
    
    /**
     * Initialize UI event listeners
     */
    init() {
        // Slider value displays
        this.setupSliders();
        
        // Tab navigation
        this.setupTabs();
        
        // Button listeners
        this.setupButtons();
        
        // Mitigation options
        this.setupMitigation();
        
        // Input synchronization
        this.setupInputSync();
        
        console.log('UI initialized');
    },
    
    /**
     * Setup tab switching
     */
    setupTabs() {
        const tabBtns = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');
        
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetTab = btn.dataset.tab;
                
                // Remove active class from all tabs and contents
                tabBtns.forEach(b => b.classList.remove('active'));
                tabContents.forEach(c => c.classList.remove('active'));
                
                // Add active class to clicked tab and corresponding content
                btn.classList.add('active');
                document.getElementById(`${targetTab}-tab`).classList.add('active');
            });
        });
    },
    
    /**
     * Setup button listeners
     */
    setupButtons() {
        // Primary simulation buttons
        const startSimBtn = document.getElementById('start-simulation-btn');
        const simulateBtn = document.getElementById('simulate-btn');
        
        if (startSimBtn) {
            startSimBtn.addEventListener('click', () => this.runSimulation());
        }
        if (simulateBtn) {
            simulateBtn.addEventListener('click', () => this.runSimulation());
        }
        
        // Reset buttons
        const resetBtn = document.getElementById('reset-btn');
        const reset3dBtn = document.getElementById('reset-3d-btn');
        
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetAll());
        }
        if (reset3dBtn) {
            reset3dBtn.addEventListener('click', () => this.resetAll());
        }
        
        // Home button
        const homeBtn = document.getElementById('home-btn');
        if (homeBtn) {
            homeBtn.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }
        
        // Mitigation calculation
        const calcMitigationBtn = document.getElementById('calculate-mitigation-btn');
        if (calcMitigationBtn) {
            calcMitigationBtn.addEventListener('click', () => {
                if (this.currentScenario) {
                    this.runMitigation(this.currentScenario.params, this.currentScenario.results);
                } else {
                    alert('Please run a simulation first');
                }
            });
        }
    },
    
    /**
     * Setup input synchronization between config and sidebar
     */
    setupInputSync() {
        // Sync diameter
        const diameterInput = document.getElementById('diameter-input');
        const diameterSlider = document.getElementById('diameter');
        
        if (diameterInput && diameterSlider) {
            diameterInput.addEventListener('input', (e) => {
                diameterSlider.value = e.target.value;
                document.getElementById('diameter-value').textContent = e.target.value + 'm';
            });
        }
        
        // Sync velocity
        const velocityInput = document.getElementById('velocity-input');
        const velocitySlider = document.getElementById('velocity');
        
        if (velocityInput && velocitySlider) {
            velocityInput.addEventListener('input', (e) => {
                velocitySlider.value = e.target.value;
                document.getElementById('velocity-value').textContent = e.target.value + ' km/s';
            });
        }
        
        // Sync angle
        const angleInput = document.getElementById('angle-input');
        const angleSlider = document.getElementById('angle');
        
        if (angleInput && angleSlider) {
            angleInput.addEventListener('input', (e) => {
                angleSlider.value = e.target.value;
                document.getElementById('angle-value').textContent = e.target.value + '°';
            });
        }
        
        // Sync material
        const materialSelect = document.getElementById('material-select');
        const densitySelect = document.getElementById('density');
        
        if (materialSelect && densitySelect) {
            materialSelect.addEventListener('change', (e) => {
                densitySelect.value = e.target.value;
            });
        }
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
     * Setup mitigation options
     */
    setupMitigation() {
        const mitigationBtns = document.querySelectorAll('.btn-mitigation');
        const mitigationParams = document.getElementById('mitigation-params');
        
        mitigationBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active state from all buttons
                mitigationBtns.forEach(b => {
                    b.style.background = 'var(--bg-card)';
                    b.style.color = 'var(--accent-blue)';
                });
                
                // Set active state
                btn.style.background = 'var(--accent-blue)';
                btn.style.color = 'white';
                
                // Show parameters panel
                if (mitigationParams) {
                    mitigationParams.classList.remove('hidden');
                }
            });
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
        // Update Impact Images tab
        const params = this.currentScenario.params;
        document.getElementById('crater-diameter-text').textContent = results.craterDiameter + ' km';
        document.getElementById('crater-depth-text').textContent = results.craterDepth + ' km';
        document.getElementById('size-text').textContent = params.diameter + 'm';
        document.getElementById('material-text').textContent = this.getMaterialName(params.density);
        document.getElementById('velocity-text').textContent = params.velocity + ' km/s';
        document.getElementById('energy-text').textContent = results.energy;
        document.getElementById('magnitude-text').textContent = results.seismicMagnitude;
        document.getElementById('thermal-text').textContent = results.fireballRadius + ' km';
        document.getElementById('energy-badge').textContent = results.energy + ' MT';
        
        // Update Statistics tab
        document.getElementById('stat-energy').textContent = results.energy + ' MT';
        document.getElementById('stat-crater').textContent = results.craterDiameter + 'K m';
        document.getElementById('stat-seismic').textContent = results.seismicMagnitude;
        document.getElementById('stat-area').textContent = (Number(results.affectedArea) / 1000).toFixed(2) + 'K km²';
        
        // Update detailed analysis
        document.getElementById('analysis-crater-d').textContent = results.craterDiameter + 'K m';
        document.getElementById('analysis-crater-depth').textContent = results.craterDepth + 'K m';
        document.getElementById('analysis-ejecta').textContent = '34.47 km³'; // Calculate if needed
        document.getElementById('analysis-duration').textContent = '2.5 sec'; // Calculate if needed
        document.getElementById('analysis-thermal').textContent = results.fireballRadius + ' km';
        document.getElementById('analysis-blast').textContent = results.airBlastRadius + ' km';
        
        // Update threat level
        const threatLevel = this.calculateThreatLevel(results.energy);
        document.getElementById('threat-fill').style.width = threatLevel.percentage + '%';
        document.getElementById('threat-label').textContent = threatLevel.label;
        
        // Update location
        document.getElementById('impact-location').textContent = this.getLocationName(params.lat, params.lon);
    },
    
    /**
     * Calculate threat level based on energy
     */
    calculateThreatLevel(energy) {
        const energyNum = parseFloat(energy);
        if (energyNum < 10) {
            return { percentage: 20, label: 'Low' };
        } else if (energyNum < 50) {
            return { percentage: 40, label: 'Moderate' };
        } else if (energyNum < 100) {
            return { percentage: 60, label: 'High' };
        } else if (energyNum < 500) {
            return { percentage: 80, label: 'Severe' };
        } else {
            return { percentage: 100, label: 'Catastrophic' };
        }
    },
    
    /**
     * Get material name from density
     */
    getMaterialName(density) {
        const materials = {
            1000: 'ice',
            2000: 'carbonaceous',
            3000: 'rocky',
            8000: 'iron'
        };
        return materials[density] || 'rocky';
    },
    
    /**
     * Get location name from coordinates
     */
    getLocationName(lat, lon) {
        // Simplified - you could integrate a geocoding API for real names
        if (Math.abs(lat) < 5 && Math.abs(lon + 160) < 20) {
            return 'Pacific Ocean';
        } else if (Math.abs(lat) < 10 && Math.abs(lon + 30) < 20) {
            return 'Atlantic Ocean';
        } else {
            return `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`;
        }
    },
    
    /**
     * Reset all inputs and visualizations
     */
    resetAll() {
        // Reset inputs
        document.getElementById('diameter-input').value = 100;
        document.getElementById('velocity-input').value = 20;
        document.getElementById('angle-input').value = 45;
        document.getElementById('diameter').value = 100;
        document.getElementById('velocity').value = 20;
        document.getElementById('angle').value = 45;
        document.getElementById('diameter-value').textContent = '100m';
        document.getElementById('velocity-value').textContent = '20 km/s';
        document.getElementById('angle-value').textContent = '45°';
        
        // Reset map
        Visualization2D.reset();
        
        // Clear current scenario
        this.currentScenario = null;
        
        this.showNotification('Reset complete', 'info');
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
