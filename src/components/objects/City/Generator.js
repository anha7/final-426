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
        this.chunks = new Map();
        this.size = 20; // City will be a 20x20 grid
        this.viewDistance = 5;
        this.assetManager = assetManager; // Refers to city instance
        this.lastCatPosition = { x: 0, z: 0 }; // Last cat position
    }

    // Instance variable to generate chunk of terrain
    generateTerrain(x, z) {
        // Create a group to hold city assets for this chunk
        const assets = new Group();

        // Calculate world position
        const worldX = x * this.size;
        const worldZ = z * this.size;

        // Build layout of terrain

        // First, add road down middle
        const leftRoad = this.assetManager.road['road_13'].clone();
        leftRoad.position.set(worldX - 2, 0, worldZ);
        const rightRoad = this.assetManager.road['road_13'].clone();
        rightRoad.position.set(worldX + 2, 0, worldZ);
        rightRoad.rotation.y = Math.PI / 180;
        assets.add(leftRoad);
        assets.add(rightRoad);

        // Add sidewalks
        const leftSidewalk = this.assetManager.road['sidewalk_26'].clone();
        leftSidewalk.position.set(worldX - 5, 0, worldZ);
        const rightSidewalk = this.assetManager.road['sidewalk_26'].clone();
        rightSidewalk.position.set(worldX + 5, 0, worldZ);
        assets.add(leftSidewalk);
        assets.add(rightSidewalk);

        // Add buildings on each side
        const leftBuilding = this.assetManager.getRandomBuilding(
            this.assetManager.buildings);
        leftBuilding.position.set(worldX - 10, 0, worldZ);
        const rightBuilding = this.assetManager.getRandomBuilding(
            this.assetManager.buildings);
        rightBuilding.position.set(worldX + 10, 0, worldZ);
        assets.add(leftBuilding);
        assets.add(rightBuilding);

        // Add random foliage to each side at set probability
        if (Math.random() > 0.5) {
            const leftFoliage = this.assetManager.getRandomFoliage(
                this.assetManager.foliage);
            leftFoliage.position.set(worldX - (
                Math.random() * 5 - 2), 0, worldZ);
            const rightFoliage = this.assetManager.getRandomFoliage(
                this.assetManager.foliage);
            rightFoliage.position.set(worldX + (
                Math.random() * 5 - 2), 0, worldZ);
            assets.add(leftFoliage);
            assets.add(rightFoliage);
        }

        // Add random street furniture to each side at set probability
        if (Math.random() > 0.5) {
            const leftFurn = this.assetManager.getRandomStreetItem(
                this.assetManager.street);
            leftFurn.position.set(worldX - (
                Math.random() * 5 - 2), 0, worldZ);
            const rightFurn = this.assetManager.getRandomStreetItem(
                this.assetManager.street);
            rightFurn.position.set(worldX + (
                Math.random() * 5 - 2), 0, worldZ);
            assets.add(leftFurn);
            assets.add(rightFurn);
        }
        
        return assets;
    }

    // Generate terrain based on cat's current position
    update(catPosition) {
        // Check which chunk cat is currently in
        const chunkX = Math.floor(catPosition.x / this.size);
        const chunkZ = Math.floor(catPosition.z / this.size);

        // Generate chunks if terrain doesn't already exist for that
        // chunk
        for (let x = chunkX - this.viewDistance; x <= chunkX + this.viewDistance; x++) {
            for (let z = chunkZ - this.viewDistance; z <= chunkZ + this.viewDistance; z++) {
                if (!this.chunks.has(`${x},${z}`)) {
                    const terrain = this.generateTerrain(x, z);
                    this.chunks.set(`${x},${z}`, terrain);
                    this.add(terrain);
                }
            }
        }
    }
}

export default Generator;
