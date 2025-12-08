// Imports
// Cat will extend Three.js Group, so it's a container that can
// be added to the scene
// https://threejs.org/docs/#Group
import { Group, Box3 } from 'three';
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
        }

        // Set movement speed of cat
        this.speed = 0.4;
        // Track cat's hit box (null for now)
        this.hitBox = null;
        // Add padding to hit box
        this.padding = 0.1;
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

    // Instance method for updating cat's hit box
    updateHitBox() {
        // Check if model exists
        if (!this.model) return;

        // If hit box doesn't exist yet, create one
        if (!this.hitBox) {
            this.hitBox = new Box3();
        }

        // Calculate cat's hit box from object's geometry
        this.hitBox.setFromObject(this.model);
        // Expand hit box to account for padding
        this.hitBox.expandByScalar(this.padding);
    }

    // Instance method to check if cat collides with objects in scene
    checkCollisions() {
        // Check if cat's hit box / model exists
        if (!this.hitBox || !this.model) return false;

        // Loop through every object in set of collidable objects
        for (const object of this.collidableObjects) {
            // Create a hit box for current object
            const objectHitBox = new Box3().setFromObject(object);
            objectHitBox.expandByScalar(this.padding);

            // Return first collision we find
            if (this.hitBox.intersectsBox(objectHitBox)) return true;
        }

        // No collisions found, return false
        return false;
    }

    // Instance method for updating cat's movement
    update() {
        // Store how much we want to move
        let deltaX = 0;
        let deltaZ = 0;

        // Movement updates
        if (this.keys.w) deltaZ += this.speed;
        if (this.keys.a) deltaX += this.speed;
        if (this.keys.s) deltaZ -= this.speed;
        if (this.keys.d) deltaX -= this.speed;

        //  Check if movement along x-axis is inhibited by object
        if (deltaX !== 0) {
            // Temporarily move to test collisions
            this.position.x += deltaX;
            this.updateHitBox();

            // Check if it would cause a collision
            const collision = this.checkCollisions();

            // Revert movement if there's collision
            if (collision) this.position.x -= deltaX;
        }

        //  Check if movement along z-axis is inhibited by object
        if (deltaZ !== 0) {
            // Temporarily move to test collisions
            this.position.z += deltaZ;
            this.updateHitBox();

            // Check if it would cause a collision
            const collision = this.checkCollisions();

            // Revert movement if there's collision
            if (collision) this.position.z -= deltaZ;
        }

        // Do a final hitbox update
        this.updateHitBox();
    }
}

export default Cat;