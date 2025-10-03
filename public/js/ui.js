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

        // AI Strategic Analysis button
        const aiAnalysisBtn = document.getElementById('generate-ai-analysis-btn');
        if (aiAnalysisBtn) {
            aiAnalysisBtn.addEventListener('click', () => {
                this.generateAIAnalysis();
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
            
            // Update data source indicator
            if (pop.dataSource) {
                elSet('pop-data-source', pop.dataSource);
            }
            
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
        
        // Update location - use server's geocoded name if available, otherwise fallback to client-side
        const locationName = results.locationName || this.getLocationName(params.lat, params.lon);
        elSet('impact-location', locationName);
        elSet('impact-location-text', locationName); // Also update the Impact Effects paragraph
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
        const absLat = Math.abs(lat);
        
        // Major Cities (approximate)
        if (lat > 40 && lat < 41 && lon > -74 && lon < -73) return 'New York City, USA';
        if (lat > 48 && lat < 49 && lon > 2 && lon < 3) return 'Paris, France';
        if (lat > 51 && lat < 52 && lon > -1 && lon < 1) return 'London, UK';
        if (lat > 35 && lat < 36 && lon > 139 && lon < 140) return 'Tokyo, Japan';
        if (lat > -34 && lat < -33 && lon > 18 && lon < 19) return 'Cape Town, South Africa';
        if (lat > -34 && lat < -33 && lon > 151 && lon < 152) return 'Sydney, Australia';
        if (lat > 55 && lat < 56 && lon > 37 && lon < 38) return 'Moscow, Russia';
        if (lat > 39 && lat < 40 && lon > 116 && lon < 117) return 'Beijing, China';
        if (lat > 28 && lat < 29 && lon > 77 && lon < 78) return 'New Delhi, India';
        if (lat > -23 && lat < -22 && lon > -44 && lon < -43) return 'Rio de Janeiro, Brazil';
        if (lat > 19 && lat < 20 && lon > -99 && lon < -98) return 'Mexico City, Mexico';
        if (lat > 33 && lat < 34 && lon > -118 && lon < -117) return 'Los Angeles, USA';
        if (lat > 41 && lat < 42 && lon > -88 && lon < -87) return 'Chicago, USA';
        
        // Oceans
        if (absLat < 60) {
            // Pacific Ocean (largest ocean)
            if ((lon > 120 && lon < 180) || (lon < -100 && lon > -180)) {
                if (absLat < 23) return 'Central Pacific Ocean';
                return 'Pacific Ocean';
            }
            // Atlantic Ocean
            if (lon > -80 && lon < 0) {
                if (absLat < 23) return 'Tropical Atlantic Ocean';
                return 'Atlantic Ocean';
            }
            // Indian Ocean
            if (lon > 40 && lon < 120 && lat < 30) {
                return 'Indian Ocean';
            }
            // Mediterranean
            if (lat > 30 && lat < 45 && lon > 0 && lon < 40) {
                return 'Mediterranean Sea';
            }
        }
        
        // Continents/Regions
        if (lat > 25 && lat < 50 && lon > -125 && lon < -65) return 'United States';
        if (lat > 50 && lat < 70 && lon > -140 && lon < -60) return 'Canada';
        if (lat > 10 && lat < 35 && lon > -115 && lon < -85) return 'Mexico/Central America';
        if (lat > -35 && lat < 15 && lon > -80 && lon < -35) return 'South America';
        if (lat > 35 && lat < 70 && lon > -10 && lon < 40) return 'Europe';
        if (lat > -35 && lat < 35 && lon > -15 && lon < 50) return 'Africa';
        if (lat > 5 && lat < 75 && lon > 40 && lon < 180) return 'Asia';
        if (lat > -45 && lat < -10 && lon > 110 && lon < 155) return 'Australia';
        
        // Polar regions
        if (absLat > 66) {
            if (lat > 0) return 'Arctic Region';
            return 'Antarctica';
        }
        
        // Default to coordinates
        return `${lat.toFixed(1)}° ${lat >= 0 ? 'N' : 'S'}, ${Math.abs(lon).toFixed(1)}° ${lon >= 0 ? 'E' : 'W'}`;
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
            const h4 = mitigationResult.querySelector('h4');
            if (h4) h4.style.color = 'var(--accent-green)';
        } else {
            mitigationResult.style.borderColor = 'var(--accent-orange)';
            const h4 = mitigationResult.querySelector('h4');
            if (h4) h4.style.color = 'var(--accent-orange)';
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
    },

    /**
     * Generate AI Strategic Analysis
     */
    async generateAIAnalysis() {
        if (!this.currentScenario) {
            this.showToast('⚠️ Please run a simulation first before generating AI analysis');
            return;
        }

        const loadingEl = document.getElementById('ai-loading');
        const resultEl = document.getElementById('ai-analysis-result');
        const emptyStateEl = document.getElementById('ai-empty-state');
        const contentEl = document.getElementById('ai-analysis-content');
        const timestampEl = document.getElementById('ai-timestamp');
        const generateBtn = document.getElementById('generate-ai-analysis-btn');

        try {
            // Show loading state
            loadingEl.classList.remove('hidden');
            resultEl.classList.add('hidden');
            emptyStateEl.classList.add('hidden');
            generateBtn.disabled = true;
            generateBtn.innerHTML = '<span class="material-icons spinning">autorenew</span> Generating...';

            // Get current parameters
            const params = {
                diameter: parseFloat(document.getElementById('diameter').value),
                velocity: parseFloat(document.getElementById('velocity').value),
                angle: parseFloat(document.getElementById('angle').value),
                density: parseFloat(document.getElementById('density').value),
                lat: parseFloat(document.getElementById('lat').value),
                lon: parseFloat(document.getElementById('lon').value)
            };

            // Call AI analysis API
            const response = await fetch('/api/ai-analysis', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    impactData: this.currentScenario.results,
                    asteroidParams: params
                })
            });

            if (!response.ok) {
                throw new Error('Failed to generate AI analysis');
            }

            const data = await response.json();

            // Convert markdown-style headers to HTML
            const formattedAnalysis = this.formatAIAnalysis(data.analysis);

            // Display results
            contentEl.innerHTML = formattedAnalysis;
            timestampEl.textContent = new Date(data.timestamp).toLocaleString();
            
            loadingEl.classList.add('hidden');
            resultEl.classList.remove('hidden');
            
            this.showToast('✅ AI Analysis generated successfully');

        } catch (error) {
            console.error('AI Analysis Error:', error);
            loadingEl.classList.add('hidden');
            emptyStateEl.classList.remove('hidden');
            this.showToast('❌ Failed to generate AI analysis');
        } finally {
            generateBtn.disabled = false;
            generateBtn.innerHTML = '<span class="material-icons">auto_awesome</span> Generate AI Analysis';
        }
    },

    /**
     * Format AI analysis text to HTML with structured boxes and sections
     */
    formatAIAnalysis(text) {
        // Split text into sections based on major headings (##)
        const sections = [];
        const lines = text.split('\n');
        let currentSection = null;
        let currentContent = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            // Check for major section headers (##)
            if (line.match(/^##\s+(.+)$/)) {
                // Save previous section if exists
                if (currentSection) {
                    sections.push({
                        title: currentSection,
                        content: currentContent.join('\n')
                    });
                }
                // Start new section
                currentSection = line.replace(/^##\s+/, '').trim();
                currentContent = [];
            } else {
                currentContent.push(line);
            }
        }

        // Add last section
        if (currentSection) {
            sections.push({
                title: currentSection,
                content: currentContent.join('\n')
            });
        }

        // Format each section
        let html = sections.map((section, index) => {
            const sectionClass = index === 0 ? 'ai-section ai-section-primary' : 'ai-section';
            const iconMap = {
                'EXECUTIVE SUMMARY': 'summarize',
                'THREAT ASSESSMENT': 'warning',
                'IMMEDIATE RESPONSE': 'emergency',
                'EVACUATION': 'directions_run',
                'MEDICAL': 'medical_services',
                'INFRASTRUCTURE': 'engineering',
                'COMMUNICATION': 'campaign',
                'LONG-TERM': 'timeline',
                'RECOVERY': 'autorenew',
                'MITIGATION': 'shield',
                'STRATEGIC': 'strategy'
            };
            
            // Find matching icon
            let icon = 'article';
            for (const [key, value] of Object.entries(iconMap)) {
                if (section.title.toUpperCase().includes(key)) {
                    icon = value;
                    break;
                }
            }

            let formattedContent = this.formatSectionContent(section.content);
            
            return `
                <div class="${sectionClass}">
                    <div class="ai-section-header">
                        <span class="material-icons ai-section-icon">${icon}</span>
                        <h2 class="ai-section-title">${section.title}</h2>
                    </div>
                    <div class="ai-section-content">
                        ${formattedContent}
                    </div>
                </div>
            `;
        }).join('');

        return html;
    },

    /**
     * Format content within a section
     */
    formatSectionContent(content) {
        let html = content;

        // Subsection headers (###)
        html = html.replace(/^###\s+(.+)$/gm, '<div class="ai-subsection"><h3 class="ai-subsection-title">$1</h3></div>');

        // Bold text with special styling for labels
        html = html.replace(/\*\*([^*]+?):\*\*/g, '<span class="ai-label">$1:</span>');
        html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

        // Bullet points with icons
        html = html.replace(/^-\s+(.+)$/gm, '<li class="ai-bullet"><span class="bullet-icon">▸</span>$1</li>');
        html = html.replace(/(<li class="ai-bullet">.*<\/li>\n?)+/g, '<ul class="ai-list">$&</ul>');

        // Numbered lists
        html = html.replace(/^(\d+)\.\s+(.+)$/gm, '<li class="ai-numbered" data-number="$1">$2</li>');
        const numberedListRegex = /(<li class="ai-numbered".*<\/li>\n?)+/g;
        html = html.replace(numberedListRegex, (match) => {
            return '<ol class="ai-numbered-list">' + match + '</ol>';
        });

        // Paragraphs
        html = html.split('\n\n').map(para => {
            const trimmed = para.trim();
            if (!trimmed) return '';
            if (trimmed.startsWith('<h3') || 
                trimmed.startsWith('<ul') || 
                trimmed.startsWith('<ol') ||
                trimmed.startsWith('<div class="ai-subsection"')) {
                return para;
            }
            return '<p class="ai-paragraph">' + para + '</p>';
        }).join('\n');

        return html;
    }
};

// Make available globally
window.UI = UI;
