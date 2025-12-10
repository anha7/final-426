// Imports
import { Group, Vector3, Box3 } from 'three';

// This class treats the world as a chunk-based system
// As cat moves, generate new chunks ahead
class Generator extends Group {
    constructor(assetManager) {
        // Generator extends Three.js Group
        super();

        // Instance variables
        this.chunks = new Map(); // Tracks which chunks of terrain have
        // already been generated
        this.size = 44.7; // City will be a 45x45 grid
        this.viewDistance = 15; // Will be able to see terain 15 squares
        // ahead and behind
        this.assetManager = assetManager; // City assets manager
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

        // First, add road down middle (3 times)
        for (let i = 0; i < 3; i++) {
            // Calculate z position
            const roadZ = worldZ + i * 14.9 - 14.9;

            // Road on right side
            const rightRoad = this.assetManager.road['road_13'].clone();
            rightRoad.position.set(worldX - 7.4, 0, roadZ);

            // Road on left side
            const leftRoad = this.assetManager.road['road_13'].clone();
            leftRoad.position.set(worldX + 7.4, 0, roadZ);
            leftRoad.rotation.y = Math.PI;

            // Add to set of assets
            assets.add(rightRoad);
            assets.add(leftRoad);
        }

        // Now, add sidewalks down middle and outward
        for (let i = 0; i < 3; i++) {
            // Calculate z position
            const sideZ = worldZ + i * 14.9 - 14.9;
            for (let j = 0; j < 10; j++) {
                // Sidewalk on right side
                const rightSidewalk = this.assetManager.road['grass_8'].clone();
                rightSidewalk.userData.collidable = true;
                rightSidewalk.position.set(worldX - j * 14.9 - 22.35, 0, sideZ);

                // Sidewalk on left side
                const leftSidewalk = this.assetManager.road['grass_8'].clone();
                leftSidewalk.userData.collidable = true;
                leftSidewalk.position.set(worldX + j * 14.9 + 22.35, 0, sideZ);

                // Add to set of assets
                assets.add(rightSidewalk);
                assets.add(leftSidewalk);
            }
        }

        // Add random decor to each side
        for (let i = 0; i < 3; i++) {
            // Calculate z position
            const decorZ = worldZ + i * 14.9 - 14.9;

            // Random decor is added at a set probability
            if (Math.random() > 0.2) {
                // Add decor on right sidewalk
                const rightDecor = this.assetManager.getRandomDecor(
                    this.assetManager.foliage
                );
                rightDecor.position.set(
                    worldX - (Math.random() * 7.45 + 22.35),
                    0,
                    decorZ
                );
                rightDecor.rotation.y = Math.PI / 2;

                // Add decor on left sidewalk
                const leftDecor = this.assetManager.getRandomDecor(
                    this.assetManager.foliage
                );
                leftDecor.position.set(
                    worldX + (Math.random() * 7.45 + 22.35),
                    0,
                    decorZ
                );
                leftDecor.rotation.y = (3 * Math.PI) / 2;

                // Add to set of assets and collidable objects
                assets.add(rightDecor);
                assets.add(leftDecor);
                this.collidableObjects.push(rightDecor);
                this.collidableObjects.push(leftDecor);
            }
        }

        // Add buildings on each side
        // Building on right side
        const rightBuilding = this.assetManager.getRandomBuilding(
            this.assetManager.buildings
        );
        rightBuilding.position.set(worldX - 55, 0, worldZ);
        rightBuilding.rotation.y = Math.PI / 2;

        // Building on left side
        const leftBuilding = this.assetManager.getRandomBuilding(
            this.assetManager.buildings
        );
        leftBuilding.position.set(worldX + 55, 0, worldZ);
        leftBuilding.rotation.y = (3 * Math.PI) / 2;

        // Add to set of assets and collidable objects
        assets.add(rightBuilding);
        assets.add(leftBuilding);
        this.collidableObjects.push(rightBuilding);
        this.collidableObjects.push(leftBuilding);

        // Add fences throughout building to indicate world barrier
        // Barrier on right side
        const rightBarrier = this.assetManager.fence.clone();
        rightBarrier.position.set(worldX - 60, 0, worldZ);
        rightBarrier.rotation.y = Math.PI / 2;
        // const box = new Box3().setFromObject(rightBarrier);
        // console.log("Fence size:", box.getSize(new Vector3()));

        // Barrier on left side
        const leftBarrier = this.assetManager.fence.clone();
        leftBarrier.position.set(worldX + 60, 0, worldZ);
        leftBarrier.rotation.y = (3 * Math.PI) / 2;

        // Add to set of assets and collidable objects
        assets.add(rightBarrier);
        assets.add(leftBarrier);
        this.collidableObjects.push(rightBarrier);
        this.collidableObjects.push(leftBarrier);

        // Return assets
        return assets;
    }

    // Generate terrain based on cat's current position
    update(catPosition) {
        // Check which chunk cat is currently in based on z-xis
        const chunkZ = Math.floor(catPosition.z / this.size);

        // Generate chunks of terrain spanning view distance
        // Will generate if terrain doesn't already exist for that chunk
        for (
            let z = chunkZ - this.viewDistance;
            z <= chunkZ + this.viewDistance;
            z++
        ) {
            if (!this.chunks.has(z)) {
                // Constrain x position to origin so terrain only
                // generates forward
                const terrain = this.generateTerrain(0, z);
                this.chunks.set(z, terrain);
                // Add terrain to scene
                this.add(terrain);
            }
        }

        // Remove chunks too far behind to save memory
        this.chunks.forEach((terrain, z) => {
            // If chunk is outside view distance from behind, remove it
            if (z < chunkZ - this.viewDistance) {
                // Remove terrain associated with chunk from scene
                this.remove(terrain);

                // Remove assets associated with terrain from list of
                // collidable objects as well
                terrain.children.forEach((asset) => {
                    // Find index of asset within array
                    const index = this.collidableObjects.indexOf(asset);
                    // Remove 1 element (that asset) from array based on
                    // found index
                    if (index > -1) this.collidableObjects.splice(index, 1);
                });

                // Remove chunk from lists of tracked chunks
                this.chunks.delete(z);
            }
        });
    }
}

export default Generator;
