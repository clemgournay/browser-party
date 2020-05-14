import * as THREE from '../vendor/three/three.module.js';
import { FBXLoader } from '../vendor/three/loaders/FBXLoader.js';

import { Controls } from './Controls.js';
import { Animator } from './Animator.js';

class Board {
    
    constructor(game) {
        this.game = game;
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 1, 1000);
        this.scene = new THREE.Scene();
        this.controls = new Controls(this.game);
        this.animator = new Animator(this.game);
        this.gameObjects = {};
        this.textures = {};
        this.mainCharacter = new THREE.Group();
        this.loader = new THREE.LoadingManager();
        this.characters = {};
        this.clock = new THREE.Clock();
        this.cases = [];
        this.currentCase = 0;
        this.score = 1;
        this.mixer = null;
        this.animations = {};
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


        fbxLoader.load('./assets/models/Character.fbx', (obj) => {
            this.mainCharacter = obj;
            console.log(obj);
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
        this.buildCase(10.4, 0.6, -9.5);
        this.buildCase(10.4, 0.6, -8.5);
        this.buildCase(10.4, 0.6, -7.5);
        this.buildCase(10.4, 0.6, -6.5);
        this.buildCase(10.4, 0.6, -5.5);
        this.buildCase(10.4, 0.6, -4.5);
        this.buildCase(9.4, 0.6, -4.5);
        this.buildCase(8.4, 0.6, -4.5);
        this.buildCase(7.4, 0.6, -4.5);

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
        const geo = new THREE.BoxGeometry(0.15, 0.15, 0.15);
        this.gameObjects.dice = new THREE.Mesh(geo, materials);
        const charPos = this.mainCharacter.position.clone();
        this.gameObjects.dice.position.set(charPos.x, 10, charPos.z);
        this.scene.add(this.gameObjects.dice);
    }

    createMainCharacter() {
        this.mainCharacter.traverse((child) => {
            child.castShadows = true;
            child.receiveShadows = true;
        });

        this.animator.create('main-char', this.mainCharacter);
        this.animator.addAnimation('main-char', 'idle', 2, 1, true);
        this.animator.addAnimation('main-char', 'run', 0, 0, true);
        this.animator.addAnimation('main-char', 'jump', 3, 0, false);

        this.mainCharacter.scale.set(0.0045, 0.0045, 0.0045);
        this.mainCharacter.position.set(10.4, 0.6, -10);
        this.mainCharacter.lookAt(this.cases[this.currentCase].position);
        this.scene.add(this.mainCharacter);

    }


    buildLights() {
        const ambient = new THREE.AmbientLight(0xfffffff, 0.2);
        this.scene.add(ambient);

        const light = new THREE.PointLight(0xffffff, 0.9);
        light.position.set(12, 10, -10);
        light.castShadow = true;
        this.scene.add(light);
    }

    buildBoardOBJ() {
        this.gameObjects.board.traverse((child) => {
            child.castShadows = true;
            child.receiveShadows = true;
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
                const charPos = this.mainCharacter.position.clone();
                this.gameObjects.dice.position.set(charPos.x, 10, charPos.z);
                this.game.mainPlayer.moveInProgress = false;
                this.showDice();
            } else {
                this.moveToCase(index-1)
            }
        });
    }

    moveToNextCase(callback) {

        this.animator.playFade('main-char', 'run', 0.5, () => {
            
        })
        /*this.animations.mainCharacter.jumping.crossFadeTo(this.animations.mainCharacter.running, 0.5, true);
        setTimeout(() => {
            this.animations.mainCharacter.jumping.stop();
        }, 500);*/

        let position = this.mainCharacter.position.clone();
        const nextCase = this.cases[this.currentCase];

        const moveAnim = new TWEEN.Tween(position).to({x: nextCase.position.x, y: nextCase.position.y+0.1, z: nextCase.position.z}, 600);
        moveAnim.onUpdate(() => {
            this.mainCharacter.position.set(position.x, position.y, position.z);
        });
        moveAnim.onComplete(() => {
            this.animator.playFade('main-char', 'idle', 0.5, () => {

            });
            /*this.animations.mainCharacter.running.stop();
            this.animations.mainCharacter.running.playing = false;
            this.animations.mainCharacter.idle.play();
            this.animations.mainCharacter.idle.playing = true;*/
            this.currentCase++;
            callback();
        });
        moveAnim.start();

        const startRotation = new THREE.Euler().copy(this.mainCharacter.rotation);
        this.mainCharacter.lookAt(nextCase.position);
        const endRotation = new THREE.Euler().copy(this.mainCharacter.rotation);

        if (endRotation._y !== startRotation._y) {
            this.mainCharacter.rotation.copy(startRotation);
            let rotation = {y: startRotation._y};

            const rotationAnim = new TWEEN.Tween(rotation).to({y: endRotation._y}, 300);
            rotationAnim.onUpdate(() => {
                this.mainCharacter.rotation.y = rotation.y;
            });
            rotationAnim.start();
        }
        
    }

    showDice() {
        let position = this.gameObjects.dice.position.clone();
        const anim = new TWEEN.Tween(position).to({x: position.x, y: this.mainCharacter.position.y+1.1, z: position.z}, 1000).easing(TWEEN.Easing.Quadratic.Out);
        anim.onUpdate(() => {
            this.gameObjects.dice.position.set(position.x, position.y, position.z);
        });
        anim.onComplete(() => {
            this.game.diceRolling = true;
        });
        anim.start();
    }

    hideDice() {
        let position = this.gameObjects.dice.position.clone();
        const anim = new TWEEN.Tween(position).to({x: position.x, y: 10, z: position.z}, 1000).easing(TWEEN.Easing.Quadratic.In);
        anim.onUpdate(() => {
            this.gameObjects.dice.position.set(position.x, position.y, position.z);
        });
        anim.onComplete(() => {
        });
        anim.start();
    }

    hitDice() {

        /*this.animator.playFade('main-char', 'jump', 0.5, true, () => {

        });*/
        setTimeout(() => {
            this.game.diceRolling = false;
            const score = Math.floor(Math.random() * 6) + 1;
            this.showDiceResult(score);
        }, 500);
        //this.prepareCrossFade(this.animations.mainCharacter.idle, this.animations.mainCharacter.jumping);
        /*this.animations.mainCharacter.idle.crossFadeTo(this.animations.mainCharacter.jumping, 1, true);
        setTimeout(() => {
            //this.animations.mainCharacter.idle.stop();
            //this.animations.mainCharacter.jumping.play();
            setTimeout(() => {
                this.animations.mainCharacter.jumping.crossFadeTo(this.animations.mainCharacter.idle, 0.5, true);
                this.game.diceRolling = false;
                const score = Math.floor(Math.random() * 6) + 1;
                this.showDiceResult(score);
                setTimeout(() => {
                    this.animations.mainCharacter.jumping.stop();
                }, 500);
            }, 1000);
        }, 500);*/
        /*this.animations.mainCharacter.idle.stop();
        this.animations.mainCharacter.idle.playing = false;
        this.animations.mainCharacter.jumping.play();
        this.animations.mainCharacter.jumping.playing = true;*/

        /*;*/
        
    }
    
    update(time) {

        const delta = this.clock.getDelta();

        if (this.game.diceRolling) {
            this.gameObjects.dice.rotation.x += Math.PI * 3 * delta;
            this.gameObjects.dice.rotation.y += Math.PI * 3 *  delta;
            this.gameObjects.dice.rotation.z += Math.PI * 3 * delta;
        }

        const relativeCameraOffset = new THREE.Vector3(-150, 350, -250);

        const cameraOffset = relativeCameraOffset.applyMatrix4(this.mainCharacter.matrixWorld);

        this.camera.position.x = cameraOffset.x;
        this.camera.position.y = cameraOffset.y;
        this.camera.position.z = cameraOffset.z;
        this.camera.lookAt(this.mainCharacter.position);

        this.animator.update(delta);
        this.renderer.render(this.scene, this.camera);

        TWEEN.update(time);

    }

    showDiceResult(score) {
        console.log(score);

        const startRotation = new THREE.Euler().copy(this.gameObjects.dice.rotation);

        this.gameObjects.dice.lookAt(this.camera.position);

        switch (score) {
            case 1:
                this.gameObjects.dice.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI/2);
                break;
            case 2:
                break;
            case 3:
                this.gameObjects.dice.rotateOnAxis(new THREE.Vector3(0, -1, 0), Math.PI/2);
            break;
            case 4:
                this.gameObjects.dice.rotateOnAxis(new THREE.Vector3(0, 1, 0), Math.PI);
                break;
            case 5:
                this.gameObjects.dice.rotateOnAxis(new THREE.Vector3(0, 1, 0), Math.PI/2);
                break;
            case 6:
                this.gameObjects.dice.rotateOnAxis(new THREE.Vector3(-1, 0, 0), Math.PI/2);
                break;
        }

        const endRotation = new THREE.Euler().copy(this.gameObjects.dice.rotation);
        this.gameObjects.dice.rotation.copy(startRotation);

        let rotation = {x: startRotation._x, y: startRotation._y, z: startRotation._z};
        const anim = new TWEEN.Tween(rotation).to({x: endRotation._x, y: endRotation._y, z: endRotation._z}, 300).easing(TWEEN.Easing.Quadratic.In);
        anim.onUpdate(() => {
            this.gameObjects.dice.rotation.set(rotation.x, rotation.y, rotation.z);
        });
        anim.onComplete(() => {
            setTimeout(() => {
                this.hideDice();
            }, 500);
            setTimeout(() => {
                this.moveToCase(score-1);
            }, 1000);
        });
        anim.start();
        
    
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