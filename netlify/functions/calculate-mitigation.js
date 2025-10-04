// CORS headers
const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
};

function calculateMitigation(asteroidParams, mitigationType, warningTime, velocityChange) {
    const { diameter, velocity, lat, lon } = asteroidParams;
    
    const timeSeconds = warningTime * 365.25 * 24 * 3600;
    const velocityChangeMs = velocityChange / 100;
    const deflectionDistance = velocityChangeMs * timeSeconds / 1000;
    
    const earthRadius = 6371;
    const latRad = (lat * Math.PI) / 180;
    
    const deltaLat = (deflectionDistance / earthRadius) * (180 / Math.PI);
    
    let newLat = lat + deltaLat;
    let newLon = lon;
    
    const isMiss = deflectionDistance > earthRadius * 0.02;
    
    let successProbability = 0;
    
    switch(mitigationType) {
        case 'kinetic':
            successProbability = Math.min(95, (warningTime / diameter) * 1000 * velocityChange * 10);
            break;
        case 'gravity':
            successProbability = Math.min(90, (warningTime / diameter) * 800 * velocityChange * 8);
            break;
        case 'nuclear':
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
        const { asteroidParams, mitigationType, warningTime, velocityChange } = JSON.parse(event.body);

        // Validate parameters
        if (!asteroidParams || !mitigationType || !warningTime || !velocityChange) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Missing required parameters' })
            };
        }

        const results = calculateMitigation(asteroidParams, mitigationType, warningTime, velocityChange);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(results)
        };
    } catch (error) {
        console.error('Mitigation calculation error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                error: 'Failed to calculate mitigation',
                message: error.message 
            })
        };
    }
};
