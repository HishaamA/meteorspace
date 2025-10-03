// Main application entry point

document.addEventListener('DOMContentLoaded', () => {
    console.log('🌍 Meteor Madness Simulator initializing...');
    
    // Initialize modules
    try {
        // Initialize 3D visualization
        Visualization3D.init();
        console.log('✓ 3D Visualization initialized');
        
        // Initialize 2D map
        Visualization2D.init();
        console.log('✓ 2D Map initialized');
        
        // Initialize UI controls
        UI.init();
        console.log('✓ UI Controls initialized');
        
        // Set initial impact location markers
        const latInput = document.getElementById('latitude-input');
        const lonInput = document.getElementById('longitude-input');
        const defaultLat = latInput ? parseFloat(latInput.value) || 0 : 0;
        const defaultLon = lonInput ? parseFloat(lonInput.value) || 0 : 0;
        
        // Sync legacy inputs with location picker values
        const legacyLatInput = document.getElementById('lat');
        const legacyLonInput = document.getElementById('lon');
        if (legacyLatInput) legacyLatInput.value = defaultLat.toFixed(4);
        if (legacyLonInput) legacyLonInput.value = defaultLon.toFixed(4);
        
        // Place markers on both 3D and 2D visualizations
        Visualization3D.placeLocationMarker(defaultLat, defaultLon);
        Visualization2D.updateImpactLocation(defaultLat, defaultLon);
        
        console.log('🚀 Application ready!');
        console.log('━'.repeat(50));
        console.log('NASA Space Apps Challenge 2025');
        console.log('Asteroid Impact Simulator');
        console.log('━'.repeat(50));
        
    } catch (error) {
        console.error('❌ Initialization error:', error);
        alert('Failed to initialize application. Please refresh the page.');
    }
});



/**
 * Handle keyboard shortcuts
 */
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Enter to run simulation
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        document.getElementById('simulate-btn').click();
    }
    
    // Escape to reset
    if (e.key === 'Escape') {
        Visualization2D.reset();
    }
});

/**
 * Handle visibility change to pause/resume animations
 */
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        console.log('Tab hidden - pausing animations');
    } else {
        console.log('Tab visible - resuming animations');
    }
});

/**
 * Cleanup on page unload
 */
window.addEventListener('beforeunload', () => {
    if (Visualization3D) {
        Visualization3D.dispose();
    }
});

/**
 * Error handling
 */
window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
    // Could send to error tracking service
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
    // Could send to error tracking service
});

// Export for external access if needed
window.MeteorMadness = {
    version: '1.0.0',
    Physics,
    Visualization3D,
    Visualization2D,
    API,
    UI
};

console.log('Main application script loaded');
