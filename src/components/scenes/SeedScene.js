import * as Dat from 'dat.gui';
import { Scene, Color, Vector3 } from 'three';
import { Cat, City, Generator } from 'objects';
import { BasicLights } from 'lights';

class SeedScene extends Scene {
    constructor() {
        // Call parent Scene() constructor
        super();

        // Init state
        this.state = {
            gui: new Dat.GUI(), // Create GUI for scene
            rotationSpeed: 1,
            updateList: [],
        };

        // Set background to a nice color
        this.background = new Color(0x7ec0ee);

        // Instance variable to manage city assets
        this.assetManager = new City(() => {
            // Initialize terrain generator and add to scene
            this.generator = new Generator(this.assetManager);
            this.add(this.generator);
            // Generate initial chunks of terrain
            this.generator.update(new Vector3(0, 0, 0));
        });

        // Add meshes to scene
        const cat = new Cat();
        const lights = new BasicLights();
        this.add(cat, lights);
        this.addToUpdateList(cat);

        // // Populate GUI
        // this.state.gui.add(this.state, 'rotationSpeed', -5, 5);
    }

    addToUpdateList(object) {
        this.state.updateList.push(object);
    }

    update(timeStamp) {
        const { rotationSpeed, updateList } = this.state;
        // this.rotation.y = (rotationSpeed * timeStamp) / 10000;

        // Call update for each object in the updateList
        for (const obj of updateList) {
            obj.update(timeStamp);
        }

        // Update terrain based on cat's position
        const cat = this.getObjectByName('cat');
        if (cat && this.generator) {
            this.generator.update(cat.position);
        }
    }
}

export default SeedScene;
