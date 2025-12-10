import { Box3, Vector3 } from 'three';
import { Arrow, Parcel, Pointer } from 'objects';

class Game {
    // Constructor
    constructor(scene, generator, cat, camera) {
        // Scene set up instance variables
        this.scene = scene; // Seed scene
        this.generator = generator; // Terrain generator
        this.cat = cat; // Controlling cat model
        this.camera = camera;

        // Delivery game instance variables
        this.parcel = null; // Current parcel (null on start)
        this.deliveryLocation = null; // Current delivery location (null on start)
        this.parcelPickedUp = false; // Did cat pick up parcel yet?
        this.pickupRange = 64; // Squared
        this.arrow = new Arrow(camera, cat); // Visual arrow pointing to POI
        this.scene.add(this.arrow);
        this.score = 0; // Track successful deliveries
        // Sidewalk positions (right is 0, left is 1)
        this.sidewalks = { 0: -38, 1: 38 };
        // Initialize sidewalk that first parcel spawns in randomly
        this.sideNumber = Math.random() > 0.5 ? 0 : 1;
        this.parcelSide = this.sidewalks[this.sideNumber];
        // Sidewalk that delivery is on will be opposite that
        this.deliverySide =
            this.sidewalks[
                (this.sideNumber + 1) % Object.keys(this.sidewalks).length
            ];
        this.sideNumber = Math.random() > 0.5 ? 0 : 1;;
    }

    // Helper method to find a valid position to spawn parcel / delivery
    // location
    findSpawnPos(x, z, object) {
        // Try 20 times to find a valid spawn position
        for (let i = 0; i < 20; i++) {
            // Every iteration, try 2 units forward from last
            const testZ = z + i * 2;

            // Create a hit box to test collisions
            const hitBox = new Box3().setFromObject(object);
            // Translate hit box to test position
            const offset = new Vector3(
                x - object.position.x,
                0,
                testZ - object.position.z
            );
            hitBox.min.add(offset);
            hitBox.max.add(offset);

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
        // position (randomly 60-90 units away from cat)
        const spawnZ = this.cat.position.z + (Math.random() * 30 + 60);

        // Create new parcel
        const parcel = new Parcel();
        this.parcel = parcel;

        // Find valid spawn position
        const spawnPos = this.findSpawnPos(this.parcelSide, spawnZ, parcel);

        // Add to scene and update necessary instance vars
        parcel.position.set(spawnPos.x, 5, spawnPos.z);
        this.scene.add(parcel);
        this.parcelSide = this.sidewalks[this.sideNumber];
        this.arrow.setTarget(parcel);
    }

    // Instance method to spawn a delivery location
    spawnDelivery() {
        // Ensure parcel exists
        if (!this.parcel) return;

        // Determine spawn distance of delivery from cat's current z
        // position (randomly 60-90 units away from cat)
        const spawnZ = this.cat.position.z + (Math.random() * 30 + 60);

        // Create new delivery pointer
        const pointer = new Pointer();
        this.deliveryLocation = pointer;

        // Find valid spawn position
        const spawnPos = this.findSpawnPos(this.deliverySide, spawnZ, pointer);

        // Add to scene and update necessary instance vars
        pointer.position.set(spawnPos.x, 0, spawnPos.z);
        this.scene.add(pointer);
        this.deliverySide =
            this.sidewalks[
                (this.sideNumber + 1) % Object.keys(this.sidewalks).length
            ];
        this.sideNumber = Math.random() > 0.5 ? 0 : 1;
        this.arrow.setTarget(pointer);
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
            this.parcel.remove(this.parcel.light);
            this.parcel.rotation.y = 0;
            this.parcel.position.set(0, 4.25, 0);
            // Spawn delivery location
            this.arrow.setTarget(null);
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
            // Start next delivery
            this.arrow.setTarget(null);
            this.spawnParcel();
        }
    }

    // Instance method for checking game conditions every frame
    update() {
        // Check if cat has reached parcel / destination
        this.checkParcelProximity();
        this.checkDeliveryProximity();

        // Ensure parcel and pointer rotate
        if (this.parcel && this.parcel.parent === this.scene)
            this.parcel.rotation.y += 0.02;
        if (this.deliveryLocation) this.deliveryLocation.rotation.y += 0.02;

        // Update direction arrow
        this.arrow.update();
    }
}

export default Game;
