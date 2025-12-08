// Imports
// Cat will extend Three.js Group, so it's a container that can
// be added to the scene
// https://threejs.org/docs/#Group
import { Group } from 'three';
// Will use Three.js' loader to parse the city scene GLTF file
// https://threejs.org/docs/#GLTFLoader
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
// Import cat assets
import MODEL from './cat.glb';

// This class manages cat model
// We'll load the cat model from the gltf file
// We'll also manage the cat animations
class Cat extends Group {
    constructor(parent) {
        // Cat extends Three.js Group
        super();

        // Track name of object
        this.name = 'cat';
        // Initialize loader
        const loader = new GLTFLoader();
        // Add cat to scene
        loader.load(MODEL, (gltf) => {
            this.add(gltf.scene);
        });

        // We'll be using WASD to move the cat
        this.keys = {
            w: false,
            a: false,
            s: false,
            d: false,
        }

        // Set movement speed of cat
        this.speed = 0.1;

        // Add keyboard event listeners
        window.addEventListener('keydown', (e) => {
            // Check if pressed key is WASD
            const key = e.key.toLowerCase();
            if (key in this.keys) this.keys[key] = true;
        });
        window.addEventListener('keyup', (e) => {
            const key = e.key.toLowerCase();
            if (key in this.keys) this.keys[key] = false;
        });
    }

    // Instance method for updating object
    update() {
        // Movement updates
        if (this.keys.w) this.position.z += this.speed;
        if (this.keys.a) this.position.x += this.speed;
        if (this.keys.s) this.position.z -= this.speed;
        if (this.keys.d) this.position.x -= this.speed;
    }
}

export default Cat;