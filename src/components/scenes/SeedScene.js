import * as Dat from 'dat.gui';
import {
    Scene,
    Color,
    Vector3,
    TextureLoader,
    EquirectangularReflectionMapping,
    Audio,
    AudioListener,
    AudioLoader,
    NoToneMapping,
} from 'three';
import { Cat, City, Generator } from 'objects';
import { Game } from './index.js';
import { BasicLights } from 'lights';
import Sky from './sky.png';
// Music imports
import BackgroundMusic from './sound/background.mp3';
import ClickingNoise from './sound/click.mp3';
import CrashNoise from './sound/crash.mp3';
import DeliveryNoise from './sound/delivery.mp3';
import PackageNoise from './sound/package.mp3';
import FootstepsNoise from './sound/footsteps.mp3';
import HonkNoise from './sound/honk.mp3';

class SeedScene extends Scene {
    constructor(camera) {
        // Call parent Scene() constructor
        super();

        // Init state
        this.state = {
            // gui: new Dat.GUI(), // Create GUI for scene
            rotationSpeed: 1,
            updateList: [],
        };
        this.camera = camera;
        this.gameOver = false;

        // Set background to a nice color
        this.background = new Color(0x7ec0ee);

        // Add meshes to scene
        const cat = new Cat(this);
        const lights = new BasicLights();
        this.add(cat, lights);
        this.addToUpdateList(cat);

        // Initialize audioa
        const audioLoader = new AudioLoader();
        const listener = new AudioListener();
        this.muted = false;

        // Background music
        this.backgroundNoise = new Audio(listener);
        audioLoader.load(BackgroundMusic, (buffer) => {
            this.backgroundNoise.setBuffer(buffer);
            this.backgroundNoise.setLoop(true);
            this.backgroundNoise.setVolume(0.15);
        });

        // Clicking noise
        this.clickNoise = new Audio(listener);
        audioLoader.load(ClickingNoise, (buffer) => {
            this.clickNoise.setBuffer(buffer);
            this.clickNoise.setVolume(0.2);
        });

        // Car crash noise
        this.crashNoise = new Audio(listener);
        audioLoader.load(CrashNoise, (buffer) => {
            this.crashNoise.setBuffer(buffer);
            this.crashNoise.setVolume(0.2);
        });

        // Successful delivery noise
        this.deliveryNoise = new Audio(listener);
        audioLoader.load(DeliveryNoise, (buffer) => {
            this.deliveryNoise.setBuffer(buffer);
            this.deliveryNoise.setVolume(0.2);
        });

        // Package pick up noise
        this.packageNoise = new Audio(listener);
        audioLoader.load(PackageNoise, (buffer) => {
            this.packageNoise.setBuffer(buffer);
            this.packageNoise.setVolume(0.2);
        });

        // Footsteps noise
        this.footstepsNoise = new Audio(listener);
        audioLoader.load(FootstepsNoise, (buffer) => {
            this.footstepsNoise.setBuffer(buffer);
            this.footstepsNoise.setVolume(0.025);
        });

        // Car honking noise
        this.honkNoise = new Audio(listener);
        audioLoader.load(HonkNoise, (buffer) => {
            this.honkNoise.setBuffer(buffer);
            this.honkNoise.setVolume(0.05);
        });

        // Manage city assets, terrain generation, and game loop
        this.assetManager = new City(() => {
            // Initialize terrain generator and add to scene
            this.generator = new Generator(this.assetManager);
            this.add(this.generator);
            // Generate initial chunks of terrain
            this.generator.update(new Vector3(0, 0, 0));

            // Manage start screen
            const startScreen = document.getElementById('start-screen');
            startScreen.addEventListener('click', () => {
                // Hide start screen
                startScreen.style.display = 'none';
                startScreen.style.zIndex = -100;
                // Play background audio
                this.backgroundNoise.play();
            });

            // After assets load, introduce start game button
            const loadingText = document.querySelector('#loading-screen h4');
            loadingText.innerHTML =
                '<button id="start-button">Start Game</button>';

            // Manage start game button
            const startButton = document.getElementById('start-button');
            // If user clicks start game, start the game
            startButton.addEventListener('click', () => {
                // Play clicking noise
                this.clickNoise.play();

                // Hide loading screen
                const loadingScreen = document.getElementById('loading-screen');
                loadingScreen.style.display = 'none';

                // Show volume button
                const volumeButton = document.getElementById('volume');
                volumeButton.style.display = 'flex';
                // Toggle volume, ensure click noise always plays
                volumeButton.addEventListener('click', () => {
                    this.clickNoise.play();
                    if (this.muted) this.toggleAudio(volumeButton);
                    else setTimeout(() => { this.toggleAudio(volumeButton) }, 100);
                });

                // Show scoreboard
                const scoreboard = document.getElementById('score-board');
                scoreboard.style.display = 'flex';

                // Manage game and start first delivery
                this.game = new Game(
                    this,
                    this.assetManager,
                    this.generator,
                    cat,
                    this.camera
                );
                this.game.spawnParcel();
            });
        });

        // Initialize texture loader
        const loader = new TextureLoader();
        // Load sky image to serve as background
        loader.load(Sky, (texture) => {
            texture.mapping = EquirectangularReflectionMapping;
            this.background = texture;
        });

        // // Populate GUI
        // this.state.gui.add(this.state, 'rotationSpeed', -5, 5);
    }

    // Helper method to toggle audio
    toggleAudio(volumeButton) {
        if (this.muted) {
            volumeButton.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="-3 -3 30 30">
                    <path fill="white" d="M16 12c0 0 0 0 0 0c0 0 0 0 0 0Z">
                        <animate fill="freeze" attributeName="d" begin="0.4s" dur="0.2s" values="M16 12c0 0 0 0 0 0c0 0 0 0 0 0Z;M16 16c1.5 -0.71 2.5 -2.24 2.5 -4c0 -1.77 -1 -3.26 -2.5 -4Z"/>
                    </path>
                    <path fill="none" stroke="white" stroke-dasharray="32" stroke-dashoffset="32" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 10h3.5l3.5 -3.5v10.5l-3.5 -3.5h-3.5Z">
                        <animate fill="freeze" attributeName="stroke-dashoffset" dur="0.4s" values="32;0"/>
                    </path>
                </svg>
            `;
            this.muted = false;
            this.backgroundNoise.setVolume(0.15);
            this.clickNoise.setVolume(0.2);
            this.crashNoise.setVolume(0.2);
            this.deliveryNoise.setVolume(0.2);
            this.packageNoise.setVolume(0.2);
            this.footstepsNoise.setVolume(0.025);
            this.honkNoise.setVolume(0.05);
        } else {
            volumeButton.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="-3 -3 30 30">
                    <g fill="none" stroke="white" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
                        <path stroke-dasharray="32" stroke-dashoffset="32" d="M4 10h3.5l3.5 -3.5v10.5l-3.5 -3.5h-3.5Z">
                            <animate fill="freeze" attributeName="stroke-dashoffset" dur="0.4s" values="32;0"/>
                        </path>
                        <path stroke-dasharray="8" stroke-dashoffset="8" d="M16 10l4 4">
                            <animate fill="freeze" attributeName="stroke-dashoffset" begin="0.4s" dur="0.2s" values="8;0"/>
                        </path>
                        <path stroke-dasharray="8" stroke-dashoffset="8" d="M20 10l-4 4">
                            <animate fill="freeze" attributeName="stroke-dashoffset" begin="0.6s" dur="0.2s" values="8;0"/>
                        </path>
                    </g>
                </svg>
            `;
            this.muted = true;
            this.backgroundNoise.setVolume(0);
            this.clickNoise.setVolume(0);
            this.crashNoise.setVolume(0);
            this.deliveryNoise.setVolume(0);
            this.packageNoise.setVolume(0);
            this.footstepsNoise.setVolume(0);
            this.honkNoise.setVolume(0);
        }
    }

    // Helper method to unmute all audio
    unmuteAudio() {}

    addToUpdateList(object) {
        this.state.updateList.push(object);
    }

    update(timeStamp) {
        const { rotationSpeed, updateList } = this.state;
        // this.rotation.y = (rotationSpeed * timeStamp) / 10000;

        // If game is over, don't update anymore
        if (this.gameOver) return;

        // Get reference to cat
        const cat = this.getObjectByName('cat');
        // Ensure cat gets set of collidable objects
        if (cat && this.generator) {
            cat.collidableObjects = this.generator.collidableObjects;
            this.generator.update(cat.position);
        }

        // Update game
        if (this.game) this.game.update(timeStamp);

        // Call update for each object in the updateList
        for (const obj of updateList) {
            obj.update(timeStamp);
        }
    }
}

export default SeedScene;
