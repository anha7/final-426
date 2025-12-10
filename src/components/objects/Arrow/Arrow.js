// Imports
import { Group } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { TWEEN } from 'three/examples/jsm/libs/tween.module.min.js';
import MODEL from './arrow.glb';

// This class manages arrow model
class Arrow extends Group {
    constructor() {
        // Arrow extends Three.js Group
        super();

        // Give name to arrow
        this.name = 'arrow';
        // Initialize loader
        const loader = new GLTFLoader();
        loader.load(MODEL, (gltf) => {
            // Add arrow to scene
            this.add(gltf.scene);
        });
    }

    update() {
    }
}

export default Arrow;