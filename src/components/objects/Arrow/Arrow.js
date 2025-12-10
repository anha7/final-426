// Imports
import { Group, Vector3 } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import MODEL from './arrow.glb';

// This class manages arrow model
class Arrow extends Group {
    constructor(camera, cat) {
        // Arrow extends Three.js Group
        super();

        // Instance variables
        this.camera = camera;
        this.cat = cat;
        this.target = null;
        this.visible = false;

        // Give name to arrow
        this.name = 'arrow';
        // Initialize loader
        const loader = new GLTFLoader();
        loader.load(MODEL, (gltf) => {
            // Set arrow attributes
            this.scale.set(0.25, 0.25, 0.25);
            this.model = gltf.scene;
            // Add arrow to scene
            this.add(gltf.scene);
        });
    }

    // Set which target (parcel or delivery location) to point to
    setTarget(target) {
        this.target = target;
        this.visible = target !== null ? true : false;
    }

    /// Update position of arrow and rotation every frame
    update() {
        // Ensure cat, target, and model exists
        if (!this.cat || !this.target || !this.model) return;

        // Position arrow relative to cat
        this.position.set(
            this.cat.position.x + 3,
            this.cat.position.y + 1,
            this.cat.position.z
        );

        // Make arrow look at target
        this.lookAt(this.target.position);
        this.rotation.y += Math.PI;
    }
}

export default Arrow;
