// Imports
// Cat will extend Three.js Group, so it's a container that can
// be added to the scene
// https://threejs.org/docs/#Group
import { Group, Box3, Vector3, AnimationMixer } from 'three';
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

            // Initialize animation mixer
            this.mixer = new AnimationMixer(gltf.scene);
            // Get single animation that consists of all animations
            this.animation = this.mixer.clipAction(gltf.animations[0]);
            // Store timepoints of each animations
            this.ranges = {
                idle: { start: 0.0, end: 2.1 },
                walk: { start: 3.0, end: 4.1 },
                look: { start: 7.1, end: 10.1 },
                run: { start: 10.5, end: 12.8 },
            };

            // Set animation instance variables
            this.animationStart = null;
            this.animationEnd = null;

            this.playAnimation('idle');
        });

        // We'll be using WASD to move the cat
        this.keys = {
            w: false,
            a: false,
            s: false,
            d: false,
            shift: false
        };

        // Set movement speed of cat
        this.speed = 0.2;
        // Set rotation speed of cat
        this.rotationSpeed = 0.1;
        // Track objects cat can collide width
        this.collidableObjects = [];

        // Add keyboard event listeners
        window.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            // Mark whether WASD and/or shift is pressed
            if (key in this.keys) this.keys[key] = true;
            this.keys.shift = e.shiftKey;

        });
        window.addEventListener('keyup', (e) => {
            // If pressed key is WASD, flag movement
            const key = e.key.toLowerCase();
            // Mark whether WASD and/or shift is lifted
            if (key in this.keys) this.keys[key] = false;
            this.keys.shift = e.shiftKey;
        });
    }

    // Instance method to play an animation
    playAnimation(animation) {
        // Check if animation and time range exists
        if (!this.animation || !this.ranges[animation]) return;

        // If this animation is already playing, return
        if (this.currentAnimation === animation) return;

        // Stop current animation
        this.animation.stop();

        // Set animation start to new animation's start
        const range = this.ranges[animation];
        this.animation.time = range.start;

        // Increase speed of run animation
        if (animation === 'run') this.animation.timeScale = 1.5;
        else this.animation.timeScale = 1.0;

        // Play new animation
        this.animation.play();

        // Set instance variables of cat
        this.currentAnimation = animation;
        // Range instance variables important for looping the animation
        // in update()
        this.animationStart = range.start;
        this.animationEnd = range.end;
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

    // Instance method for updating cat's movement and animation
    update(timeStamp) {
        if (this.mixer) {
            // Update animation mixer
            // Time elapsed since last frame, convert from milliseconds
            // to seconds
            const delta = (timeStamp - (this.lastTime || timeStamp)) / 1000;
            // New last time is now current timestamp
            this.lastTime = timeStamp;
            // Advanced animation by time elapsed
            this.mixer.update(delta);

            // When animation reaches end, loop it to start
            if (this.animation && this.animationStart !== null) {
                if (this.animation.time >= this.animationEnd) {
                    this.animation.time = this.animationStart;
                }
            }
        }

        // Rotation is determined by A/D interactions
        if (this.keys.a) this.rotation.y += this.rotationSpeed;
        if (this.keys.d) this.rotation.y -= this.rotationSpeed;

        // If W + shift is pressed, run
        if (this.keys.w && this.keys.shift) {
            this.speed = 0.4;
            this.playAnimation('run');
        // If any other WASD is pressed, just walk
        } else if (this.keys.w || this.keys.a || this.keys.s || this.keys.d) {
            this.speed = 0.2;
            this.playAnimation('walk');
        // If no movement keys are pressed, idle
        } else {
            this.playAnimation('idle');
        }

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
