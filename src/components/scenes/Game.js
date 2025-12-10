import { Box3, Vector3 } from 'three';
import { Arrow, Parcel, Pointer } from 'objects';

class Game {
    // Constructor
    constructor(scene, generator, cat) {
        // Scene set up instance variables
        this.scene = scene; // Seed scene
        this.generator = generator; // Terrain generator
        this.cat = cat; // Controlling cat model

        // Delivery game instance variables
        this.parcel = null; // Current parcel (null on start)
        this.deliveryLocation = null; // Current delivery location (null on start)
        this.parcelPickedUp = false; // Did cat pick up parcel yet?
        this.pickupRange = 4; // Squared
        this.arrow = new Arrow(); // Visual arrow pointing to POI
        this.score = 0; // Track successful deliveries
        // Sidewalk positions (right is 0, left is 1)
        this.sidewalks = { 0: -22.35, 1: 22.35 };
        // Initialize sidewalk that first parcel spawns in randomly
        this.sideNumber = Math.random() > 0.5 ? 0 : 1;
        this.parcelSide = this.sidewalks[this.sideNumber];
        // Sidewalk that delivery is on will be opposite that
        this.deliverySide =
            this.sidewalks[
                (this.sideNumber + 1) % Object.keys(this.sidewalks).length
            ];
        this.sideNumber++;
    }

    // Helper method to find a valid position to spawn parcel / delivery
    // location
    findSpawnPos(x, z) {
        // Try 5 times to find a valid spawn position
        for (let i = 0; i < 5; i++) {
            // Every iteration, try 10 units forward from last
            const testZ = z + i * 10;

            // Create a bounding box to test collisions
            // Size is based on cat's size to ensure cat is able to
            // access parcel area
            const halfCatSize = 1.1;
            const hitBox = new Box3(
                new Vector3(x - halfCatSize, 0, z - halfCatSize),
                new Vector3(x + halfCatSize, 2, z + halfCatSize)
            );

            // Loop through every object in set of collidable objects
            // and test for collisions
            const collision = false;
            for (const object of this.generator.collidableObjects) {
                // Create a hit box for current object
                const objectHitBox = new Box3().setFromObject(object);
                // Flag collision if there are any
                if (hitBox.intersectsBox(objectHitBox)) collision = true;
                break;
            }

            // If we found no collision, return position
            if (!collision) return { x: x, z: testZ };
        }

        // If collisions found every time, return a best guess
        return { x: x, z: testZ };
    }

    // Instance method to spawn a parcel
    spawnParcel() {
        // Determine spawn distance of parcel from cat's current z
        // position (randomly 20-35 units away from cat)
        const spawnZ = this.cat.position.z + (Math.random() * 15 + 20);

        // Find valid spawn position
        const spawnPos = this.findSpawnPos(this.parcelSide, spawnZ);

        // Create new parcel, add to scene, and update necessary
        // instance vars
        const parcel = new Parcel();
        parcel.position.set(spawnPos.x, 0, spawnPos.z);
        this.scene.add(parcel);
        this.parcel = parcel;
        this.parcelSide =
            this.sidewalks[
                this.sideNumber % Object.keys(this.sidewalks).length
            ];
    }

    // Instance method to spawn a delivery location
    spawnDelivery() {
        // Ensure parcel exists
        if (!this.parcel) return;

        // Determine spawn distance of delivery from cat's current z
        // position (randomly 15-30 units away from parcel)
        const spawnZ = this.cat.position.z + (Math.random() * 15 + 15);

        // Find valid spawn position
        const spawnPos = this.findSpawnPos(this.deliverySide, spawnZ);

        // Create new delivery pointer, add to scene, and update
        // necessary instance vars
        const pointer = new Pointer();
        pointer.position.set(spawnPos.x, 0, spawnPos.z);
        this.scene.add(pointer);
        this.deliveryLocation = pointer;
        this.deliverySide =
            this.sidewalks[
                (this.sideNumber + 1) % Object.keys(this.sidewalks).length
            ];
        this.sideNumber++;
    }

    // Instance method to check whether cat is in pickup range of
    // parcel
    checkParcelProximity() {
        // Ensure parcel exists and has not yet been picked up
        if (!this.parcel || this.parcelPickedUp) return;

        // Get position of cat and parcel
        const catPos = this.cat.position;
        const parcelPos = this.parcel.position;
        // Check whether distance from cat to parcel is within pickup
        // range
        const dx = parcelPos.x - catPos.x;
        const dz = parcelPos.z - catPos.z;
        if (dx * dx + dz * dz < this.pickupRange) {
            // Mark that parcel has been picked up
            this.parcelPickedUp = true;
            // Remove parcel from scene
            this.scene.remove(this.parcel);
            // Position parcel above cat
            this.cat.add(this.parcel);
            this.parcel.position.set(0, 3, 0);
            // Spawn delivery location
            this.spawnDelivery();
        }
    }

    // Instance method to check whether cat is in delivery range
    checkDeliveryProximity() {
        // Ensure parcel has been picked up and a delivery location
        // exists
        if (!this.parcelPickedUp || !this.deliveryLocation) return;

        // Get position of cat and delivery location
        const catPos = this.cat.position;
        const deliveryPos = this.deliveryLocation.position;
        // Check whether distance from cat to delivery is within pickup
        // range
        const dx = deliveryPos.x - catPos.x;
        const dz = deliveryPos.z - catPos.z;
        if (dx * dx + dz * dz < this.pickupRange) {
            // Increase score
            this.score++;
            console.log('Score is now:', this.score);
            // Remove parcel and delivery location
            this.cat.remove(this.parcel);
            this.parcel = null;
            this.scene.remove(this.deliveryLocation);
            this.deliveryLocation = null;
            // Reset state
            this.parcelPickedUp = false;
            // Schedule next delivery after 2 seconds
            setTimeout(() => this.spawnParcel(), 2000);
        }
    }

    // Instance method for checking game conditions every frame
    update() {
        this.checkParcelProximity();
        this.checkDeliveryProximity();
    }
}

export default Game;
