/**
 * app.js
 *
 * This is the first file loaded. It sets up the Renderer,
 * Scene and Camera. It also starts the render loop and
 * handles window resizes.
 *
 */
import { WebGLRenderer, PerspectiveCamera, Vector3 } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { SeedScene } from 'scenes';
import './styles.css';

//----------------------------------------------------------------------

// Create GUI screens

// Loading screen
const loadingScreen = document.createElement('div');
loadingScreen.id = 'loading-screen';
loadingScreen.innerHTML = `
    <div id="text-holder">
        <h1>
            Kitty Kourier!
        </h1>
        <h2>
            How to Play:
        </h2>
        <h3>
            You are controlling Bridget the kitty, who delivers packages
            all over town!<br/>
            Use <i>WASD</i> to move and <i>Shift</i> to
            sprint.<br/>
            A red arrow will point you towards a point of interest
            (POI), which will be the location of a package you
            have to collect or a destination you must
            deliver the package.<br/>
            You pick up packages and deliver them by simply
            getting within the radius of the POI.<br/>
            Have fun, and do not get hit by a car!
        </h3>
        <h4>
            Loading assets...
        </h4>
    </div>
`;
document.body.appendChild(loadingScreen);

// Score board 
const scoreBoard = document.createElement('div');
scoreBoard.id = 'score-board';
scoreBoard.innerHTML = `
    <p>Packages Delivered: <span id="current-score">0</span></p>
`;
document.body.appendChild(scoreBoard);

// Game over screeen
const gameOver = document.createElement('div');
gameOver.id = 'game-over-screen';
gameOver.innerHTML = `
    <div id="text-holder">
        <h1>
            Game Over!
        </h1>
        <h2>
            Bridget got hit by a car... :(
        </h2>
        <h3>
            Packages delivered: <span id="final-score">0</span>
        </h3>
        <h4>
            <button id="end-button">Restart Game</button>
        </h4>
    </div>
`;
document.body.appendChild(gameOver);

//----------------------------------------------------------------------

// Initialize core ThreeJS components
const camera = new PerspectiveCamera();
const scene = new SeedScene(camera);
const renderer = new WebGLRenderer({ antialias: true });

// Set up camera
camera.position.set(0, 8, -30);

// Set up renderer, canvas, and minor CSS adjustments
renderer.setPixelRatio(window.devicePixelRatio);
const canvas = renderer.domElement;
canvas.style.display = 'block'; // Removes padding below canvas
document.body.style.margin = 0; // Removes margin around page
document.body.style.overflow = 'hidden'; // Fix scrolling
document.body.appendChild(canvas);

// Set up controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = 4;
controls.maxDistance = 16;
controls.update();

// Render loop
const onAnimationFrameHandler = (timeStamp) => {
    // Make camera follow cat
    const cat = scene.getObjectByName('cat');
    if (cat) {
        // Configure OrbitControls to follow cat
        controls.target.set(
            cat.position.x,
            6,
            cat.position.z
        );
    }
    // Ensure camera doesn't go below origin
    if (camera.position.y < 1) camera.position.y = 1;

    controls.update();
    renderer.render(scene, camera);
    scene.update && scene.update(timeStamp);
    window.requestAnimationFrame(onAnimationFrameHandler);
};
window.requestAnimationFrame(onAnimationFrameHandler);

// Resize Handler
const windowResizeHandler = () => {
    const { innerHeight, innerWidth } = window;
    renderer.setSize(innerWidth, innerHeight);
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
};
windowResizeHandler();
window.addEventListener('resize', windowResizeHandler, false);
