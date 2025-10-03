/**
 * Chart Visualizations Module
 * Professional chart visualizations using Chart.js
 */

const Charts = {
    charts: {},
    defaultOptions: {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 2,
        plugins: {
            legend: {
                display: true,
                position: 'right',
                labels: {
                    color: '#e0e0e0',
                    font: {
                        size: 13,
                        family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
                    },
                    padding: 15,
                    usePointStyle: true
                }
            },
            tooltip: {
                backgroundColor: 'rgba(26, 35, 50, 0.95)',
                titleColor: '#2196F3',
                bodyColor: '#e0e0e0',
                borderColor: '#2196F3',
                borderWidth: 1,
                padding: 12,
                displayColors: true,
                callbacks: {
                    label: function(context) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            label += context.parsed.y.toLocaleString();
                        } else if (context.parsed !== null) {
                            label += context.parsed.toLocaleString();
                        }
                        return label;
                    }
                }
            }
        },
        scales: {
            x: {
                ticks: {
                    color: '#a0a0a0',
                    font: { size: 11 }
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.05)',
                    drawBorder: false
                }
            },
            y: {
                ticks: {
                    color: '#a0a0a0',
                    font: { size: 11 }
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.05)',
                    drawBorder: false
                }
            }
        }
    },

    /**
     * Initialize all charts
     */
    init() {
        this.createImpactDistributionChart();
        this.createEnergyDistributionChart();
        this.createCraterTimelineChart();
        this.createAtmosphericEntryChart();
        this.createAreaExpansionChart();
    },

    /**
     * Create Impact Distribution Donut Chart
     */
    createImpactDistributionChart() {
        const ctx = document.getElementById('impact-distribution-chart');
        if (!ctx) return;

        this.charts.impactDistribution = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Direct Impact (30%)', 'Other Effects (35%)', 'Seismic Effects (35%)', 'Tsunami (0%)'],
                datasets: [{
                    label: 'Impact Distribution',
                    data: [30, 35, 35, 0],
                    backgroundColor: [
                        'rgba(158, 158, 158, 0.8)',
                        'rgba(120, 120, 120, 0.8)',
                        'rgba(100, 100, 100, 0.8)',
                        'rgba(80, 80, 80, 0.8)'
                    ],
                    borderColor: [
                        'rgba(158, 158, 158, 1)',
                        'rgba(120, 120, 120, 1)',
                        'rgba(100, 100, 100, 1)',
                        'rgba(80, 80, 80, 1)'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 1.5,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            color: '#e0e0e0',
                            font: { size: 12 },
                            padding: 12,
                            usePointStyle: true,
                            generateLabels: function(chart) {
                                const data = chart.data;
                                if (data.labels.length && data.datasets.length) {
                                    return data.labels.map((label, i) => {
                                        const meta = chart.getDatasetMeta(0);
                                        const style = meta.controller.getStyle(i);
                                        return {
                                            text: label.split(' (')[0],
                                            fillStyle: style.backgroundColor,
                                            strokeStyle: style.borderColor,
                                            lineWidth: style.borderWidth,
                                            hidden: false,
                                            index: i
                                        };
                                    });
                                }
                                return [];
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(26, 35, 50, 0.95)',
                        titleColor: '#2196F3',
                        bodyColor: '#e0e0e0',
                        borderColor: '#2196F3',
                        borderWidth: 1,
                        padding: 12,
                        callbacks: {
                            label: function(context) {
                                return context.label + ': ' + context.parsed + '%';
                            }
                        }
                    }
                }
            }
        });
    },

    /**
     * Create Energy Distribution Bar Chart
     */
    createEnergyDistributionChart() {
        const ctx = document.getElementById('energy-distribution-chart');
        if (!ctx) return;

        this.charts.energyDistribution = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Kinetic Energy', 'Heat', 'Seismic', 'Ejecta'],
                datasets: [{
                    label: 'Energy (MT)',
                    data: [22000, 5500, 2750, 1375],
                    backgroundColor: [
                        'rgba(33, 150, 243, 0.8)',
                        'rgba(255, 152, 0, 0.8)',
                        'rgba(156, 39, 176, 0.8)',
                        'rgba(76, 175, 80, 0.8)'
                    ],
                    borderColor: [
                        'rgba(33, 150, 243, 1)',
                        'rgba(255, 152, 0, 1)',
                        'rgba(156, 39, 176, 1)',
                        'rgba(76, 175, 80, 1)'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                ...this.defaultOptions,
                aspectRatio: 1.5,
                plugins: {
                    ...this.defaultOptions.plugins,
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            color: '#a0a0a0',
                            font: { size: 11 }
                        },
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: '#a0a0a0',
                            font: { size: 11 },
                            callback: function(value) {
                                if (value >= 1000) {
                                    return (value / 1000) + 'K';
                                }
                                return value;
                            }
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)'
                        }
                    }
                }
            }
        });
    },

    /**
     * Create Crater Formation Timeline Chart
     */
    createCraterTimelineChart() {
        const ctx = document.getElementById('crater-timeline-chart');
        if (!ctx) return;

        // Generate timeline data for first second
        const timePoints = [];
        const depthData = [];
        const diameterData = [];
        
        for (let i = 0; i <= 9; i++) {
            const t = i / 10;
            timePoints.push(t.toFixed(1));
            // Simulated crater growth (exponential then plateaus)
            const growthFactor = 1 - Math.exp(-5 * t);
            depthData.push(Math.round(280 * growthFactor));
            diameterData.push(Math.round(850 * growthFactor));
        }

        this.charts.craterTimeline = new Chart(ctx, {
            type: 'line',
            data: {
                labels: timePoints,
                datasets: [
                    {
                        label: 'Depth (m)',
                        data: depthData,
                        borderColor: 'rgba(33, 150, 243, 1)',
                        backgroundColor: 'rgba(33, 150, 243, 0.1)',
                        borderWidth: 3,
                        pointRadius: 5,
                        pointBackgroundColor: 'rgba(33, 150, 243, 1)',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        tension: 0.4
                    },
                    {
                        label: 'Diameter (m)',
                        data: diameterData,
                        borderColor: 'rgba(233, 30, 99, 1)',
                        backgroundColor: 'rgba(233, 30, 99, 0.1)',
                        borderWidth: 3,
                        pointRadius: 5,
                        pointBackgroundColor: 'rgba(233, 30, 99, 1)',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        tension: 0.4
                    }
                ]
            },
            options: {
                ...this.defaultOptions,
                aspectRatio: 1.8,
                plugins: {
                    ...this.defaultOptions.plugins,
                    legend: {
                        ...this.defaultOptions.plugins.legend,
                        position: 'top'
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Time (s)',
                            color: '#a0a0a0',
                            font: { size: 12, weight: 'bold' }
                        },
                        ticks: {
                            color: '#a0a0a0',
                            font: { size: 11 }
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Size (m)',
                            color: '#a0a0a0',
                            font: { size: 12, weight: 'bold' }
                        },
                        beginAtZero: true,
                        ticks: {
                            color: '#a0a0a0',
                            font: { size: 11 }
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)'
                        }
                    }
                }
            }
        });
    },

    /**
     * Create Atmospheric Entry Dynamics Chart
     */
    createAtmosphericEntryChart() {
        const ctx = document.getElementById('atmospheric-entry-chart');
        if (!ctx) return;

        // Simulate atmospheric entry (altitude vs velocity and mass)
        const altitudePoints = [];
        const velocityData = [];
        const massData = [];
        
        for (let i = 0; i <= 12; i++) {
            const altitude = (100 - i * 8).toFixed(2);
            altitudePoints.push(altitude);
            
            // Velocity decreases as it enters atmosphere
            const velocityLoss = Math.pow(i / 12, 2) * 0.05;
            velocityData.push((20 * (1 - velocityLoss)).toFixed(2));
            
            // Mass decreases due to ablation
            const massLoss = Math.pow(i / 12, 1.5) * 0.015;
            massData.push((100 * (1 - massLoss)).toFixed(1));
        }

        this.charts.atmosphericEntry = new Chart(ctx, {
            type: 'line',
            data: {
                labels: altitudePoints,
                datasets: [
                    {
                        label: 'Velocity (km/s)',
                        data: velocityData,
                        borderColor: 'rgba(0, 188, 212, 1)',
                        backgroundColor: 'rgba(0, 188, 212, 0.1)',
                        borderWidth: 3,
                        pointRadius: 0,
                        tension: 0.4,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Mass Remaining (%)',
                        data: massData,
                        borderColor: 'rgba(255, 193, 7, 1)',
                        backgroundColor: 'rgba(255, 193, 7, 0.1)',
                        borderWidth: 3,
                        pointRadius: 4,
                        pointBackgroundColor: 'rgba(255, 193, 7, 1)',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        tension: 0.4,
                        yAxisID: 'y1',
                        borderDash: [5, 5]
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 1.8,
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            color: '#e0e0e0',
                            font: { size: 12 },
                            padding: 12,
                            usePointStyle: true
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(26, 35, 50, 0.95)',
                        titleColor: '#2196F3',
                        bodyColor: '#e0e0e0',
                        borderColor: '#2196F3',
                        borderWidth: 1,
                        padding: 12
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Altitude (km)',
                            color: '#a0a0a0',
                            font: { size: 12, weight: 'bold' }
                        },
                        ticks: {
                            color: '#a0a0a0',
                            font: { size: 11 }
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)'
                        }
                    },
                    y: {
                        type: 'linear',
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Velocity (km/s)',
                            color: '#00BCD4',
                            font: { size: 12, weight: 'bold' }
                        },
                        ticks: {
                            color: '#00BCD4',
                            font: { size: 11 }
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)'
                        }
                    },
                    y1: {
                        type: 'linear',
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Mass Remaining (%)',
                            color: '#FFC107',
                            font: { size: 12, weight: 'bold' }
                        },
                        ticks: {
                            color: '#FFC107',
                            font: { size: 11 }
                        },
                        grid: {
                            drawOnChartArea: false
                        }
                    }
                }
            }
        });
    },

    /**
     * Create Affected Area Expansion Chart
     */
    createAreaExpansionChart() {
        const ctx = document.getElementById('area-expansion-chart');
        if (!ctx) return;

        // Generate area expansion data over 14 hours
        const hoursData = [];
        const areaData = [];
        
        for (let i = 0; i <= 14; i++) {
            hoursData.push(i);
            // Area expands rapidly then slows down
            const area = 400 * i + 50 * Math.pow(i, 1.5);
            areaData.push(Math.round(area));
        }

        this.charts.areaExpansion = new Chart(ctx, {
            type: 'line',
            data: {
                labels: hoursData,
                datasets: [{
                    label: 'Area (1000 km²)',
                    data: areaData,
                    borderColor: 'rgba(76, 175, 80, 1)',
                    backgroundColor: 'rgba(76, 175, 80, 0.2)',
                    borderWidth: 3,
                    pointRadius: 0,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 2.5,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(26, 35, 50, 0.95)',
                        titleColor: '#4CAF50',
                        bodyColor: '#e0e0e0',
                        borderColor: '#4CAF50',
                        borderWidth: 1,
                        padding: 12,
                        callbacks: {
                            label: function(context) {
                                return 'Area: ' + context.parsed.y.toLocaleString() + ' × 1000 km²';
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Hours After Impact',
                            color: '#a0a0a0',
                            font: { size: 12, weight: 'bold' }
                        },
                        ticks: {
                            color: '#a0a0a0',
                            font: { size: 11 }
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Area (1000 km²)',
                            color: '#a0a0a0',
                            font: { size: 12, weight: 'bold' }
                        },
                        beginAtZero: true,
                        ticks: {
                            color: '#a0a0a0',
                            font: { size: 11 },
                            callback: function(value) {
                                return value.toLocaleString();
                            }
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)'
                        }
                    }
                }
            }
        });
    },

    /**
     * Update all charts with new data
     */
    updateCharts(impactData, asteroidParams) {
        if (!impactData) return;

        // Update Impact Distribution - Calculate based on affected areas
        if (this.charts.impactDistribution) {
            // Calculate relative impact contributions based on radii
            const craterArea = Math.PI * Math.pow(parseFloat(impactData.craterRadius) || 0, 2);
            const thermalArea = Math.PI * Math.pow(parseFloat(impactData.fireballRadius) || 0, 2);
            const blastArea = Math.PI * Math.pow(parseFloat(impactData.airBlastRadius) || 0, 2);
            const seismicArea = Math.PI * Math.pow(parseFloat(impactData.seismicFeltRadius) || 0, 2);
            
            // Calculate percentages (normalized to total affected area)
            const totalArea = thermalArea + blastArea + seismicArea + craterArea;
            const directPercent = Math.round((craterArea / totalArea) * 100) || 10;
            const thermalPercent = Math.round((thermalArea / totalArea) * 100) || 25;
            const blastPercent = Math.round((blastArea / totalArea) * 100) || 30;
            const seismicPercent = 100 - directPercent - thermalPercent - blastPercent;
            
            // Check if it's an ocean impact for tsunami
            const tsunamiPercent = impactData.tsunamiRisk && impactData.tsunamiRisk.includes('HIGH') ? 15 : 0;
            
            this.charts.impactDistribution.data.datasets[0].data = [
                directPercent, 
                thermalPercent + blastPercent, 
                seismicPercent, 
                tsunamiPercent
            ];
            
            // Update labels with actual values
            this.charts.impactDistribution.data.labels = [
                `Direct Impact (${directPercent}%)`,
                `Thermal & Blast (${thermalPercent + blastPercent}%)`,
                `Seismic Effects (${seismicPercent}%)`,
                `Tsunami (${tsunamiPercent}%)`
            ];
            
            this.charts.impactDistribution.update();
        }

        // Update Energy Distribution
        if (this.charts.energyDistribution && impactData.energy) {
            const totalEnergy = parseFloat(impactData.energy) || 75;
            
            // Calculate energy distribution based on physics
            const kineticEnergy = Math.round(totalEnergy * 0.70);  // 70% kinetic
            const heatEnergy = Math.round(totalEnergy * 0.20);     // 20% heat/thermal
            const seismicEnergy = Math.round(totalEnergy * 0.07);  // 7% seismic
            const ejectaEnergy = Math.round(totalEnergy * 0.03);   // 3% ejecta
            
            this.charts.energyDistribution.data.datasets[0].data = [
                kineticEnergy,
                heatEnergy,
                seismicEnergy,
                ejectaEnergy
            ];
            this.charts.energyDistribution.update();
        }

        // Update Crater Timeline with actual crater dimensions
        if (this.charts.craterTimeline && impactData.craterDiameter) {
            const finalDepth = parseFloat(impactData.craterDepth) * 1000 || 280;
            const finalDiameter = parseFloat(impactData.craterDiameter) * 1000 || 850;
            
            const depthData = [];
            const diameterData = [];
            
            // Crater formation happens very rapidly (sub-second)
            for (let i = 0; i <= 9; i++) {
                const t = i / 10;
                // Exponential growth that plateaus quickly (crater forms in <1 second)
                const growthFactor = 1 - Math.exp(-5 * t);
                depthData.push(Math.round(finalDepth * growthFactor));
                diameterData.push(Math.round(finalDiameter * growthFactor));
            }
            
            this.charts.craterTimeline.data.datasets[0].data = depthData;
            this.charts.craterTimeline.data.datasets[1].data = diameterData;
            this.charts.craterTimeline.update();
        }

        // Update Atmospheric Entry with actual asteroid parameters
        if (this.charts.atmosphericEntry && asteroidParams) {
            const initialVelocity = parseFloat(asteroidParams.velocity) || 20;
            const diameter = parseFloat(asteroidParams.diameter) || 100;
            const density = parseFloat(asteroidParams.density) || 3000;
            
            const altitudePoints = [];
            const velocityData = [];
            const massData = [];
            
            // Calculate atmospheric entry (100km to 0km altitude)
            // Atmospheric density increases exponentially as altitude decreases
            for (let i = 0; i <= 12; i++) {
                const altitude = 100 - (i * 100 / 12);
                altitudePoints.push(altitude.toFixed(1));
                
                // Realistic atmospheric density at this altitude (exponential model)
                // Sea level = 1.225 kg/m³, decreases with altitude
                const atmosphericDensity = 1.225 * Math.exp(-altitude / 8.5); // Scale height ~8.5km
                
                // Cross-sectional area of asteroid
                const radius = diameter / 2;
                const area = Math.PI * Math.pow(radius, 2);
                
                // Calculate cumulative velocity loss due to drag
                // Drag force: F = 0.5 * Cd * rho * A * v²
                // Larger objects with more mass maintain velocity better
                const asteroidMass = (4/3) * Math.PI * Math.pow(radius, 3) * density;
                const dragCoefficient = 0.47; // Sphere
                
                // Velocity decay increases as atmospheric density increases (lower altitude)
                // Smaller, less dense objects lose velocity faster
                const momentumFactor = asteroidMass / (area * 1000); // Mass-to-area ratio
                const velocityLossFactor = atmosphericDensity / momentumFactor;
                
                // Exponential velocity decay - most loss happens in lower atmosphere
                let cumulativeVelocityLoss = 0;
                for (let j = 0; j <= i; j++) {
                    const alt = 100 - (j * 100 / 12);
                    const rho = 1.225 * Math.exp(-alt / 8.5);
                    cumulativeVelocityLoss += rho * 0.01; // Accumulate drag effects
                }
                
                // Scale the loss based on asteroid properties
                const scaledLoss = cumulativeVelocityLoss / Math.sqrt(momentumFactor);
                const currentVelocity = initialVelocity * Math.exp(-scaledLoss * 0.5);
                velocityData.push(Math.max(currentVelocity, initialVelocity * 0.3).toFixed(2));
                
                // Mass loss due to ablation (burning up in atmosphere)
                // Smaller objects lose more mass percentage
                // Most ablation occurs in lower atmosphere (30-60km)
                const ablationAltitude = altitude < 60 ? (60 - altitude) / 60 : 0;
                const ablationFactor = 1 / Math.sqrt(diameter); // Smaller = more ablation
                const massLoss = Math.pow(ablationAltitude, 2) * ablationFactor * 0.5;
                const remainingMass = 100 * (1 - Math.min(massLoss, 0.4));
                massData.push(remainingMass.toFixed(1));
            }
            
            this.charts.atmosphericEntry.data.labels = altitudePoints;
            this.charts.atmosphericEntry.data.datasets[0].data = velocityData;
            this.charts.atmosphericEntry.data.datasets[1].data = massData;
            this.charts.atmosphericEntry.update();
        }

        // Update Area Expansion with actual affected area
        if (this.charts.areaExpansion && impactData.moderateDamageRadius) {
            const maxRadius = parseFloat(impactData.moderateDamageRadius);
            const areaData = [];
            
            // Area expansion over time (debris, fires, shock waves spread)
            for (let i = 0; i <= 14; i++) {
                // Initial rapid expansion, then slows down
                const expansionFactor = Math.sqrt(i / 14); // Square root for realistic expansion
                const currentRadius = maxRadius * expansionFactor;
                const area = Math.PI * Math.pow(currentRadius, 2) / 1000; // Convert to 1000 km²
                areaData.push(Math.round(area * 100) / 100);
            }
            
            this.charts.areaExpansion.data.datasets[0].data = areaData;
            this.charts.areaExpansion.update();
        }
    },

    /**
     * Destroy all charts
     */
    destroyAll() {
        Object.values(this.charts).forEach(chart => {
            if (chart) chart.destroy();
        });
        this.charts = {};
    }
};

// Make available globally
window.Charts = Charts;
