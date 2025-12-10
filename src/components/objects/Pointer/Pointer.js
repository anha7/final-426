// Imports
import { Group, PointLight, Box3, Vector3 } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import MODEL from './pointer.glb';

// This class manages the pointer model
class Pointer extends Group {
    constructor() {
        // Pointer extends Three.js Group
        super();

        // Instance variables
        this.name = 'pointer';

        // Initialize loader
        const loader = new GLTFLoader();
        loader.load(MODEL, (gltf) => {
            // Modify pointer attributes
            this.scale.set(0.6, 0.6, 0.6);
            this.position.y = 5;
            this.model = gltf.scene;

            // const box = new Box3().setFromObject(this.model);
            // console.log("pointer size:", box.getSize(new Vector3()));

            // Add a glowing light to pointer so players can easily see
            // it
            const light = new PointLight(0xFFFFFF, 10, 16);
            light.position.set(0, 2/0.6, 0);
            this.add(light);

            // Add pointer to scene
            this.add(gltf.scene);
        });
    }
}

export default Pointer;