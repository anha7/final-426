import * as Dat from 'dat.gui';
import { Scene, Color, Vector3, TextureLoader, EquirectangularReflectionMapping } from 'three';
import { Cat, City, Generator } from 'objects';
import { Game } from './index.js';
import { BasicLights } from 'lights';
import SKY from './sky.png';

class SeedScene extends Scene {
    constructor() {
        // Call parent Scene() constructor
        super();

        // Init state
        this.state = {
            // gui: new Dat.GUI(), // Create GUI for scene
            rotationSpeed: 1,
            updateList: [],
        };

        // Set background to a nice color
        this.background = new Color(0x7ec0ee);

        // Add meshes to scene
        const cat = new Cat();
        const lights = new BasicLights();
        this.add(cat, lights);
        this.addToUpdateList(cat);

        // Manage city assets, terrain generation, and game loop
        this.assetManager = new City(() => {
            // Initialize terrain generator and add to scene
            this.generator = new Generator(this.assetManager);
            this.add(this.generator);
            // Generate initial chunks of terrain
            this.generator.update(new Vector3(0, 0, 0));

            // Manage game and start first delivery
            this.game = new Game(this, this.generator, cat);
            this.game.spawnParcel();
        });

        // Initialize texture loader
        const loader = new TextureLoader();
        // Load sky image to serve as background
        loader.load(
            SKY,
            (texture) => {
                texture.mapping = EquirectangularReflectionMapping;
                this.background = texture;
            }
        );

        // // Populate GUI
        // this.state.gui.add(this.state, 'rotationSpeed', -5, 5);
    }

    addToUpdateList(object) {
        this.state.updateList.push(object);
    }

    update(timeStamp) {
        const { rotationSpeed, updateList } = this.state;
        // this.rotation.y = (rotationSpeed * timeStamp) / 10000;

        // Get reference to cat
        const cat = this.getObjectByName('cat');
        // Ensure cat gets set of collidable objects
        if (cat && this.generator) {
            cat.collidableObjects = this.generator.collidableObjects;
            this.generator.update(cat.position);
        }

        // Update game
        if (this.game) this.game.update();

        // Call update for each object in the updateList
        for (const obj of updateList) {
            obj.update(timeStamp);
        }
    }
}

export default SeedScene;
