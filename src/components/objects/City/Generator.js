// Imports
// Generator will extend Three.js Group, so it's a container that can
// be added to the scene
import { Group } from 'three';

// This class treats the world as a chunk-based system
// As cat moves, generate new chunks ahead
class Generator extends Group {
    constructor(assetManager) {
        // Generator extends Three.js Group
        super();

        // Instance variables
        this.chunks = new Map(); // Tracks which chunks of terrain have
                                // already been generated
        this.size = 20; // City will be a 20x20 grid
        this.viewDistance = 20; // Will be able to see terain 20 squares
                            // ahead and behind
        this.assetManager = assetManager; // City assets manager
        this.lastCatPosition = { x: 0, z: 0 }; // Last cat position,
                                        // initialized to origin
        this.collidableObjects = []; // Holds all collidable objects,
                                // used to check for collisions
    }

    // Instance method to generate one chunk of terrain
    generateTerrain(x, z) {
        // Create a group to hold city assets for this chunk
        const assets = new Group();

        // Calculate chunk's position in world
        const worldX = x * this.size;
        const worldZ = z * this.size;

        // Build layout of chunk

        // First, add road down middle
        // Road on right side
        const rightRoad = this.assetManager.road['road_13'].clone();
        // Flag it as collidable
        rightRoad.userData.collidable = true;
        // Set position
        rightRoad.position.set(worldX - 7.4, 0, worldZ);
        // Road on left side
        const leftRoad = this.assetManager.road['road_13'].clone();
        // Flag it as collidable
        leftRoad.userData.collidable = true;
        // Set position
        leftRoad.position.set(worldX + 7.4, 0, worldZ);
        // Rotate 180 degrees for white lines match up
        leftRoad.rotation.y = Math.PI;
        // Add to set of assets
        assets.add(rightRoad);
        assets.add(leftRoad);
        // Add to set of collidable objects
        this.collidableObjects.push(rightRoad);
        this.collidableObjects.push(leftRoad);

        // Add sidewalks
        // Sidewalk on right side
        const rightSidewalk = this.assetManager.road['sidewalk_26'].clone();
        // Flag it as collidable
        rightSidewalk.userData.collidable = true;
        // Set position
        rightSidewalk.position.set(worldX - 22.4, 0, worldZ);
        // Sidewalk on left side
        const leftSidewalk = this.assetManager.road['sidewalk_26'].clone();
        // Flag it as collidable
        leftSidewalk.userData.collidable = true;
        // Set position
        leftSidewalk.position.set(worldX + 22.4, 0, worldZ);
        // Add to set of assets
        assets.add(rightSidewalk);
        assets.add(leftSidewalk);
        // Add to set of collidable objects
        this.collidableObjects.push(rightSidewalk);
        this.collidableObjects.push(leftSidewalk);

        // Add random decor to each side at set probability
        if (Math.random() > 0.2) {
            // Add decor on right sidewalk
            const rightDecor = this.assetManager.getRandomDecor(
                this.assetManager.foliage);
            // Flag it as collidable
            rightDecor.userData.collidable = true;
            // Set position
            rightDecor.position.set(worldX - (
                Math.random() * 2 + 22.4), 0, worldZ);
            // Rotate it to face road
            rightDecor.rotation.y = Math.PI / 2;
            // Add decor on left sidewalk
            const leftDecor = this.assetManager.getRandomDecor(
                this.assetManager.foliage);
            // Flag it as collidable
            leftDecor.userData.collidable = true;
            // Set position
            leftDecor.position.set(worldX + (
                Math.random() * 2 + 22.4), 0, worldZ);
            // Rotate it to face road
            leftDecor.rotation.y = 3 * Math.PI / 2;
            // Add to set of assets
            assets.add(rightDecor);
            assets.add(leftDecor);
            // Add to set of collidable objects
            this.collidableObjects.push(rightDecor);
            this.collidableObjects.push(leftDecor);
        }

        // Add buildings on each side
        // Building on right side
        const rightBuilding = this.assetManager.getRandomBuilding(
            this.assetManager.buildings);
        // Flag it as collidable
        rightBuilding.userData.collidable = true;
        // Set position
        rightBuilding.position.set(worldX - 44, 0, worldZ);
        // Rotate to face road
        rightBuilding.rotation.y = Math.PI / 2;
        // Building on left side
        const leftBuilding = this.assetManager.getRandomBuilding(
            this.assetManager.buildings);
        // Flag it as collidable
        leftBuilding.userData.collidable = true;
        // Set position
        leftBuilding.position.set(worldX + 44, 0, worldZ);
        // Rotate it to face road
        leftBuilding.rotation.y = 3 * Math.PI / 2;
        // Add to set of assets
        assets.add(rightBuilding);
        assets.add(leftBuilding);
        // Add to set of collidable objects
        this.collidableObjects.push(rightBuilding);
        this.collidableObjects.push(leftBuilding);

        // Return assets
        return assets;
    }

    // Generate terrain based on cat's current position
    update(catPosition) {
        // Check which chunk cat is currently in based on z-xis
        const chunkZ = Math.floor(catPosition.z / this.size);

        // Generate chunks of terrain spanning view distance
        // Will generate if terrain doesn't already exist for that chunk
        for (let z = chunkZ - this.viewDistance; z <= chunkZ + 
                this.viewDistance; z++) {
            if (!this.chunks.has(z)) {
                // Constrain x position to origin so terrain only
                // generates forward
                const terrain = this.generateTerrain(0, z);
                this.chunks.set(z, terrain);
                // Add terrain to scene
                this.add(terrain);
            }
        }
    }
}

export default Generator;
