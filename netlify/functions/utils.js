// Shared utility functions for Netlify Functions
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// World population data cache
let worldPopulationData = [];
let populationDataLoaded = false;

// Load world population data from CSV
async function loadWorldPopulationData() {
    if (populationDataLoaded) return;
    
    return new Promise((resolve, reject) => {
        const csvPath = path.join(__dirname, '..', '..', 'public', 'images', 'world_population.csv');
        
        fs.createReadStream(csvPath)
            .pipe(csv())
            .on('data', (row) => {
                worldPopulationData.push({
                    lat: parseFloat(row.lat),
                    lon: parseFloat(row.lng),
                    population: parseFloat(row.pop)
                });
            })
            .on('end', () => {
                populationDataLoaded = true;
                console.log(`✅ Loaded ${worldPopulationData.length} population data points`);
                resolve();
            })
            .on('error', (error) => {
                console.error('❌ Error loading population data:', error.message);
                reject(error);
            });
    });
}

// Get population density from CSV data
function getPopulationDensity(lat, lon) {
    if (!populationDataLoaded || worldPopulationData.length === 0) {
        return null;
    }
    
    const searchRadius = 2.0;
    let nearestPoints = [];
    
    for (const point of worldPopulationData) {
        const latDiff = lat - point.lat;
        const lonDiff = lon - point.lon;
        const distance = Math.sqrt(latDiff * latDiff + lonDiff * lonDiff);
        
        if (distance <= searchRadius) {
            nearestPoints.push({ ...point, distance });
        }
        
        if (nearestPoints.length >= 50) break;
    }
    
    if (nearestPoints.length === 0) {
        return 0; // Ocean
    }
    
    let totalWeight = 0;
    let weightedPopulation = 0;
    
    for (const point of nearestPoints) {
        const weight = 1 / (point.distance + 0.01);
        const density = point.population;
        weightedPopulation += density * weight;
        totalWeight += weight;
    }
    
    return totalWeight > 0 ? weightedPopulation / totalWeight : 0;
}

// Initialize population data
loadWorldPopulationData().catch(err => {
    console.error('Failed to load population data');
});

module.exports = {
    getPopulationDensity,
    loadWorldPopulationData
};
