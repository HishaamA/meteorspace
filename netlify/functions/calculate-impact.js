const axios = require('axios');
const { calculateImpactPhysics, calculatePopulationImpact } = require('./physics');
const { getPopulationDensity } = require('./utils');

// CORS headers
const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
};

// Get location name from OpenStreetMap
async function getLocationName(lat, lon) {
    try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const response = await axios.get(
            `https://nominatim.openstreetmap.org/reverse`,
            {
                params: {
                    format: 'json',
                    lat,
                    lon,
                    zoom: 10,
                    addressdetails: 1,
                    'accept-language': 'en'
                },
                headers: {
                    'User-Agent': 'MeteorMadnessSimulator/1.0 (NASA Space Apps Challenge 2025)'
                },
                timeout: 5000
            }
        );
        
        const data = response.data;
        let locationName;
        
        if (data.address) {
            const addr = data.address;
            
            if (addr.body_of_water) locationName = addr.body_of_water;
            else if (addr.ocean) locationName = addr.ocean;
            else if (addr.sea) locationName = addr.sea;
            else if (addr.city) locationName = `${addr.city}, ${addr.country || ''}`.trim();
            else if (addr.town) locationName = `${addr.town}, ${addr.country || ''}`.trim();
            else if (addr.village) locationName = `${addr.village}, ${addr.country || ''}`.trim();
            else if (addr.state) locationName = `${addr.state}, ${addr.country || ''}`.trim();
            else if (addr.country) locationName = addr.country;
            else locationName = `${lat.toFixed(2)}°${lat >= 0 ? 'N' : 'S'}, ${Math.abs(lon).toFixed(2)}°${lon >= 0 ? 'E' : 'W'}`;
        } else {
            locationName = `${lat.toFixed(2)}°${lat >= 0 ? 'N' : 'S'}, ${Math.abs(lon).toFixed(2)}°${lon >= 0 ? 'E' : 'W'}`;
        }
        
        return locationName;
    } catch (error) {
        return `${lat.toFixed(2)}°${lat >= 0 ? 'N' : 'S'}, ${Math.abs(lon).toFixed(2)}°${lon >= 0 ? 'E' : 'W'}`;
    }
}

exports.handler = async (event) => {
    // Handle preflight
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const { diameter, velocity, angle, density, lat, lon } = JSON.parse(event.body);

        // Validate parameters
        if (!diameter || !velocity || !angle || !density || lat === undefined || lon === undefined) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Missing required parameters' })
            };
        }

        // Get location name
        const locationName = await getLocationName(lat, lon);

        // Get population density
        const worldPopDensity = getPopulationDensity(lat, lon);
        
        // Calculate impact
        const results = calculateImpactPhysics(diameter, velocity, angle, density, lat, lon);
        
        // Calculate population impact
        const populationImpact = calculatePopulationImpact(
            lat, lon,
            parseFloat(results.craterRadius),
            parseFloat(results.airBlastRadius),
            parseFloat(results.moderateDamageRadius),
            parseFloat(results.fireballRadius),
            parseFloat(results.thermal3rdDegreeRadius),
            parseFloat(results.thermal2ndDegreeRadius),
            parseFloat(results.lungDamageRadius),
            parseFloat(results.eardrumsRuptureRadius),
            parseFloat(results.seismicFeltRadius),
            worldPopDensity
        );
        
        results.populationImpact = populationImpact;
        results.locationName = locationName;

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(results)
        };
    } catch (error) {
        console.error('Impact calculation error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                error: 'Failed to calculate impact',
                message: error.message 
            })
        };
    }
};
