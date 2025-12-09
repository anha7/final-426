// Imports
// City will extend Three.js Group, so it's a container that can
// be added to the scene
// https://threejs.org/docs/#Group
import { Group } from 'three';
// Will use Three.js' loader to parse the city scene GLTF file
// https://threejs.org/docs/#GLTFLoader
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
// Import city assets
import MODEL from './city.glb';

// This class manages assets in the city
// We'll extract the different assets from the gltf file
// We'll also create helper functions to retrieve random assets
class City extends Group {
    constructor(onLoadComplete) {
        // City extends Three.js Group
        super();
    
        // Assets have not loaded yet
        this.loaded = false;
        // Called when assets finish loading
        this.onLoadComplete = onLoadComplete;

        // Initialize instance variables to organize different types of
        // objects from city assets
        this.buildings = {};
        this.vehicles = {};
        this.decor = {};
        this.road = {};
        this.street = {};
        this.lights = {};
        this.fence = null;

        // Define assets from city scene to look out for when traversing
        // through scene and organizing assets
        this.assets = {
            // Different buildings
            buildings: [
                'bakery_27',
                'blue_house_28',
                'cinema_29',
                'coffe_shop_30',
                'fire_station_31',
                'green_house_35',
                'hotel_36',
                'market_37',
                'pizzeria_38',
                'police_station_39',
                'yellow_house_40'
            ],
            // Different vehicles
            vehicles: [
                'ambulance_42',
                'blue_car_43',
                'bus_44',
                'fire_truck_45',
                'police_46',
                'small_bus_47',
                'small_car_48',
                'sport_car_49',
                'taxi_50',
                'truck_51'
            ],
            // Different decor (foliage + street furniture)
            decor: [
                'bush_3',
                'tree_1_19',
                'tree_2_20',
                'tree_3_21',
                'bench_1',
                'bin_2',
                'chair_5',
                'cone_6',
                'double_bin_7',
                'hydrant_9',
                'lantern_10',
                'post_12',
                'soda_16',
                'stop_sign_17',
                'table_18',
                'umbrella_22',
                'bus_stop_sign_23',
            ],
            // Different road elements
            road: [
                'road_13',
                'road_black_14',
                'road_black_zebra_crossing_15',
                'sidewalk_26',
                'grass_8'
            ],
            // Different traffic lights
            lights: [
                'car_light_red_4',
                'light_red_11',
                'car_light_green_24',
                'light_green_25'
            ],
            fence: 'barrier_0'
        };

        // Initialize loader
        const loader = new GLTFLoader();
        // Load city assets
        loader.load(MODEL, (gltf) => {
            // Traverse through each object in the city asset file,
            // categorizing parent objects
            // Parent objects consists of many child objects, so we
            // store the entire node
            gltf.scene.traverse((object) => {
                // Look for different buildings
                if (this.assets.buildings.includes(object.name)) { 
                    object.scale.set(5, 5, 5);
                    this.buildings[object.name] = object;
                }
                // Look for different vehicles
                if (this.assets.vehicles.includes(object.name)) {
                    object.scale.set(5, 5, 5);
                    this.vehicles[object.name] = object;
                }
                // Look for different decor (foliage + street furtniture)
                if (this.assets.decor.includes(object.name)) {
                    object.scale.set(5, 5, 5);
                    this.decor[object.name] = object;
                }
                // Look for different road elements
                if (this.assets.road.includes(object.name)) {
                    object.scale.set(5, 5, 5);
                    this.road[object.name] = object;
                }
                // Look for different traffic lights
                if (this.assets.lights.includes(object.name)) {
                    object.scale.set(5, 5, 5);
                    this.lights[object.name] = object;
                }
                // Look for fence
                if (this.assets.fence === object.name) {
                    object.scale.set(44.7, 5, 5)
                    this.fence = object;
                }
            });

            // Assets have loaded
            this.loaded = true;
            if (this.onLoadComplete) this.onLoadComplete();
        });
    }

    // Helper method to return random object from a category (e.g., 
    // return a random building from set of buildings)
    randomObject(category) {
        // Retrieve keys (names of objects within category)
        const keys = Object.keys(category);
        // Generate a random index which tells us which random object to
        // retrieve
        const randIndex = Math.floor(Math.random() * keys.length);
        // Get random object
        const randObject = keys[randIndex];
        // Return object info associated with the random object
        return category[randObject].clone();
    }
    // Getter methods to return a random object from each category
    // Get a random building
    getRandomBuilding() {
        return this.randomObject(this.buildings);
    }
    // Get a random vehicle
    getRandomVehicle() {
        return this.randomObject(this.vehicles);
    }
    // Get a random decor
    getRandomDecor() {
        return this.randomObject(this.decor);
    }
    // Get random street lights
    getRandomStreetLight() {
        return this.randomObject(this.lights);
    }
}

export default City;