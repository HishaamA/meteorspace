require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const NASA_API_KEY = process.env.NASA_API_KEY || 'DEMO_KEY';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// NASA NEO API proxy endpoint
app.get('/api/neo', async (req, res) => {
    try {
        const { id } = req.query;
        
        if (id) {
            // Fetch specific NEO by ID
            const response = await axios.get(
                `https://api.nasa.gov/neo/rest/v1/neo/${id}?api_key=${NASA_API_KEY}`
            );
            res.json(response.data);
        } else {
            // Fetch feed of NEOs
            const today = new Date().toISOString().split('T')[0];
            const response = await axios.get(
                `https://api.nasa.gov/neo/rest/v1/feed?start_date=${today}&end_date=${today}&api_key=${NASA_API_KEY}`
            );
            res.json(response.data);
        }
    } catch (error) {
        console.error('NASA API Error:', error.message);
        res.status(500).json({ 
            error: 'Failed to fetch NEO data',
            message: error.message 
        });
    }
});

// Browse NEOs endpoint
app.get('/api/neo/browse', async (req, res) => {
    try {
        const response = await axios.get(
            `https://api.nasa.gov/neo/rest/v1/neo/browse?api_key=${NASA_API_KEY}`
        );
        res.json(response.data);
    } catch (error) {
        console.error('NASA API Error:', error.message);
        res.status(500).json({ 
            error: 'Failed to browse NEO data',
            message: error.message 
        });
    }
});

// Impact calculation endpoint
app.post('/api/calculate-impact', (req, res) => {
    try {
        const {
            diameter,      // meters
            velocity,      // km/s
            angle,         // degrees
            density,       // kg/m³
            lat,
            lon
        } = req.body;

        // Calculate impact parameters
        const results = calculateImpactPhysics(diameter, velocity, angle, density, lat, lon);
        
        res.json(results);
    } catch (error) {
        console.error('Calculation Error:', error.message);
        res.status(500).json({ 
            error: 'Failed to calculate impact',
            message: error.message 
        });
    }
});

// Mitigation calculation endpoint
app.post('/api/calculate-mitigation', (req, res) => {
    try {
        const {
            asteroidParams,
            mitigationType,
            warningTime,
            velocityChange
        } = req.body;

        const results = calculateMitigation(
            asteroidParams,
            mitigationType,
            warningTime,
            velocityChange
        );
        
        res.json(results);
    } catch (error) {
        console.error('Mitigation Calculation Error:', error.message);
        res.status(500).json({ 
            error: 'Failed to calculate mitigation',
            message: error.message 
        });
    }
});

// Physics calculation functions
function calculateImpactPhysics(diameter, velocity, angle, density, lat, lon) {
    // Convert units
    const radius = diameter / 2; // meters
    const velocityMs = velocity * 1000; // m/s
    const angleRad = (angle * Math.PI) / 180;
    
    // Calculate mass (spherical asteroid)
    const volume = (4 / 3) * Math.PI * Math.pow(radius, 3); // m³
    const mass = volume * density; // kg
    
    // Calculate kinetic energy: E = 0.5 * m * v²
    const kineticEnergy = 0.5 * mass * Math.pow(velocityMs, 2); // Joules
    const energyMegatons = kineticEnergy / 4.184e15; // Convert to megatons TNT
    
    // Crater diameter estimation (Holsapple & Housen scaling)
    // D_crater ≈ 1.8 * D_projectile * (ρ_projectile / ρ_target)^(1/3) * (v / v_sound)^0.44 / sin(θ)^(1/3)
    const targetDensity = 2500; // kg/m³ (typical rock)
    const soundSpeed = 5000; // m/s (typical rock)
    const craterDiameter = 1.8 * diameter * 
        Math.pow(density / targetDensity, 1/3) * 
        Math.pow(velocityMs / soundSpeed, 0.44) / 
        Math.pow(Math.sin(angleRad), 1/3);
    
    // Crater depth (typically 1/3 to 1/4 of diameter)
    const craterDepth = craterDiameter / 3;
    
    // Seismic magnitude estimation
    // M = 0.67 * log10(E) - 5.87 (empirical relation, E in Joules)
    const seismicMagnitude = 0.67 * Math.log10(kineticEnergy) - 5.87;
    
    // Fireball radius (thermal radiation zone)
    const fireballRadius = 0.28 * Math.pow(energyMegatons, 0.33); // km
    
    // Air blast radius (severe damage, 20 psi overpressure)
    const airBlastRadius = 0.22 * Math.pow(energyMegatons, 0.33); // km
    
    // Moderate damage radius (5 psi overpressure)
    const moderateDamageRadius = 0.54 * Math.pow(energyMegatons, 0.33); // km
    
    // Total affected area
    const affectedArea = Math.PI * Math.pow(moderateDamageRadius, 2);
    
    // Tsunami risk assessment
    const isOcean = Math.abs(lat) < 60; // Simplified ocean check
    const tsunamiRisk = isOcean && diameter > 200 ? 
        'HIGH - Capable of generating destructive tsunamis' : 
        isOcean && diameter > 50 ? 
        'MODERATE - May generate local tsunamis' : 
        'LOW';
    
    // Calculate population at risk
    const populationImpact = calculatePopulationImpact(lat, lon, craterDiameter / 2000, airBlastRadius, moderateDamageRadius);
    
    return {
        energy: energyMegatons.toFixed(2),
        craterDiameter: (craterDiameter / 1000).toFixed(2), // km
        craterDepth: (craterDepth / 1000).toFixed(3), // km
        seismicMagnitude: seismicMagnitude.toFixed(1),
        fireballRadius: fireballRadius.toFixed(2),
        airBlastRadius: airBlastRadius.toFixed(2),
        moderateDamageRadius: moderateDamageRadius.toFixed(2),
        affectedArea: affectedArea.toFixed(0),
        tsunamiRisk,
        populationImpact,
        impactLocation: { lat, lon },
        zones: {
            crater: craterDiameter / 2000, // km radius
            severe: airBlastRadius,
            moderate: moderateDamageRadius
        }
    };
}

function calculatePopulationImpact(lat, lon, craterRadius, severeRadius, moderateRadius) {
    // Estimate population density based on location
    // This is a simplified model using geographic regions
    let populationDensity; // people per km²
    let locationCategory;
    
    // Determine location type and population density
    const absLat = Math.abs(lat);
    
    // Ocean/remote areas
    if ((absLat < 60 && (
        (lon > -180 && lon < -140) || // Pacific
        (lon > -60 && lon < 20) ||    // Atlantic
        (lon > 40 && lon < 140)       // Indian Ocean
    )) && absLat < 40) {
        populationDensity = 0.5; // Ocean
        locationCategory = 'Ocean/Remote';
    }
    // Polar regions
    else if (absLat > 60) {
        populationDensity = 1;
        locationCategory = 'Polar Region';
    }
    // Major population centers (simplified regions)
    else if (
        (lat > 20 && lat < 50 && lon > -130 && lon < -60) || // North America
        (lat > 35 && lat < 65 && lon > -10 && lon < 40) ||   // Europe
        (lat > 20 && lat < 45 && lon > 70 && lon < 145) ||   // Asia
        (lat > -35 && lat < -10 && lon > -60 && lon < -35)   // South America (populated)
    ) {
        populationDensity = 150; // Urban/suburban average
        locationCategory = 'Populated Region';
    }
    // Moderate population
    else {
        populationDensity = 25; // Rural/moderate
        locationCategory = 'Rural Area';
    }
    
    // Calculate casualties by zone
    const craterArea = Math.PI * Math.pow(craterRadius, 2);
    const severeArea = Math.PI * Math.pow(severeRadius, 2) - craterArea;
    const moderateArea = Math.PI * Math.pow(moderateRadius, 2) - Math.PI * Math.pow(severeRadius, 2);
    
    // Fatality rates by zone
    const craterFatalities = craterArea * populationDensity * 1.0; // 100% in crater
    const severeFatalities = severeArea * populationDensity * 0.7; // 70% in severe blast zone
    const moderateFatalities = moderateArea * populationDensity * 0.3; // 30% in moderate zone
    
    const totalFatalities = Math.round(craterFatalities + severeFatalities + moderateFatalities);
    const totalAtRisk = Math.round(Math.PI * Math.pow(moderateRadius, 2) * populationDensity);
    
    // Calculate injured (those at risk but not fatal)
    const injured = Math.round((totalAtRisk - totalFatalities) * 0.5);
    
    // Determine severity level
    let severity;
    if (totalFatalities > 1000000) severity = 'CATASTROPHIC';
    else if (totalFatalities > 100000) severity = 'SEVERE';
    else if (totalFatalities > 10000) severity = 'MAJOR';
    else if (totalFatalities > 1000) severity = 'SIGNIFICANT';
    else if (totalFatalities > 100) severity = 'MODERATE';
    else severity = 'LOW';
    
    return {
        totalAtRisk,
        estimatedFatalities: totalFatalities,
        estimatedInjured: injured,
        locationCategory,
        populationDensity: populationDensity.toFixed(1),
        severity
    };
}

function calculateMitigation(asteroidParams, mitigationType, warningTime, velocityChange) {
    const { diameter, velocity, lat, lon } = asteroidParams;
    
    // Calculate deflection distance
    // Δx ≈ Δv * t (simplified)
    const timeSeconds = warningTime * 365.25 * 24 * 3600; // years to seconds
    const velocityChangeMs = velocityChange / 100; // cm/s to m/s
    const deflectionDistance = velocityChangeMs * timeSeconds / 1000; // km
    
    // Calculate new impact point (simplified - assumes perpendicular deflection)
    const earthRadius = 6371; // km
    const latRad = (lat * Math.PI) / 180;
    const lonRad = (lon * Math.PI) / 180;
    
    // Deflection in latitude (simplified)
    const deltaLat = (deflectionDistance / earthRadius) * (180 / Math.PI);
    
    let newLat = lat + deltaLat;
    let newLon = lon;
    
    // Check if deflection causes a miss
    const isMiss = deflectionDistance > earthRadius * 0.02; // ~127 km
    
    // Calculate success probability based on warning time and asteroid size
    let successProbability = 0;
    const mass = (4/3) * Math.PI * Math.pow(diameter/2, 3) * 3000; // kg, assuming stony
    
    switch(mitigationType) {
        case 'kinetic':
            // Kinetic impactor effectiveness decreases with size and increases with warning time
            successProbability = Math.min(95, (warningTime / diameter) * 1000 * velocityChange * 10);
            break;
        case 'gravity':
            // Gravity tractor needs more time but works better for smaller objects
            successProbability = Math.min(90, (warningTime / diameter) * 800 * velocityChange * 8);
            break;
        case 'nuclear':
            // Most effective for large objects with sufficient warning
            successProbability = Math.min(98, (warningTime / diameter) * 1200 * velocityChange * 12);
            break;
    }
    
    successProbability = Math.max(5, Math.min(98, successProbability));
    
    return {
        success: isMiss,
        successProbability: successProbability.toFixed(1),
        deflectionDistance: deflectionDistance.toFixed(0),
        newLocation: isMiss ? null : { lat: newLat.toFixed(4), lon: newLon.toFixed(4) },
        mitigationType,
        warningTime,
        velocityChange,
        message: isMiss ? 
            `Success! Asteroid deflected by ${deflectionDistance.toFixed(0)} km - Earth impact avoided.` :
            `Partial deflection achieved. Impact point shifted by ${deflectionDistance.toFixed(0)} km. Consider additional mitigation efforts.`
    };
}

// Serve index.html for root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Meteor Madness Simulator running on http://localhost:${PORT}`);
    console.log(`NASA API Key: ${NASA_API_KEY === 'DEMO_KEY' ? 'Using DEMO_KEY (limited rate)' : 'Custom key configured'}`);
});
