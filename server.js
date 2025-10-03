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
    const velocityKmh = velocity * 3600; // km/h
    const velocityMph = velocity * 2236.94; // mph
    const angleRad = (angle * Math.PI) / 180;
    
    // Calculate mass (spherical asteroid)
    const volume = (4 / 3) * Math.PI * Math.pow(radius, 3); // m³
    const mass = volume * density; // kg
    
    // Calculate kinetic energy: E = 0.5 * m * v²
    const kineticEnergy = 0.5 * mass * Math.pow(velocityMs, 2); // Joules
    const energyMegatons = kineticEnergy / 4.184e15; // Convert to megatons TNT
    const energyGigatons = energyMegatons / 1000; // Convert to gigatons
    
    // Crater diameter estimation (Holsapple & Housen scaling)
    const targetDensity = 2500; // kg/m³ (typical rock)
    const soundSpeed = 5000; // m/s (typical rock)
    const craterDiameter = 1.8 * diameter * 
        Math.pow(density / targetDensity, 1/3) * 
        Math.pow(velocityMs / soundSpeed, 0.44) / 
        Math.pow(Math.sin(angleRad), 1/3);
    
    const craterDepth = craterDiameter / 3;
    const craterRadius = craterDiameter / 2;
    
    // Seismic magnitude estimation
    const seismicMagnitude = 0.67 * Math.log10(kineticEnergy) - 5.87;
    
    // Seismic felt radius (rough estimate based on magnitude)
    const seismicFeltRadius = Math.pow(10, seismicMagnitude / 2) * 0.5; // km
    
    // Fireball calculations
    const fireballDiameter = 0.56 * Math.pow(energyMegatons, 0.33); // km
    const fireballRadius = fireballDiameter / 2;
    
    // Maximum range for trees catching fire (thermal radiation)
    const thermalIgnitionRadius = 0.38 * Math.pow(energyMegatons, 0.41); // km
    
    // Thermal radiation zones
    const thermal3rdDegreeRadius = 0.32 * Math.pow(energyMegatons, 0.38); // km (3rd degree burns)
    const thermal2ndDegreeRadius = 0.46 * Math.pow(energyMegatons, 0.40); // km (2nd degree burns)
    
    // Air blast calculations
    const airBlastRadius = 0.22 * Math.pow(energyMegatons, 0.33); // km (20 psi - severe)
    const moderateDamageRadius = 0.54 * Math.pow(energyMegatons, 0.33); // km (5 psi)
    const lightDamageRadius = 1.04 * Math.pow(energyMegatons, 0.33); // km (1 psi)
    
    // Overpressure calculations
    const overpressure20psi = 20; // psi - severe structural damage
    const overpressure5psi = 5; // psi - moderate damage
    const overpressure1psi = 1; // psi - glass breakage
    
    // Wind speeds (approximate from overpressure)
    const windSpeed20psi = 470; // mph (756 km/h) - EF5 tornado equivalent
    const windSpeed5psi = 160; // mph (257 km/h)
    const windSpeed1psi = 40; // mph (64 km/h)
    
    // Wind blast zones
    const ef5TornadoZone = airBlastRadius; // 20 psi zone
    const treesBlownRadius = moderateDamageRadius; // 5 psi zone
    const jupiterStormZone = airBlastRadius * 0.8; // >400 mph zone
    
    // Shock wave calculations
    const maxDecibels = 200 + 20 * Math.log10(energyMegatons); // Approximate
    const lungDamageRadius = airBlastRadius * 1.2; // km
    const eardrumsRuptureRadius = moderateDamageRadius; // km
    
    // Building collapse zones
    const totalCollapseRadius = airBlastRadius; // 20 psi
    const severeStructuralDamageRadius = moderateDamageRadius; // 5 psi
    const homeDestructionRadius = moderateDamageRadius * 1.3; // km
    
    // Total affected area
    const affectedArea = Math.PI * Math.pow(moderateDamageRadius, 2);
    
    // Impact frequency estimation based on size
    let impactFrequency;
    if (diameter < 50) {
        impactFrequency = "every 10-100 years";
    } else if (diameter < 100) {
        impactFrequency = "every 100-1,000 years";
    } else if (diameter < 300) {
        impactFrequency = "every 1,000-10,000 years";
    } else if (diameter < 1000) {
        impactFrequency = "every 10,000-100,000 years";
    } else {
        impactFrequency = "every 100,000+ years";
    }
    
    // Energy comparisons
    const tsarBombaEquivalent = energyMegatons / 50; // Tsar Bomba was ~50 MT
    const hiroshimaEquivalent = energyMegatons / 0.015; // Hiroshima was ~15 kt
    const hurricaneEnergyComparison = energyMegatons > 60; // Hurricane releases ~6x10^14 J/day ≈ 60 MT
    
    // Tsunami risk assessment
    const isOcean = Math.abs(lat) < 60;
    const tsunamiRisk = isOcean && diameter > 200 ? 
        'HIGH - Capable of generating destructive tsunamis' : 
        isOcean && diameter > 50 ? 
        'MODERATE - May generate local tsunamis' : 
        'LOW';
    
    // Calculate population at risk with detailed breakdown
    const populationImpact = calculatePopulationImpact(
        lat, lon, 
        craterRadius / 1000, 
        airBlastRadius, 
        moderateDamageRadius,
        fireballRadius,
        thermal3rdDegreeRadius,
        thermal2ndDegreeRadius,
        lungDamageRadius,
        eardrumsRuptureRadius,
        seismicFeltRadius
    );
    
    return {
        // Basic energy
        energy: energyMegatons.toFixed(2),
        energyGigatons: energyGigatons.toFixed(4),
        
        // Impact details
        impactVelocityKmh: velocityKmh.toFixed(0),
        impactVelocityMph: velocityMph.toFixed(0),
        impactFrequency: impactFrequency,
        
        // Energy comparisons
        tsarBombaEquivalent: tsarBombaEquivalent.toFixed(1),
        hiroshimaEquivalent: hiroshimaEquivalent.toFixed(0),
        hurricaneComparison: hurricaneEnergyComparison,
        
        // Crater details
        craterDiameter: (craterDiameter / 1000).toFixed(2), // km
        craterDepth: (craterDepth / 1000).toFixed(3), // km
        craterRadius: (craterRadius / 1000).toFixed(2), // km
        
        // Fireball (thermal radiation)
        fireballDiameter: fireballDiameter.toFixed(2),
        fireballRadius: fireballRadius.toFixed(2),
        thermalIgnitionRadius: thermalIgnitionRadius.toFixed(2),
        thermal3rdDegreeRadius: thermal3rdDegreeRadius.toFixed(2),
        thermal2ndDegreeRadius: thermal2ndDegreeRadius.toFixed(2),
        
        // Shock wave
        maxDecibels: Math.min(maxDecibels, 250).toFixed(0),
        lungDamageRadius: lungDamageRadius.toFixed(2),
        eardrumsRuptureRadius: eardrumsRuptureRadius.toFixed(2),
        
        // Air blast
        airBlastRadius: airBlastRadius.toFixed(2),
        moderateDamageRadius: moderateDamageRadius.toFixed(2),
        lightDamageRadius: lightDamageRadius.toFixed(2),
        
        // Wind blast
        peakWindSpeedMph: windSpeed20psi.toFixed(0),
        peakWindSpeedKmh: (windSpeed20psi * 1.60934).toFixed(0),
        ef5TornadoZone: ef5TornadoZone.toFixed(2),
        treesBlownRadius: treesBlownRadius.toFixed(2),
        jupiterStormZone: jupiterStormZone.toFixed(2),
        
        // Building damage
        totalCollapseRadius: totalCollapseRadius.toFixed(2),
        homeDestructionRadius: homeDestructionRadius.toFixed(2),
        severeStructuralDamageRadius: severeStructuralDamageRadius.toFixed(2),
        
        // Seismic
        seismicMagnitude: seismicMagnitude.toFixed(1),
        seismicFeltRadius: seismicFeltRadius.toFixed(0),
        
        // Other
        affectedArea: affectedArea.toFixed(0),
        tsunamiRisk,
        populationImpact,
        impactLocation: { lat, lon },
        
        zones: {
            crater: craterRadius / 1000, // km radius
            severe: airBlastRadius,
            moderate: moderateDamageRadius
        }
    };
}

function calculatePopulationImpact(
    lat, lon, 
    craterRadius, 
    severeRadius, 
    moderateRadius,
    fireballRadius,
    thermal3rdRadius,
    thermal2ndRadius,
    lungDamageRadius,
    eardrumsRadius,
    seismicRadius
) {
    // Estimate population density based on location
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
    
    // Calculate population in each zone
    const peopleInCrater = Math.round(craterArea * populationDensity);
    const peopleInFireball = Math.round(Math.PI * Math.pow(fireballRadius, 2) * populationDensity);
    const peopleInSevereBlast = Math.round(severeArea * populationDensity);
    const peopleInModerateBlast = Math.round(moderateArea * populationDensity);
    
    // Fatality rates by zone
    const craterFatalities = Math.round(craterArea * populationDensity * 1.0); // 100% in crater (vaporized)
    const fireballDeaths = Math.round(Math.PI * Math.pow(fireballRadius, 2) * populationDensity * 0.95); // 95% in fireball
    const severeFatalities = Math.round(severeArea * populationDensity * 0.7); // 70% in severe blast zone
    const moderateFatalities = Math.round(moderateArea * populationDensity * 0.3); // 30% in moderate zone
    
    // Shock wave casualties
    const shockWaveDeaths = Math.round(severeArea * populationDensity * 0.6); // 60% from shock wave effects
    
    // Wind blast casualties
    const windBlastDeaths = Math.round(severeArea * populationDensity * 0.65); // 65% from wind effects
    
    // Seismic casualties (much lower fatality rate)
    const seismicDeaths = Math.round(Math.PI * Math.pow(seismicRadius, 2) * populationDensity * 0.01); // 1% in felt zone
    
    // Thermal radiation burn casualties
    const burns3rdDegree = Math.round(Math.PI * Math.pow(thermal3rdRadius, 2) * populationDensity * 0.6);
    const burns2ndDegree = Math.round(Math.PI * Math.pow(thermal2ndRadius, 2) * populationDensity * 0.4);
    
    const totalFatalities = Math.round(craterFatalities + severeFatalities + moderateFatalities);
    const totalAtRisk = Math.round(Math.PI * Math.pow(moderateRadius, 2) * populationDensity);
    
    // Calculate injured (those at risk but not fatal)
    const injured = Math.round((totalAtRisk - totalFatalities) * 0.5);
    
    // Percentage fatalities at ground zero
    const groundZeroFatalityRate = 100; // 100% in crater
    
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
        severity,
        
        // Detailed breakdowns
        craterVaporized: craterFatalities,
        groundZeroFatalityRate: groundZeroFatalityRate,
        fireballDeaths: fireballDeaths,
        burns3rdDegree: burns3rdDegree,
        burns2ndDegree: burns2ndDegree,
        shockWaveDeaths: shockWaveDeaths,
        windBlastDeaths: windBlastDeaths,
        seismicDeaths: seismicDeaths
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
