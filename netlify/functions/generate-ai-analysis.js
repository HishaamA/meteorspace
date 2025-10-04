const { GoogleGenerativeAI } = require('@google/generative-ai');

// CORS headers
const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
};

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
        const { impactData, asteroidParams } = JSON.parse(event.body);

        // Validate data
        if (!impactData || !impactData.populationImpact) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ 
                    error: 'Invalid data',
                    message: 'Impact data is missing. Please calculate impact first.' 
                })
            };
        }

        // Initialize Gemini
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

        // Create prompt
        const prompt = `You are an expert planetary defense strategist analyzing an asteroid impact scenario. Provide a detailed strategic analysis in a clear, structured format.

**ASTEROID PARAMETERS:**
- Diameter: ${asteroidParams.diameter}m
- Velocity: ${asteroidParams.velocity} km/s
- Impact Angle: ${asteroidParams.angle}°
- Density: ${asteroidParams.density} kg/m³
- Location: ${impactData.locationName} (${asteroidParams.lat}°, ${asteroidParams.lon}°)

**IMPACT EFFECTS:**
- Energy: ${impactData.energy} MT (${impactData.energyGigatons} GT)
- Crater: ${impactData.craterDiameter} km diameter, ${impactData.craterDepth} km deep
- Seismic Magnitude: ${impactData.seismicMagnitude}
- Fireball Radius: ${impactData.fireballRadius} km
- Air Blast Radius: ${impactData.airBlastRadius} km (20 psi)
- Moderate Damage: ${impactData.moderateDamageRadius} km (5 psi)
- Peak Wind Speed: ${impactData.peakWindSpeedMph} mph

**POPULATION IMPACT:**
- Location Type: ${impactData.populationImpact.locationCategory}
- Population Density: ${impactData.populationImpact.populationDensity} people/km²
- At Risk: ${impactData.populationImpact.totalAtRisk} people
- Estimated Fatalities: ${impactData.populationImpact.estimatedFatalities}
- Estimated Injured: ${impactData.populationImpact.estimatedInjured}
- Severity: ${impactData.populationImpact.severity}

**PROVIDE THE FOLLOWING ANALYSIS:**

1. **EXECUTIVE SUMMARY** (2-3 sentences)
   - Brief overview of threat level and immediate concerns

2. **THREAT ASSESSMENT** (4-5 bullet points)
   - Scale and severity analysis
   - Most dangerous impact effects
   - Timeline considerations

3. **MULTI-POINT ACTION PLAN** (6-8 priority actions, numbered)
   - Immediate response (0-24 hours)
   - Short-term actions (1-7 days)
   - Medium-term recovery (1-3 months)

4. **MITIGATION STRATEGY COMPARISON**
   - Pre-Impact vs Post-Impact options
   - Recommend best approach

5. **RISK FACTORS** (3-4 key concerns)

6. **RESOURCE REQUIREMENTS**
   - Emergency services needed
   - Estimated economic impact

Format with clear markdown headings (##) and bullet points.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const analysis = response.text();

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ 
                analysis,
                model: 'gemini-2.0-flash-exp',
                timestamp: new Date().toISOString()
            })
        };
    } catch (error) {
        console.error('AI Analysis Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                error: 'Failed to generate AI analysis',
                message: error.message 
            })
        };
    }
};
