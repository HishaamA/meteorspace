// Physics calculations for asteroid impact
function calculateImpactPhysics(diameter, velocity, angle, density, lat, lon) {
    const radius = diameter / 2;
    const velocityMs = velocity * 1000;
    const velocityKmh = velocity * 3600;
    const velocityMph = velocity * 2236.94;
    const angleRad = (angle * Math.PI) / 180;
    
    const volume = (4 / 3) * Math.PI * Math.pow(radius, 3);
    const mass = volume * density;
    
    const kineticEnergy = 0.5 * mass * Math.pow(velocityMs, 2);
    const energyMegatons = kineticEnergy / 4.184e15;
    const energyGigatons = energyMegatons / 1000;
    
    const targetDensity = 2500;
    const soundSpeed = 5000;
    const craterDiameter = 1.8 * diameter * 
        Math.pow(density / targetDensity, 1/3) * 
        Math.pow(velocityMs / soundSpeed, 0.44) / 
        Math.pow(Math.sin(angleRad), 1/3);
    
    const craterDepth = craterDiameter / 3;
    const craterRadius = craterDiameter / 2;
    
    const seismicMagnitude = 0.67 * Math.log10(kineticEnergy) - 5.87;
    const seismicFeltRadius = Math.pow(10, seismicMagnitude / 2) * 0.5;
    
    const fireballDiameter = 0.56 * Math.pow(energyMegatons, 0.33);
    const fireballRadius = fireballDiameter / 2;
    
    const thermalIgnitionRadius = 0.38 * Math.pow(energyMegatons, 0.41);
    const thermal3rdDegreeRadius = 0.32 * Math.pow(energyMegatons, 0.38);
    const thermal2ndDegreeRadius = 0.46 * Math.pow(energyMegatons, 0.40);
    
    const airBlastRadius = 0.22 * Math.pow(energyMegatons, 0.33);
    const moderateDamageRadius = 0.54 * Math.pow(energyMegatons, 0.33);
    const lightDamageRadius = 1.04 * Math.pow(energyMegatons, 0.33);
    
    const windSpeed20psi = 470;
    const ef5TornadoZone = airBlastRadius;
    const treesBlownRadius = moderateDamageRadius;
    const jupiterStormZone = airBlastRadius * 0.8;
    
    const maxDecibels = 200 + 20 * Math.log10(energyMegatons);
    const lungDamageRadius = airBlastRadius * 1.2;
    const eardrumsRuptureRadius = moderateDamageRadius;
    
    const totalCollapseRadius = airBlastRadius;
    const homeDestructionRadius = moderateDamageRadius * 1.3;
    const affectedArea = Math.PI * Math.pow(moderateDamageRadius, 2);
    
    let impactFrequency;
    if (diameter < 50) impactFrequency = "every 10-100 years";
    else if (diameter < 100) impactFrequency = "every 100-1,000 years";
    else if (diameter < 300) impactFrequency = "every 1,000-10,000 years";
    else if (diameter < 1000) impactFrequency = "every 10,000-100,000 years";
    else impactFrequency = "every 100,000+ years";
    
    const tsarBombaEquivalent = energyMegatons / 50;
    const hiroshimaEquivalent = energyMegatons / 0.015;
    const hurricaneEnergyComparison = energyMegatons > 60;
    
    const isOcean = Math.abs(lat) < 60;
    const tsunamiRisk = isOcean && diameter > 200 ? 
        'HIGH - Capable of generating destructive tsunamis' : 
        isOcean && diameter > 50 ? 
        'MODERATE - May generate local tsunamis' : 
        'LOW';
    
    return {
        energy: energyMegatons.toFixed(2),
        energyGigatons: energyGigatons.toFixed(4),
        impactVelocityKmh: velocityKmh.toFixed(0),
        impactVelocityMph: velocityMph.toFixed(0),
        impactFrequency,
        tsarBombaEquivalent: tsarBombaEquivalent.toFixed(1),
        hiroshimaEquivalent: hiroshimaEquivalent.toFixed(0),
        hurricaneComparison: hurricaneEnergyComparison,
        craterDiameter: (craterDiameter / 1000).toFixed(2),
        craterDepth: (craterDepth / 1000).toFixed(3),
        craterRadius: (craterRadius / 1000).toFixed(2),
        fireballDiameter: fireballDiameter.toFixed(2),
        fireballRadius: fireballRadius.toFixed(2),
        thermalIgnitionRadius: thermalIgnitionRadius.toFixed(2),
        thermal3rdDegreeRadius: thermal3rdDegreeRadius.toFixed(2),
        thermal2ndDegreeRadius: thermal2ndDegreeRadius.toFixed(2),
        maxDecibels: Math.min(maxDecibels, 250).toFixed(0),
        lungDamageRadius: lungDamageRadius.toFixed(2),
        eardrumsRuptureRadius: eardrumsRuptureRadius.toFixed(2),
        airBlastRadius: airBlastRadius.toFixed(2),
        moderateDamageRadius: moderateDamageRadius.toFixed(2),
        lightDamageRadius: lightDamageRadius.toFixed(2),
        peakWindSpeedMph: windSpeed20psi.toFixed(0),
        peakWindSpeedKmh: (windSpeed20psi * 1.60934).toFixed(0),
        ef5TornadoZone: ef5TornadoZone.toFixed(2),
        treesBlownRadius: treesBlownRadius.toFixed(2),
        jupiterStormZone: jupiterStormZone.toFixed(2),
        totalCollapseRadius: totalCollapseRadius.toFixed(2),
        homeDestructionRadius: homeDestructionRadius.toFixed(2),
        severeStructuralDamageRadius: moderateDamageRadius.toFixed(2),
        seismicMagnitude: seismicMagnitude.toFixed(1),
        seismicFeltRadius: seismicFeltRadius.toFixed(0),
        affectedArea: affectedArea.toFixed(0),
        tsunamiRisk,
        populationImpact: null,
        impactLocation: { lat, lon },
        zones: {
            crater: craterRadius / 1000,
            severe: airBlastRadius,
            moderate: moderateDamageRadius
        }
    };
}

function calculatePopulationImpact(
    lat, lon, craterRadius, severeRadius, moderateRadius,
    fireballRadius, thermal3rdRadius, thermal2ndRadius,
    lungDamageRadius, eardrumsRadius, seismicRadius, sedacDensity = null
) {
    let populationDensity, locationCategory, dataSource;
    
    if (sedacDensity !== null) {
        populationDensity = sedacDensity;
        dataSource = 'World Population CSV Data';
        
        if (populationDensity === 0) locationCategory = 'Unpopulated/Ocean';
        else if (populationDensity < 1) locationCategory = 'Remote/Wilderness';
        else if (populationDensity < 10) locationCategory = 'Rural Area';
        else if (populationDensity < 100) locationCategory = 'Suburban Area';
        else if (populationDensity < 1000) locationCategory = 'Urban Area';
        else locationCategory = 'Dense Urban Area';
    } else {
        dataSource = 'Geographic Estimation';
        const absLat = Math.abs(lat);
        
        if ((absLat < 60 && ((lon > -180 && lon < -140) || (lon > -60 && lon < 20) || (lon > 40 && lon < 140))) && absLat < 40) {
            populationDensity = 0.5;
            locationCategory = 'Ocean/Remote';
        } else if (absLat > 60) {
            populationDensity = 1;
            locationCategory = 'Polar Region';
        } else if ((lat > 20 && lat < 50 && lon > -130 && lon < -60) || (lat > 35 && lat < 65 && lon > -10 && lon < 40) || (lat > 20 && lat < 45 && lon > 70 && lon < 145) || (lat > -35 && lat < -10 && lon > -60 && lon < -35)) {
            populationDensity = 150;
            locationCategory = 'Populated Region';
        } else {
            populationDensity = 25;
            locationCategory = 'Rural Area';
        }
    }
    
    const craterArea = Math.PI * Math.pow(craterRadius, 2);
    const severeArea = Math.PI * Math.pow(severeRadius, 2) - craterArea;
    const moderateArea = Math.PI * Math.pow(moderateRadius, 2) - Math.PI * Math.pow(severeRadius, 2);
    
    const isOceanImpact = locationCategory === 'Ocean/Remote' || locationCategory === 'Polar Region';
    const thermalReductionFactor = isOceanImpact ? 0.05 : 1.0;
    const blastReductionFactor = isOceanImpact ? 0.1 : 1.0;
    
    const craterFatalities = Math.round(craterArea * populationDensity * 1.0);
    const fireballDeaths = Math.round(Math.PI * Math.pow(fireballRadius, 2) * populationDensity * 0.95 * thermalReductionFactor);
    const severeFatalities = Math.round(severeArea * populationDensity * 0.7 * blastReductionFactor);
    const moderateFatalities = Math.round(moderateArea * populationDensity * 0.3 * blastReductionFactor);
    
    const shockWaveDeaths = Math.round(severeArea * populationDensity * 0.6 * blastReductionFactor);
    const windBlastDeaths = Math.round(severeArea * populationDensity * 0.65 * blastReductionFactor);
    const seismicDeaths = Math.round(Math.PI * Math.pow(seismicRadius, 2) * populationDensity * 0.01);
    
    const burns3rdDegree = Math.round(Math.PI * Math.pow(thermal3rdRadius, 2) * populationDensity * 0.6 * thermalReductionFactor);
    const burns2ndDegree = Math.round(Math.PI * Math.pow(thermal2ndRadius, 2) * populationDensity * 0.4 * thermalReductionFactor);
    
    const totalFatalities = Math.round(craterFatalities + severeFatalities + moderateFatalities);
    const totalAtRisk = Math.round(Math.PI * Math.pow(moderateRadius, 2) * populationDensity);
    const injured = Math.round((totalAtRisk - totalFatalities) * 0.5);
    
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
        dataSource,
        severity,
        craterVaporized: craterFatalities,
        groundZeroFatalityRate: 100,
        fireballDeaths,
        burns3rdDegree,
        burns2ndDegree,
        shockWaveDeaths,
        windBlastDeaths,
        seismicDeaths
    };
}

module.exports = {
    calculateImpactPhysics,
    calculatePopulationImpact
};
