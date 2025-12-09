// Imports
// Cat will extend Three.js Group, so it's a container that can
// be added to the scene
// https://threejs.org/docs/#Group
import { Group, Box3, Vector3 } from 'three';
// Will use Three.js' loader to parse the city scene GLTF file
// https://threejs.org/docs/#GLTFLoader
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
// Import cat assets
import MODEL from './cat.glb';

// This class manages cat model
// We'll load the cat model from the gltf file
// We'll also manage the cat animations
class Cat extends Group {
    constructor() {
        // Cat extends Three.js Group
        super();

        // Track name of object
        this.name = 'cat';
        // Initialize loader
        const loader = new GLTFLoader();
        loader.load(MODEL, (gltf) => {
            // Add cat to scene
            this.add(gltf.scene);
            // Set model, important for checking collisions
            this.model = gltf.scene;
        });

        // We'll be using WASD to move the cat
        this.keys = {
            w: false,
            a: false,
            s: false,
            d: false,
        };

        // Set movement speed of cat
        this.speed = 0.4;
        // Set rotation speed of cat
        this.rotationSpeed = 0.1;
        // Track objects cat can collide width
        this.collidableObjects = [];

        // Add keyboard event listeners
        window.addEventListener('keydown', (e) => {
            // Ensure pressed key is WASD
            const key = e.key.toLowerCase();
            if (key in this.keys) this.keys[key] = true;
        });
        window.addEventListener('keyup', (e) => {
            // Ensure pressed key is WASD
            const key = e.key.toLowerCase();
            if (key in this.keys) this.keys[key] = false;
        });
    }

    // Instance method to check if cat's proposed new position collides
    // with objects in scene
    checkCollisions(x, z) {
        // Check if model exists
        if (!this.model) return false;

        // Create cat's hit box to test for collisions
        // We need a hit box that is rotation independent, so we will
        // create a manual box based on size of cat
        // const box = new Box3().setFromObject(this.model);
        // console.log("Cat size:", box.getSize(new Vector3()));
        const halfCatSize = 1.1;
        const hitBox = new Box3(
            new Vector3(x - halfCatSize, 0, z - halfCatSize),
            new Vector3(x + halfCatSize, 2, z + halfCatSize)
        );

        // Loop through every object in set of collidable objects
        for (const object of this.collidableObjects) {
            // Create a hit box for current object
            const objectHitBox = new Box3().setFromObject(object);
            // Check for collisions, returning first collision we find
            if (hitBox.intersectsBox(objectHitBox)) return true;
        }

        // No collisions found, return false
        return false;
    }

    // Instance method for updating cat's movement
    update() {
        // Rotation is determined by A/D interactions
        if (this.keys.a) this.rotation.y += this.rotationSpeed;
        if (this.keys.d) this.rotation.y -= this.rotationSpeed;

        // Store how much we want to move
        let dist = 0;
        // How much we want to move is determined by W/D interactions
        if (this.keys.w) dist += this.speed;
        if (this.keys.s) dist -= this.speed;

        // Check if movement along x-axis incurs collision
        // If so, do not move the cat
        if (dist !== 0) {
            // Get cat's potential position based on rotation
            const x = this.position.x + Math.sin(this.rotation.y) * dist;
            const z = this.position.z + Math.cos(this.rotation.y) * dist;

            // If movement doesn't cause collision, actually move
            if (!this.checkCollisions(x, z)) {
                this.position.x = x;
                this.position.z = z;
            } else {
                if (!this.checkCollisions(x, this.position.z)) {
                    this.position.x = x;
                }
                if (!this.checkCollisions(this.position.x, z)) {
                    this.position.z = z;
                }
            }
        }
    }
}

export default Cat;
