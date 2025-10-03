// API communication module

const API = {
    baseURL: window.location.origin,
    
    /**
     * Fetch NEO data from NASA
     */
    async fetchNEO(id = null) {
        try {
            const url = id ? 
                `${this.baseURL}/api/neo?id=${id}` : 
                `${this.baseURL}/api/neo`;
            
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching NEO data:', error);
            throw error;
        }
    },
    
    /**
     * Browse available NEOs
     */
    async browseNEOs() {
        try {
            const response = await fetch(`${this.baseURL}/api/neo/browse`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error browsing NEOs:', error);
            throw error;
        }
    },
    
    /**
     * Calculate impact scenario
     */
    async calculateImpact(params) {
        try {
            const response = await fetch(`${this.baseURL}/api/calculate-impact`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(params)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error calculating impact:', error);
            throw error;
        }
    },
    
    /**
     * Calculate mitigation scenario
     */
    async calculateMitigation(params) {
        try {
            const response = await fetch(`${this.baseURL}/api/calculate-mitigation`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(params)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error calculating mitigation:', error);
            throw error;
        }
    }
};

// Make available globally
window.API = API;
