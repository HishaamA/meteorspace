// 3D Visualization using Three.js

const Visualization3D = {
    scene: null,
    camera: null,
    renderer: null,
    controls: null,
    earth: null,
    asteroid: null,
    orbit: null,
    trajectoryLine: null,
    animationId: null,
    locationMarker: null,
    raycaster: null,
    mouse: null,
    locationPickerActive: false,
    onLocationSelected: null,
    
    /**
     * Initialize 3D scene
     */
    init() {
        const container = document.getElementById('trajectory-canvas');
        const width = container.clientWidth;
        const height = container.clientHeight;
        
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000000);
        
        // Create camera
        this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 10000);
        this.camera.position.set(0, 200, 400);
        
        // Create renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(width, height);
        container.appendChild(this.renderer.domElement);
        
        // Add orbit controls
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = 80;
        this.controls.maxDistance = 1500;
        
        // Add lights
        const ambientLight = new THREE.AmbientLight(0x404040, 1);
        this.scene.add(ambientLight);
        
        const sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
        sunLight.position.set(200, 50, 100);
        this.scene.add(sunLight);
        
        const fillLight = new THREE.DirectionalLight(0x4a9eff, 0.3);
        fillLight.position.set(-100, 0, -100);
        this.scene.add(fillLight);
        
        // Create Earth
        this.createEarth();
        
        // Create starfield
        this.createStarfield();
        
        // Add grid
        const gridHelper = new THREE.GridHelper(500, 25, 0x2a3555, 0x1a1f3a);
        gridHelper.position.y = -100;
        this.scene.add(gridHelper);
        
        // Initialize raycaster for location picking
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        
        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());
        
        // Add click event listener for location picking
        this.renderer.domElement.addEventListener('click', (event) => this.onCanvasClick(event));
        
        // Start animation loop
        this.animate();
        
        console.log('3D Visualization initialized');
    },
    
    /**
     * Create Earth sphere with NASA Blue Marble texture
     */
    createEarth() {
        // Earth radius in scene units (represents ~6371 km)
        this.earthRadius = 63.71; // Using 1 unit = 100 km for scale
        const geometry = new THREE.SphereGeometry(this.earthRadius, 64, 64);
        
        // Load NASA Blue Marble Earth texture
        const textureLoader = new THREE.TextureLoader();
        const earthTexture = textureLoader.load('/images/earth-blue-marble.jpg');
        
        // Create Earth material with texture
        const material = new THREE.MeshPhongMaterial({
            map: earthTexture,
            specular: 0x333333,
            shininess: 25,
            bumpScale: 0.5
        });
        
        this.earth = new THREE.Mesh(geometry, material);
        this.scene.add(this.earth);
        
        // Add atmosphere glow
        const atmosphereGeometry = new THREE.SphereGeometry(this.earthRadius * 1.03, 64, 64);
        const atmosphereMaterial = new THREE.MeshBasicMaterial({
            color: 0x4a9eff,
            transparent: true,
            opacity: 0.15,
            side: THREE.BackSide
        });
        const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
        this.earth.add(atmosphere);
    },
    
    /**
     * Create starfield background
     */
    createStarfield() {
        const starGeometry = new THREE.BufferGeometry();
        const starMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 1,
            transparent: true,
            opacity: 0.8
        });
        
        const starVertices = [];
        for (let i = 0; i < 5000; i++) {
            const x = (Math.random() - 0.5) * 2000;
            const y = (Math.random() - 0.5) * 2000;
            const z = (Math.random() - 0.5) * 2000;
            starVertices.push(x, y, z);
        }
        
        starGeometry.setAttribute('position', 
            new THREE.Float32BufferAttribute(starVertices, 3));
        
        const stars = new THREE.Points(starGeometry, starMaterial);
        this.scene.add(stars);
    },
    
    /**
     * Create and visualize asteroid
     */
    createAsteroid(diameter, position) {
        // Remove existing asteroid
        if (this.asteroid) {
            this.scene.remove(this.asteroid);
        }
        
        // Scale: diameter in meters, convert to km, then to scene units (1 unit = 100 km)
        // But exaggerate by 50x for visibility (asteroids would be invisible at true scale)
        const scaleToEarth = (diameter / 1000) / 100; // Convert m to km to scene units
        const exaggeration = 50; // Make asteroid visible
        const visualSize = Math.max(0.5, scaleToEarth * exaggeration);
        
        const geometry = new THREE.SphereGeometry(visualSize, 16, 16);
        const material = new THREE.MeshPhongMaterial({
            color: 0xff6600,
            emissive: 0x331100,
            roughness: 0.9
        });
        
        this.asteroid = new THREE.Mesh(geometry, material);
        this.asteroid.position.set(position.x, position.y, position.z);
        this.scene.add(this.asteroid);
        
        // Add glow effect
        const glowGeometry = new THREE.SphereGeometry(visualSize * 1.2, 16, 16);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0xff9900,
            transparent: true,
            opacity: 0.3
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        this.asteroid.add(glow);
        
        return this.asteroid;
    },
    
    /**
     * Draw orbital trajectory
     */
    drawOrbit(orbitPoints) {
        // Remove existing orbit line
        if (this.orbit) {
            this.scene.remove(this.orbit);
        }
        
        const points = orbitPoints.map(p => 
            new THREE.Vector3(p.x, p.y, p.z)
        );
        
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({
            color: 0xff9f40,
            linewidth: 2,
            transparent: true,
            opacity: 0.6
        });
        
        this.orbit = new THREE.Line(geometry, material);
        this.scene.add(this.orbit);
    },
    
    /**
     * Draw impact trajectory from asteroid to Earth
     */
    drawTrajectory(asteroidPos, impactPos) {
        // Remove existing trajectory
        if (this.trajectoryLine) {
            this.scene.remove(this.trajectoryLine);
        }
        
        const points = [
            new THREE.Vector3(asteroidPos.x, asteroidPos.y, asteroidPos.z),
            new THREE.Vector3(impactPos.x, impactPos.y, impactPos.z)
        ];
        
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineDashedMaterial({
            color: 0xff0000,
            linewidth: 2,
            dashSize: 3,
            gapSize: 1
        });
        
        this.trajectoryLine = new THREE.Line(geometry, material);
        this.trajectoryLine.computeLineDistances();
        this.scene.add(this.trajectoryLine);
    },
    
    /**
     * Add impact point marker on Earth
     */
    addImpactMarker(lat, lon) {
        // Remove existing markers
        const existingMarkers = this.earth.children.filter(
            child => child.userData.isImpactMarker
        );
        existingMarkers.forEach(marker => this.earth.remove(marker));
        
        const earthRadius = this.earthRadius || 63.71;
        const pos = Physics.latLonToCartesian(lat, lon, earthRadius * 1.01);
        
        // Create marker
        const geometry = new THREE.SphereGeometry(2, 16, 16);
        const material = new THREE.MeshBasicMaterial({
            color: 0xff0000,
            emissive: 0xff0000
        });
        const marker = new THREE.Mesh(geometry, material);
        marker.position.set(pos.x, pos.y, pos.z);
        marker.userData.isImpactMarker = true;
        
        this.earth.add(marker);
        
        // Add pulsing animation
        marker.userData.pulse = 0;
        
        return marker;
    },
    
    /**
     * Animate impact sequence
     */
    animateImpact(asteroidStartPos, impactPos, duration = 3000) {
        if (!this.asteroid) return;
        
        const startTime = Date.now();
        const start = new THREE.Vector3(
            asteroidStartPos.x,
            asteroidStartPos.y,
            asteroidStartPos.z
        );
        const end = new THREE.Vector3(
            impactPos.x,
            impactPos.y,
            impactPos.z
        );
        
        const animateStep = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Interpolate position
            this.asteroid.position.lerpVectors(start, end, progress);
            
            // Rotate asteroid
            this.asteroid.rotation.x += 0.01;
            this.asteroid.rotation.y += 0.02;
            
            if (progress < 1) {
                requestAnimationFrame(animateStep);
            } else {
                // Impact effect
                this.createImpactEffect(impactPos);
            }
        };
        
        animateStep();
    },
    
    /**
     * Create visual impact effect
     */
    createImpactEffect(position) {
        const geometry = new THREE.SphereGeometry(1, 16, 16);
        const material = new THREE.MeshBasicMaterial({
            color: 0xff6600,
            transparent: true,
            opacity: 1
        });
        
        const explosion = new THREE.Mesh(geometry, material);
        explosion.position.set(position.x, position.y, position.z);
        this.scene.add(explosion);
        
        // Animate explosion
        let scale = 1;
        const expandExplosion = () => {
            scale += 0.3;
            explosion.scale.set(scale, scale, scale);
            explosion.material.opacity -= 0.02;
            
            if (explosion.material.opacity > 0) {
                requestAnimationFrame(expandExplosion);
            } else {
                this.scene.remove(explosion);
            }
        };
        
        expandExplosion();
    },
    
    /**
     * Animation loop
     */
    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());
        
        // Pulse markers (both impact and location markers)
        this.earth?.children.forEach(child => {
            if (child.userData.isImpactMarker || child.userData.isLocationMarker) {
                child.userData.pulse += 0.05;
                const scale = 1 + Math.sin(child.userData.pulse) * 0.2;
                child.scale.set(scale, scale, scale);
            }
        });
        
        // Update controls
        this.controls.update();
        
        // Render scene
        this.renderer.render(this.scene, this.camera);
    },
    
    /**
     * Handle canvas click for location picking
     */
    onCanvasClick(event) {
        if (!this.locationPickerActive) return;
        
        const container = document.getElementById('trajectory-canvas');
        const rect = container.getBoundingClientRect();
        
        // Calculate mouse position in normalized device coordinates (-1 to +1)
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        // Update raycaster
        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        // Check for intersection with Earth
        const intersects = this.raycaster.intersectObject(this.earth);
        
        if (intersects.length > 0) {
            const point = intersects[0].point;
            
            // Convert 3D point to latitude/longitude
            const latLon = this.cartesianToLatLon(point);
            
            // Place marker at the location
            this.placeLocationMarker(latLon.lat, latLon.lon);
            
            // Call callback if provided
            if (this.onLocationSelected) {
                this.onLocationSelected(latLon.lat, latLon.lon);
            }
            
            console.log(`Location selected: ${latLon.lat.toFixed(2)}°, ${latLon.lon.toFixed(2)}°`);
        }
    },
    
    /**
     * Convert 3D Cartesian coordinates to latitude/longitude
     */
    cartesianToLatLon(point) {
        const radius = this.earthRadius || 63.71;
        const x = point.x;
        const y = point.y;
        const z = point.z;
        
        // Calculate latitude and longitude
        const lat = Math.asin(y / radius) * (180 / Math.PI);
        const lon = Math.atan2(z, x) * (180 / Math.PI);
        
        return { lat, lon };
    },
    
    /**
     * Place a marker on the globe at the specified location
     */
    placeLocationMarker(lat, lon) {
        console.log(`3D: Placing marker at Lat ${lat}°, Lon ${lon}°`);
        
        // Remove existing marker if any
        if (this.locationMarker) {
            this.earth.remove(this.locationMarker);
        }
        
        // Create marker geometry (pin shape)
        const markerGroup = new THREE.Group();
        
        // Pin head (sphere)
        const headGeometry = new THREE.SphereGeometry(2, 16, 16);
        const headMaterial = new THREE.MeshBasicMaterial({
            color: 0xff3333,
            emissive: 0xff0000,
            emissiveIntensity: 0.5
        });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.z = 3;
        markerGroup.add(head);
        
        // Pin stick (cylinder)
        const stickGeometry = new THREE.CylinderGeometry(0.3, 0.5, 3, 8);
        const stickMaterial = new THREE.MeshBasicMaterial({ color: 0xff3333 });
        const stick = new THREE.Mesh(stickGeometry, stickMaterial);
        stick.position.z = 1.5;
        markerGroup.add(stick);
        
        // Glow ring
        const ringGeometry = new THREE.RingGeometry(2, 3, 32);
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: 0xff3333,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.x = Math.PI / 2;
        markerGroup.add(ring);
        
        // Position marker on Earth surface
        const earthRadius = this.earthRadius || 63.71;
        const pos = Physics.latLonToCartesian(lat, lon, earthRadius);
        console.log(`3D: Converted to position: x=${pos.x.toFixed(2)}, y=${pos.z.toFixed(2)}, z=${pos.y.toFixed(2)}`);
        markerGroup.position.set(pos.x, pos.z, pos.y);
        
        // Orient marker to point outward from Earth center
        markerGroup.lookAt(0, 0, 0);
        markerGroup.rotateX(Math.PI);
        
        // Add pulsing animation data
        markerGroup.userData.isLocationMarker = true;
        markerGroup.userData.pulse = 0;
        
        this.locationMarker = markerGroup;
        this.earth.add(this.locationMarker);
    },
    
    /**
     * Enable or disable location picker mode
     */
    setLocationPickerMode(active) {
        this.locationPickerActive = active;
        
        if (active) {
            this.renderer.domElement.style.cursor = 'crosshair';
        } else {
            this.renderer.domElement.style.cursor = 'default';
        }
    },
    
    /**
     * Set callback for when a location is selected
     */
    setLocationCallback(callback) {
        this.onLocationSelected = callback;
    },
    
    /**
     * Handle window resize
     */
    onWindowResize() {
        const container = document.getElementById('trajectory-canvas');
        const width = container.clientWidth;
        const height = container.clientHeight;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    },
    
    /**
     * Clean up
     */
    dispose() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        if (this.renderer) {
            this.renderer.dispose();
        }
    }
};

// Make available globally
window.Visualization3D = Visualization3D;
