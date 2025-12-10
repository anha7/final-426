// Imports
import { Group, PointLight, Box3, Vector3 } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import MODEL from './parcel.glb';

// This class manages the parcel model
class Parcel extends Group {
    constructor() {
        // Parcel extends Three.js Group
        super();

        // Instance variables
        this.name = 'parcel';

        // Initialize loader
        const loader = new GLTFLoader();
        loader.load(MODEL, (gltf) => {
            // Modify parcel attributes
            this.scale.set(25, 25, 25);
            this.model = gltf.scene;

            // const box = new Box3().setFromObject(this.model);
            // console.log("parcel size:", box.getSize(new Vector3()));

            // Add a glowing light to parcel so players can easily see
            // it
            const light = new PointLight(0xFFFFFF, 10, 16);
            this.light = light;
            light.position.set(0, 2/25, 0);
            this.add(light);

            // Add parcel to scene
            this.add(gltf.scene);
        });
    }
}

export default Parcel;