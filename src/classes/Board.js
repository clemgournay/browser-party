import * as THREE from '../vendor/three/three.module.js';
import { FBXLoader } from '../vendor/three/loaders/FBXLoader.js';

import { Controls } from './Controls.js';

class Board {
    
    constructor(game) {
        this.game = game;
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 1, 1000);
        this.scene = new THREE.Scene();
        this.controls = new Controls(this.game);
        this.gameObjects = {};
        this.textures = {};
        this.mainCharacter = new THREE.Group();
        this.loader = new THREE.LoadingManager();
        this.characters = {};
        this.clock = new THREE.Clock();
        this.cases = [];
        this.currentCase = 0;
        this.score = 1;
        this.distance = new THREE.Vector3();
        this.finnishedMoveToNextCase = null;
        this.moving = false;
    }

    load(callback) {
        this.loader.onStart = (url, itemsLoaded, itemsTotal) => {
            console.log('Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');
        }

        this.loader.onLoad = () => {
            callback();
        }

        this.loader.onProgress = (url, itemsLoaded, itemsTotal) => {
            console.log( 'Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );
        }

        this.loader.onError = () => {
            console.log('error')
        }

        const fbxLoader = new FBXLoader(this.loader);
        fbxLoader.load('./assets/models/Board.fbx', (obj) => {
            this.gameObjects.board = obj;
        });

        this.textures.dice = [];
        const textureLoader = new THREE.TextureLoader(this.loader);
        textureLoader.load('./assets/textures/dice/1.png', (texture) => {
            this.textures.dice.one = texture;
        });
        textureLoader.load('./assets/textures/dice/2.png', (texture) => {
            this.textures.dice.two = texture;
        });
        textureLoader.load('./assets/textures/dice/3.png', (texture) => {
            this.textures.dice.three = texture;
        });
        textureLoader.load('./assets/textures/dice/4.png', (texture) => {
            this.textures.dice.four = texture;
        });
        textureLoader.load('./assets/textures/dice/5.png', (texture) => {
            this.textures.dice.five = texture;
        });
        textureLoader.load('./assets/textures/dice/6.png', (texture) => {
            this.textures.dice.six = texture;
        });

    }

    build() {

        this.controls.init();

        this.buildLights();
        this.buildBoardOBJ();
        this.buildCase(9.9, 1, 6.9);
        this.buildCase(9.9, 1, 3.9);
        this.buildCase(8, 1, 3.9);
        this.buildCase(5.3, 1, 3.9);
        this.buildCase(3.3, 1, 3.9);
        this.buildCase(2.3, 1, 3.9);
        this.buildCase(1.3, 1, 3.9);
        this.buildCase(0.3, 1, 3.9);
        this.buildCase(-1.3, 1, 3.9);
        this.buildCase(-2.3, 1, 3.9);
        this.buildCase(-3.3, 1, 3.9);
        this.buildCase(-4.3, 1, 3.9);
        this.buildCase(-5.3, 1, 3.9);

        this.createMainCharacter();
        this.buildDice();

        this.renderer = new THREE.WebGLRenderer({antialias: true});
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);

        this.events();

    }

    buildDice() {

        const materials = [
            new THREE.MeshLambertMaterial({map: this.textures.dice.three}),
            new THREE.MeshLambertMaterial({map: this.textures.dice.five}),
            new THREE.MeshLambertMaterial({map: this.textures.dice.one}),
            new THREE.MeshLambertMaterial({map: this.textures.dice.six}),
            new THREE.MeshLambertMaterial({map: this.textures.dice.two}),
            new THREE.MeshLambertMaterial({map: this.textures.dice.four})
        ];
        const geo = new THREE.BoxGeometry(0.2, 0.2, 0.2);
        this.gameObjects.dice = new THREE.Mesh(geo, materials);
        this.gameObjects.dice.position.set(10, 2.5, 8);
        this.scene.add(this.gameObjects.dice);
    }

    createMainCharacter() {
        const geo = new THREE.BoxGeometry(0.5, 0.5, 0.5);
        const mat = new THREE.MeshLambertMaterial({color: 'lightblue'});
        this.mainCharacter = new THREE.Mesh(geo, mat);
        this.mainCharacter.position.set(10, 1.5, 8);
        this.scene.add(this.mainCharacter);
    }


    buildLights() {
        const ambient = new THREE.AmbientLight(0xfffffff, 0.2);
        this.scene.add(ambient);

        const light = new THREE.PointLight(0xffffff, 0.8);
        light.position.set(10, 10, 10);
        light.castShadow = true;
        this.scene.add(light);
    }

    buildBoardOBJ() {
        this.gameObjects.board.traverse((child) => {
            child.castShadows = true;
            child.receiveShadows = true;
            child.material = new THREE.MeshLambertMaterial({color: 'darkgrey'});
        });
        this.gameObjects.board.rotation.y = Math.PI;
        this.scene.add(this.gameObjects.board);
    }

    buildCase(x, y, z) {
        const geo = new THREE.SphereGeometry(0.3, 32, 32);
        const mat = new THREE.MeshToonMaterial({color: 'blue'});
        const mesh = new THREE.Mesh(geo, mat);
        mesh.scale.set(1, 0.3, 1);
        mesh.position.set(x, y, z);
        this.cases.push(mesh);
        this.scene.add(mesh);
    }

    moveToCase(index) {
        this.moveToNextCase(() => {
            if (index === 0) {
                console.log('goal')
            } else {
                this.moveToCase(index-1)
            }
        });
    }

    moveToNextCase(callback) {
        this.moving = true;
        this.finnishedMoveToNextCase = callback;
        this.updateMoveToNextCase();
    }

    updateMoveToNextCase() {
        const currentPosition = this.mainCharacter.position;
        const nextCase = this.cases[this.currentCase];
        this.distance = new THREE.Vector3(
            nextCase.position.x - currentPosition.x+0.1,
            nextCase.position.y - currentPosition.y+0.5,
            nextCase.position.z - currentPosition.z
        );
    }

    update() {

        const delta = this.clock.getDelta();

        if (this.moving) {
            const x = Math.abs(parseFloat(this.distance.x).toFixed(1));
            const y = Math.abs(parseFloat(this.distance.y).toFixed(1));
            const z = Math.abs(parseFloat(this.distance.z).toFixed(1));

            if (x !== 0 || y !== 0 || z !== 0) {
                this.mainCharacter.translateX(this.distance.x * delta * 2);
                this.mainCharacter.translateY(this.distance.y * delta * 2);
                this.mainCharacter.translateZ(this.distance.z * delta * 2);
                this.updateMoveToNextCase();
            } else {
                this.moving = false;
                this.currentCase++;
                this.finnishedMoveToNextCase();
            }
        }

        if (this.game.diceRolling) {
            const speedX = Math.floor(Math.random() * 4) + 2;
            const speedY = Math.floor(Math.random() * 5) + 2;
            const speedZ = Math.floor(Math.random() * 6) + 2;
            this.gameObjects.dice.rotation.x += Math.PI * speedX * delta;
            this.gameObjects.dice.rotation.y += Math.PI * speedY *  delta;
            this.gameObjects.dice.rotation.z += Math.PI * speedZ * delta;
        }

        const relativeCameraOffset = new THREE.Vector3(1, 2, 1);

        const cameraOffset = relativeCameraOffset.applyMatrix4(this.mainCharacter.matrixWorld);

        this.camera.position.x = cameraOffset.x;
        this.camera.position.y = cameraOffset.y;
        this.camera.position.z = cameraOffset.z;
        this.camera.lookAt(this.mainCharacter.position);

        this.renderer.render(this.scene, this.camera);

    }

    getDiceResult () {
        const dice = this.gameObjects.dice;
        const faces = dice.geometry.faces;
        const vertices = dice.geometry.vertices;

        let faceIndex = 0;
        let highestY = vertices[faces[0].b].y;
        let highestFace = 0;
        for (let i = 0; i < faces.length; i+=2) {
            const faceA = faces[i];
            const faceB = faces[i+1];
            const maxFaceA = Math.max(vertices[faceA.a].y, vertices[faceA.b].y, vertices[faceA.c].y);
            const maxFaceB = Math.max(vertices[faceB.a].y, vertices[faceB.b].y, vertices[faceB.c].y);
            const max = Math.max(maxFaceA, maxFaceB);
            if (max >= highestY) {
                highestY = max;
                highestFace = faceIndex;
            }
            faceIndex++;
        }
        console.log(faceIndex);
    }
    
    events() {
        window.addEventListener('resize', () => {
            this.resize();
        }, false);
    }

    resize() {
        this.camera.aspect = window.innerWidth/window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

}

export { Board };