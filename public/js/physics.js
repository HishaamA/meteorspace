// Physics calculation module for impact modeling

const Physics = {
    // Constants
    G: 6.674e-11, // Gravitational constant
    EARTH_RADIUS: 6371, // km
    EARTH_MASS: 5.972e24, // kg
    AU: 1.496e8, // Astronomical Unit in km
    
    /**
     * Calculate impact energy
     * @param {number} mass - Mass in kg
     * @param {number} velocity - Velocity in m/s
     * @returns {number} Energy in Joules
     */
    calculateKineticEnergy(mass, velocity) {
        return 0.5 * mass * Math.pow(velocity, 2);
    },
    
    /**
     * Convert energy to megatons TNT equivalent
     * @param {number} joules - Energy in Joules
     * @returns {number} Energy in megatons
     */
    joulesToMegatons(joules) {
        return joules / 4.184e15;
    },
    
    /**
     * Calculate asteroid mass from diameter and density
     * @param {number} diameter - Diameter in meters
     * @param {number} density - Density in kg/m³
     * @returns {number} Mass in kg
     */
    calculateMass(diameter, density) {
        const radius = diameter / 2;
        const volume = (4 / 3) * Math.PI * Math.pow(radius, 3);
        return volume * density;
    },
    
    /**
     * Estimate crater size using scaling laws
     * @param {number} projectileDiameter - Projectile diameter in meters
     * @param {number} projectileDensity - Projectile density in kg/m³
     * @param {number} velocity - Impact velocity in m/s
     * @param {number} angle - Impact angle in degrees
     * @returns {object} Crater dimensions
     */
    calculateCraterSize(projectileDiameter, projectileDensity, velocity, angle) {
        const targetDensity = 2500; // kg/m³ (typical rock)
        const soundSpeed = 5000; // m/s
        const angleRad = (angle * Math.PI) / 180;
        
        // Holsapple scaling
        const diameter = 1.8 * projectileDiameter * 
            Math.pow(projectileDensity / targetDensity, 1/3) * 
            Math.pow(velocity / soundSpeed, 0.44) / 
            Math.pow(Math.sin(angleRad), 1/3);
        
        const depth = diameter / 3; // Typical depth-to-diameter ratio
        
        return {
            diameter: diameter,
            depth: depth,
            radius: diameter / 2
        };
    },
    
    /**
     * Calculate seismic magnitude from impact energy
     * @param {number} energyJoules - Energy in Joules
     * @returns {number} Richter magnitude
     */
    calculateSeismicMagnitude(energyJoules) {
        // Empirical relationship: M = 0.67 * log10(E) - 5.87
        return 0.67 * Math.log10(energyJoules) - 5.87;
    },
    
    /**
     * Calculate damage zones
     * @param {number} energyMegatons - Energy in megatons TNT
     * @returns {object} Various damage zone radii in km
     */
    calculateDamageZones(energyMegatons) {
        return {
            fireball: 0.28 * Math.pow(energyMegatons, 0.33),
            severeBlast: 0.22 * Math.pow(energyMegatons, 0.33), // 20 psi
            moderateBlast: 0.54 * Math.pow(energyMegatons, 0.33), // 5 psi
            thermalRadiation: 0.38 * Math.pow(energyMegatons, 0.41),
            ionizingRadiation: 0.15 * Math.pow(energyMegatons, 0.33)
        };
    },
    
    /**
     * Assess tsunami risk based on impact parameters
     * @param {number} diameter - Asteroid diameter in meters
     * @param {number} lat - Latitude
     * @param {number} lon - Longitude
     * @param {number} energy - Impact energy in megatons
     * @returns {object} Tsunami risk assessment
     */
    assessTsunamiRisk(diameter, lat, lon, energy) {
        // Simplified ocean detection (would need actual bathymetry data)
        const likelyOcean = Math.abs(lat) < 60;
        
        if (!likelyOcean) {
            return {
                risk: 'LOW',
                message: 'Land impact - no tsunami expected',
                waveHeight: 0
            };
        }
        
        // Estimate tsunami wave height
        // Very simplified - real calculation would use water depth, distance, etc.
        let waveHeight = 0;
        let risk = 'LOW';
        let message = 'Minimal tsunami risk';
        
        if (diameter > 200) {
            waveHeight = Math.pow(energy, 0.5) * 0.5;
            risk = 'EXTREME';
            message = `Potentially catastrophic tsunami with waves up to ${waveHeight.toFixed(0)}m`;
        } else if (diameter > 100) {
            waveHeight = Math.pow(energy, 0.5) * 0.2;
            risk = 'HIGH';
            message = `Dangerous tsunami possible with waves up to ${waveHeight.toFixed(0)}m`;
        } else if (diameter > 50) {
            waveHeight = Math.pow(energy, 0.5) * 0.1;
            risk = 'MODERATE';
            message = `Local tsunami possible with waves up to ${waveHeight.toFixed(0)}m`;
        }
        
        return { risk, message, waveHeight };
    },
    
    /**
     * Calculate orbital trajectory points
     * @param {object} params - Orbital parameters
     * @returns {array} Array of position vectors
     */
    calculateOrbit(params) {
        const { semiMajorAxis, eccentricity, inclination, numPoints = 100 } = params;
        const points = [];
        
        for (let i = 0; i <= numPoints; i++) {
            const theta = (i / numPoints) * 2 * Math.PI;
            
            // Calculate distance from focus (perihelion to aphelion)
            const r = semiMajorAxis * (1 - eccentricity * eccentricity) / 
                     (1 + eccentricity * Math.cos(theta));
            
            // Convert to Cartesian coordinates
            const x = r * Math.cos(theta);
            const y = r * Math.sin(theta) * Math.cos(inclination * Math.PI / 180);
            const z = r * Math.sin(theta) * Math.sin(inclination * Math.PI / 180);
            
            points.push({ x, y, z });
        }
        
        return points;
    },
    
    /**
     * Calculate deflection outcome
     * @param {number} velocityChange - Delta-v in cm/s
     * @param {number} warningTime - Warning time in years
     * @param {number} asteroidMass - Mass in kg
     * @returns {object} Deflection results
     */
    calculateDeflection(velocityChange, warningTime, asteroidMass) {
        // Convert to SI units
        const deltaV = velocityChange / 100; // cm/s to m/s
        const timeSeconds = warningTime * 365.25 * 24 * 3600;
        
        // Calculate deflection distance
        const deflectionDistance = deltaV * timeSeconds / 1000; // km
        
        // Calculate required impulse
        const impulse = asteroidMass * deltaV; // kg⋅m/s
        
        // Estimate if this deflects asteroid enough to miss Earth
        const earthRadius = 6371; // km
        const minimumMissDistance = earthRadius * 1.02; // 2% margin
        
        return {
            deflectionDistance,
            impulse,
            success: deflectionDistance > minimumMissDistance,
            missDistance: deflectionDistance - earthRadius
        };
    },
    
    /**
     * Format large numbers in scientific notation
     * @param {number} num - Number to format
     * @param {number} precision - Decimal places
     * @returns {string} Formatted string
     */
    formatScientific(num, precision = 2) {
        if (num === 0) return '0';
        const exponent = Math.floor(Math.log10(Math.abs(num)));
        const mantissa = num / Math.pow(10, exponent);
        return `${mantissa.toFixed(precision)} × 10^${exponent}`;
    },
    
    /**
     * Convert latitude/longitude to 3D Cartesian coordinates
     * @param {number} lat - Latitude in degrees
     * @param {number} lon - Longitude in degrees
     * @param {number} radius - Sphere radius
     * @returns {object} 3D coordinates {x, y, z}
     */
    latLonToCartesian(lat, lon, radius) {
        const latRad = (lat * Math.PI) / 180;
        const lonRad = (lon * Math.PI) / 180;
        
        // Standard spherical to Cartesian conversion for Earth coordinates
        // This matches the standard map projection used in the 2D map
        return {
            x: radius * Math.cos(latRad) * Math.cos(lonRad),
            y: radius * Math.sin(latRad),
            z: -radius * Math.cos(latRad) * Math.sin(lonRad)
        };
    }
};

// Make available globally
window.Physics = Physics;
