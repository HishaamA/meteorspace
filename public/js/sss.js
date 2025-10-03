// UI Controller for handling user interactions

const UI = {
    currentScenario: null,
    selectedMitigationStrategy: null,
    
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
                const targetEl = document.getElementById(`${targetTab}-tab`);
                if (targetEl) targetEl.classList.add('active');
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
            calcMitigationBtn.addEventListener('click', async () => {
                if (!this.currentScenario) {
                    this.showNotification('Please run a simulation first', 'error');
                    return;
                }
                
                if (!this.selectedMitigationStrategy) {
                    this.showNotification('Please select a mitigation strategy first', 'error');
                    return;
                }
                
                this.showLoading(true);
                try {
                    await this.runMitigation(this.currentScenario.params, this.currentScenario.results);
                    this.showNotification('Mitigation calculated successfully', 'success');
                } catch (error) {
                    this.showNotification('Failed to calculate mitigation: ' + error.message, 'error');
                    console.error(error);
                } finally {
                    this.showLoading(false);
                }
            });
        }
        
        // Location picker button - scroll to map
        const pickLocationBtn = document.getElementById('pick-location-btn');
        if (pickLocationBtn) {
            pickLocationBtn.addEventListener('click', () => {
                // Scroll to the map section
                const mapSection = document.querySelector('.map-section');
                if (mapSection) {
                    mapSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    this.showNotification('Click on the map below to select impact location', 'info');
                    
                    // Highlight the map briefly
                    const mapContainer = document.getElementById('map-container');
                    if (mapContainer) {
                        mapContainer.style.boxShadow = '0 0 30px rgba(79, 163, 255, 0.6)';
                        setTimeout(() => {
                            mapContainer.style.boxShadow = '';
                        }, 2000);
                    }
                }
            });
        }
        
        // Listen to manual lat/lon input changes to update marker
        const latInput = document.getElementById('latitude-input');
        const lonInput = document.getElementById('longitude-input');
        
        if (latInput && lonInput) {
            const updateMarker = () => {
                const lat = parseFloat(latInput.value) || 0;
                const lon = parseFloat(lonInput.value) || 0;
                
                // Clamp values to valid ranges
                const clampedLat = Math.max(-90, Math.min(90, lat));
                const clampedLon = Math.max(-180, Math.min(180, lon));
                
                Visualization3D.placeLocationMarker(clampedLat, clampedLon);
                
                // Also update legacy inputs
                const legacyLatInput = document.getElementById('lat');
                const legacyLonInput = document.getElementById('lon');
                if (legacyLatInput) legacyLatInput.value = clampedLat.toFixed(4);
                if (legacyLonInput) legacyLonInput.value = clampedLon.toFixed(4);
                
                // Update 2D map
                if (window.Visualization2D) {
                    window.Visualization2D.updateImpactLocation(clampedLat, clampedLon);
                }
            };
            
            latInput.addEventListener('change', updateMarker);
            lonInput.addEventListener('change', updateMarker);
        }
    },
    
    /**
     * Setup input synchronization between config and sidebar
     */
    setupInputSync() {
        // No synchronization needed - duplicate config section removed
        // All parameters are now controlled via 3D visualization sidebar
    },
    
    /**
     * Setup slider value displays
     */
    setupSliders() {
        const sliders = [
            { id: 'diameter', display: 'diameter-value', suffix: 'm' },
            { id: 'velocity', display: 'velocity-value', suffix: ' km/s' },
            { id: 'angle', display: 'angle-value', suffix: '°' },
            { id: 'warning-time', display: 'warning-time-value', suffix: ' years' },
            { id: 'velocity-change', display: 'velocity-change-value', suffix: ' cm/s' }
        ];
        
        sliders.forEach(slider => {
            const element = document.getElementById(slider.id);
            const display = document.getElementById(slider.display);
            
            if (element && display) {
                // Set initial value
                display.textContent = element.value + slider.suffix;
                
                // Update on input
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
                // Store selected strategy
                this.selectedMitigationStrategy = btn.dataset.strategy;
                
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
                
                console.log('Selected mitigation strategy:', this.selectedMitigationStrategy);
            });
        });
    },
    
    /**
     * Setup tooltip system
     */
    setupTooltips() {
        const tooltipIcons = document.querySelectorAll('.tooltip-icon');
        const tooltipPopup = document.getElementById('tooltip-popup');
        if (!tooltipPopup) return; // No tooltip container — silently disable tooltips

        tooltipIcons.forEach(icon => {
            icon.addEventListener('mouseenter', (e) => {
                const text = e.target.dataset.tooltip;
                if (text) {
                    tooltipPopup.textContent = text;
                    tooltipPopup.classList.remove('hidden');

                    const rect = e.target.getBoundingClientRect();
                    tooltipPopup.style.left = rect.left + 'px';
                    tooltipPopup.style.top = (rect.bottom + 5) + 'px';
                }
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
        if (!neoSelect) return; // Selector not present on this page

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
                if (neoSelect) {
                    neoSelect.innerHTML = `<option value="custom">Custom Asteroid</option>
                                       <option value="fetch">Load from NASA NEO API...</option>
                                       <option value="${neo.id}" selected>${neo.name}</option>`;
                }
                
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
            // Get latitude and longitude from location picker inputs
            const latInput = document.getElementById('latitude-input');
            const lonInput = document.getElementById('longitude-input');
            
            let lat = latInput ? parseFloat(latInput.value) || 0 : 0;
            let lon = lonInput ? parseFloat(lonInput.value) || 0 : 0;
            
            // Fallback to legacy inputs if location picker inputs don't exist
            if (!latInput || !lonInput) {
                const legacyLatInput = document.getElementById('lat');
                const legacyLonInput = document.getElementById('lon');
                lat = legacyLatInput ? parseFloat(legacyLatInput.value) || 0 : 0;
                lon = legacyLonInput ? parseFloat(legacyLonInput.value) || 0 : 0;
            }
            
            // Sync legacy inputs with current values
            const legacyLatInput = document.getElementById('lat');
            const legacyLonInput = document.getElementById('lon');
            if (legacyLatInput) legacyLatInput.value = lat.toFixed(4);
            if (legacyLonInput) legacyLonInput.value = lon.toFixed(4);
            
            console.log(`Running simulation at location: ${lat}°, ${lon}°`);
            
            // Gather parameters
            const params = {
                diameter: parseFloat(document.getElementById('diameter').value),
                velocity: parseFloat(document.getElementById('velocity').value),
                angle: parseFloat(document.getElementById('angle').value),
                density: parseFloat(document.getElementById('density').value),
                lat: lat,
                lon: lon
            };
            
            // Calculate impact
            const results = await API.calculateImpact(params);
            
            // Store scenario
            this.currentScenario = { params, results };
            
            // Update visualizations
            this.displayResults(results);
            this.visualizeImpact(params, results);
            
            // Check for mitigation
            const mitigationEl = document.getElementById('mitigation');
            const mitigationType = mitigationEl ? mitigationEl.value : 'none';
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
        const elSet = (id, value) => { const e = document.getElementById(id); if (e) e.textContent = value; };
        elSet('crater-diameter-text', results.craterDiameter + ' km');
        elSet('crater-depth-text', results.craterDepth + ' km');
        elSet('size-text', params.diameter + 'm');
        elSet('material-text', this.getMaterialName(params.density));
        elSet('velocity-text', params.velocity + ' km/s');
        elSet('energy-text', results.energy);
        elSet('magnitude-text', results.seismicMagnitude);
        elSet('thermal-text', results.fireballRadius + ' km');
        elSet('energy-badge', results.energy + ' MT');
        
        // Update Population Impact
        if (results.populationImpact) {
            const pop = results.populationImpact;
            elSet('location-category', pop.locationCategory);
            elSet('pop-density', pop.populationDensity);
            elSet('population-risk', this.formatNumber(pop.totalAtRisk));
            elSet('casualties-text', this.formatNumber(pop.estimatedFatalities));
            elSet('injured-text', this.formatNumber(pop.estimatedInjured));
            
            // Update severity badge
            const severityBadge = document.getElementById('severity-badge');
            if (severityBadge) {
                severityBadge.textContent = pop.severity;
                severityBadge.className = 'severity-badge ' + pop.severity;
            }
        }
        
        // Update Statistics tab
    elSet('stat-energy', results.energy + ' MT');
    elSet('stat-crater', results.craterDiameter + 'K m');
    elSet('stat-seismic', results.seismicMagnitude);
    elSet('stat-area', (Number(results.affectedArea) / 1000).toFixed(2) + 'K km²');
        
        // Update population stats
        if (results.populationImpact) {
            elSet('stat-population', this.formatNumber(results.populationImpact.totalAtRisk));
            elSet('stat-casualties', this.formatNumber(results.populationImpact.estimatedFatalities));
        }
        
        // Update detailed analysis
    elSet('analysis-crater-d', results.craterDiameter + 'K m');
    elSet('analysis-crater-depth', results.craterDepth + 'K m');
    elSet('analysis-ejecta', '34.47 km³'); // Calculate if needed
    elSet('analysis-duration', '2.5 sec'); // Calculate if needed
    elSet('analysis-thermal', results.fireballRadius + ' km');
    elSet('analysis-blast', results.airBlastRadius + ' km');
        
        // Update detailed impact effects panels
        this.updateDetailedEffects(results, params);
        
        // Update threat level
    const threatLevel = this.calculateThreatLevel(results.energy);
    const threatFill = document.getElementById('threat-fill');
    if (threatFill) threatFill.style.width = threatLevel.percentage + '%';
    elSet('threat-label', threatLevel.label);
        
        // Update location
        elSet('impact-location', this.getLocationName(params.lat, params.lon));
    },
    
    /**
     * Update detailed impact effects panels
     */
    updateDetailedEffects(results, params) {
        const elSet = (id, value) => { const e = document.getElementById(id); if (e) e.textContent = value; };
        const pop = results.populationImpact || {};
        
        // Crater Effects
        elSet('effect-crater-diameter', results.craterDiameter + ' km');
        elSet('effect-crater-depth', results.craterDepth + ' km');
        elSet('effect-ground-zero-rate', pop.groundZeroFatalityRate ? pop.groundZeroFatalityRate + '%' : '100%');
        elSet('effect-vaporized', this.formatNumber(pop.craterVaporized || 0));
        
        // Impact Details
        elSet('effect-velocity', results.impactVelocityKmh + ' km/h (' + results.impactVelocityMph + ' mph)');
        elSet('effect-energy-gt', results.energyGigatons + ' GT');
        elSet('effect-tsar-bomba', results.tsarBombaEquivalent + 'x Tsar Bomba');
        elSet('effect-frequency', results.impactFrequency);
        
        // Hurricane comparison
        const hurricaneComp = document.getElementById('effect-hurricane-comparison');
        if (hurricaneComp) {
            hurricaneComp.textContent = results.hurricaneComparison ? 
                'Energy exceeds what a hurricane releases in a day' :
                'Equivalent to ' + results.hiroshimaEquivalent + ' Hiroshima bombs';
        }
        
        // Thermal Radiation
        elSet('effect-fireball-diameter', results.fireballDiameter + ' km');
        elSet('effect-fireball-deaths', this.formatNumber(pop.fireballDeaths || 0));
        elSet('effect-burns-3rd', this.formatNumber(pop.burns3rdDegree || 0) + ' people');
        elSet('effect-burns-2nd', this.formatNumber(pop.burns2ndDegree || 0) + ' people');
        elSet('effect-tree-fire', results.thermalIgnitionRadius + ' km');
        
        // Shock Wave
        elSet('effect-decibels', results.maxDecibels + ' dB');
        elSet('effect-shock-deaths', this.formatNumber(pop.shockWaveDeaths || 0));
        elSet('effect-lung-damage', results.lungDamageRadius + ' km');
        elSet('effect-eardrums', results.eardrumsRuptureRadius + ' km');
        elSet('effect-building-collapse', results.totalCollapseRadius + ' km');
        elSet('effect-home-destruction', results.homeDestructionRadius + ' km');
        
        // Wind Blast
        elSet('effect-wind-speed', results.peakWindSpeedMph + ' mph (' + results.peakWindSpeedKmh + ' km/h)');
        elSet('effect-wind-deaths', this.formatNumber(pop.windBlastDeaths || 0));
        elSet('effect-ef5-zone', results.ef5TornadoZone + ' km radius');
        elSet('effect-trees-blown', results.treesBlownRadius + ' km radius');
        elSet('effect-jupiter-zone', results.jupiterStormZone + ' km radius');
        
        // Seismic Effects
        elSet('effect-earthquake-mag', results.seismicMagnitude + ' Richter');
        elSet('effect-seismic-deaths', this.formatNumber(pop.seismicDeaths || 0));
        elSet('effect-seismic-range', results.seismicFeltRadius + ' km');
    },
    
    /**
     * Format large numbers for display
     */
    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(2) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        } else {
            return num.toString();
        }
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
        const earthRadius = Visualization3D.earthRadius || 63.71;
        const impactPos = Physics.latLonToCartesian(params.lat, params.lon, earthRadius);
        Visualization3D.addImpactMarker(params.lat, params.lon);
        
        // Create asteroid - start position further away based on angle
        const distance = earthRadius * 5; // Start 5x Earth radius away
        const asteroidStartPos = {
            x: impactPos.x * (distance / earthRadius),
            y: impactPos.y * (distance / earthRadius) + earthRadius * 1.5,
            z: impactPos.z * (distance / earthRadius)
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
        const mitigationType = this.selectedMitigationStrategy || 'kinetic';
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
        if (!overlay) return; // Nothing to toggle
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
        // Console logging
        const styles = {
            info: 'color: #4a9eff',
            success: 'color: #4caf50',
            error: 'color: #ef5350'
        };
        console.log(`%c${message}`, styles[type]);
        
        // Create toast notification
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            background: ${type === 'error' ? '#ef5350' : type === 'success' ? '#4caf50' : '#4a9eff'};
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 16px rgba(0,0,0,0.3);
            z-index: 10000;
            font-weight: 500;
            animation: slideIn 0.3s ease;
            max-width: 400px;
        `;
        toast.textContent = message;
        
        // Add animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(400px);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(toast);
        
        // Remove after 3 seconds
        setTimeout(() => {
            toast.style.animation = 'slideIn 0.3s ease reverse';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
};

// Make available globally
window.UI = UI;
