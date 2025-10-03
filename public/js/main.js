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
        
        // Set initial impact location marker
        const defaultLat = parseFloat(document.getElementById('lat').value);
        const defaultLon = parseFloat(document.getElementById('lon').value);
        Visualization2D.updateImpactLocation(defaultLat, defaultLon);
        
        console.log('🚀 Application ready!');
        console.log('━'.repeat(50));
        console.log('NASA Space Apps Challenge 2025');
        console.log('Meteor Madness Simulator');
        console.log('━'.repeat(50));
        
        // Show welcome message
        showWelcomeMessage();
        
    } catch (error) {
        console.error('❌ Initialization error:', error);
        alert('Failed to initialize application. Please refresh the page.');
    }
});

/**
 * Show welcome message and instructions
 */
function showWelcomeMessage() {
    // Check if user has seen welcome before
    if (localStorage.getItem('welcomeShown')) {
        return;
    }
    
    const welcomeHTML = `
        <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                    background: var(--secondary-bg); padding: 2rem; border-radius: 12px; 
                    box-shadow: 0 8px 32px rgba(0,0,0,0.5); z-index: 10000; max-width: 500px;
                    border: 2px solid var(--accent-blue);">
            <h2 style="margin-bottom: 1rem; color: var(--accent-orange);">
                🌍 Welcome to Meteor Madness Simulator!
            </h2>
            <p style="margin-bottom: 1rem; line-height: 1.6;">
                Explore the science of asteroid impacts and planetary defense:
            </p>
            <ul style="margin-bottom: 1.5rem; line-height: 1.8; padding-left: 1.5rem;">
                <li>Adjust asteroid parameters using the control panel</li>
                <li>Click on the map to select an impact location</li>
                <li>Run simulations to see impact effects</li>
                <li>Test mitigation strategies to defend Earth</li>
                <li>Hover over ℹ️ icons for educational information</li>
            </ul>
            <button onclick="closeWelcome()" style="width: 100%; padding: 0.8rem; 
                    background: linear-gradient(135deg, var(--accent-blue), #3d7fd9);
                    border: none; border-radius: 8px; color: white; font-weight: 600;
                    cursor: pointer; font-size: 1rem;">
                Let's Get Started! 🚀
            </button>
        </div>
        <div id="welcome-overlay" style="position: fixed; top: 0; left: 0; width: 100%; 
                height: 100%; background: rgba(0,0,0,0.8); z-index: 9999;"></div>
    `;
    
    const container = document.createElement('div');
    container.id = 'welcome-container';
    container.innerHTML = welcomeHTML;
    document.body.appendChild(container);
    
    // Add close function to window
    window.closeWelcome = () => {
        document.getElementById('welcome-container').remove();
        localStorage.setItem('welcomeShown', 'true');
    };
}

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
