import * as THREE from '../vendor/three/three.module.js';
import { FBXLoader } from '../vendor/three/loaders/FBXLoader.js';
import { Controls } from './Controls.js';

class Room {
    
    constructor(app) {
        this.app = app;
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 1, 1100);
        this.scene = new THREE.Scene();
        this.controls = new Controls();
        this.textureLoader = new THREE.TextureLoader();
        this.fontLoader = new THREE.FontLoader();
        this.roomOBJ = new THREE.Group();
        this.font = null;
        this.mainCharacter = new THREE.Group();
        this.characters = {};
        this.raycaster = null;
        this.colliders = [];
        this.collisions = [];
        this.clock = new THREE.Clock();
        this.speed = 15;
        this.rotateSpeed = 2;
    }

    build() {

        this.controls.init();

        this.buildLights();
        this.buildBoardOBJ();

        this.renderer = new THREE.WebGLRenderer({antialias: true});
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);

        this.events();
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

        const material = new THREE.MeshToonMaterial({color: 'grey', side: THREE.DoubleSide});
        const geometry = new THREE.PlaneGeometry(100, 100, 10, 10);
        const floor = new THREE.Mesh(geometry, material);
        floor.rotation.x = Math.PI / 2;
        this.scene.add(floor);
    }

    newCharacter(user) {
        const isMain = (user.constructor.name === 'MainUser');
        const character = new THREE.Group();

        const material = new THREE.MeshToonMaterial({
            color: 'grey'
        });
        const geometry = new THREE.BoxGeometry(2, 2, 2);
        const mesh = new THREE.Mesh(geometry, material);
        character.add(mesh);

        character.name = user.id;
        this.scene.add(character);

        if (isMain) {
            this.mainCharacter = character;
        } else {
            this.characters[user.id] = character;
        }
        
    }

    moveCharacter(id, position) {
        this.characters[id].position.set(position.x, position.y, position.z);
    }

    rotateCharacter(id, rotation) {
        this.characters[id].rotateOnAxis(new THREE.Vector3(0, 1, 0), rotation);
    }

    removeCharacter(id) {
        this.scene.remove(this.characters[id]);
        delete this.characters[id];
    }

    collides() {
        const object = this.mainCharacter.children[0];
        let originPoint = this.mainCharacter.position.clone();
    
        let found = false, i = 0;
        while(!found && i < object.geometry.vertices.length) {
            const localVertex = object.geometry.vertices[i].clone();
            const globalVertex = localVertex.applyMatrix4(this.mainCharacter.matrix);
            const directionVector = globalVertex.sub(this.mainCharacter.position);
    
            const ray = new THREE.Raycaster(originPoint, directionVector.clone().normalize());
    
            const collisionResults = ray.intersectObjects(this.colliders);
            if (collisionResults.length > 0 && collisionResults[0].distance < directionVector.length()) {
                found = true;						
            } else {
                i++;
            }
        }
    
        return found;
    }

    update() {

        const delta = this.clock.getDelta();
	    const moveDistance = this.speed * delta;
        const rotateAngle = (Math.PI/2) * this.rotateSpeed * delta;

        if (this.mainCharacter.children.length > 0) {

            if (this.controls.actions.FORWARD) {
                this.mainCharacter.translateZ(-moveDistance);
                this.mainCharacter.updateMatrixWorld();
                if (this.collides()) this.mainCharacter.translateZ(moveDistance);
            }

            if (this.controls.actions.BACKWARD) {
                this.mainCharacter.translateZ(moveDistance);
                this.mainCharacter.updateMatrixWorld();
                if (this.collides()) this.mainCharacter.translateZ(-moveDistance);
            }
            if (this.controls.actions.SLIDE_LEFT) {
                this.mainCharacter.translateX(-moveDistance);
                this.mainCharacter.updateMatrixWorld();
                if (this.collides()) this.mainCharacter.translateX(moveDistance);
            }

            if (this.controls.actions.SLIDE_RIGHT) {
                this.mainCharacter.translateX(moveDistance);
                this.mainCharacter.updateMatrixWorld();
                if (this.collides()) this.mainCharacter.translateX(-moveDistance);
            }
                
            if (this.controls.actions.ROTATE_LEFT) {
                this.mainCharacter.rotateOnAxis(new THREE.Vector3(0,1,0), rotateAngle);
                this.mainCharacter.updateMatrixWorld();
                if (this.collides()) this.mainCharacter.rotateOnAxis(new THREE.Vector3(0,1,0), -rotateAngle);

                const rotation = this.app.mainUser.rotation;
                const currentRotation = this.mainCharacter.rotation.y;
                if (rotation !== currentRotation) {
                    this.app.updateRotation(-rotateAngle);
                }

            }

            if (this.controls.actions.ROTATE_RIGHT) {
                this.mainCharacter.rotateOnAxis(new THREE.Vector3(0,1,0), -rotateAngle);
                this.mainCharacter.updateMatrixWorld();
                if (this.collides()) this.mainCharacter.rotateOnAxis(new THREE.Vector3(0,1,0), rotateAngle);

                const rotation = this.app.mainUser.rotation;
                const currentRotation = this.mainCharacter.rotation.y;
                if (rotation !== currentRotation) {
                    this.app.updateRotation(rotateAngle);
                }
            }

            if (this.controls.actions.ROTATE_VALUE) {
                const maxValue = (window.innerWidth/2) - 100;
                const value = this.controls.actions.ROTATE_VALUE * 0.2;
                const rad = (value * (Math.PI/8)) / maxValue;
                this.mainCharacter.rotateOnAxis(new THREE.Vector3(0,1,0), rad);
            }
        }
        
        const relativeCameraOffset = new THREE.Vector3(0,2,5);

        const cameraOffset = relativeCameraOffset.applyMatrix4(this.mainCharacter.matrixWorld);

        this.camera.position.x = cameraOffset.x;
        this.camera.position.y = cameraOffset.y;
        this.camera.position.z = cameraOffset.z;
        this.camera.lookAt(this.mainCharacter.position);

        this.renderer.render(this.scene, this.camera);

        var x = this.mainCharacter.position.x;
        var y = this.mainCharacter.position.y;
        var z = this.mainCharacter.position.z;

        const pos = this.app.mainUser.position;
        if (x !== pos.x || y !== pos.y || z !== pos.z) {
            this.app.updatePosition({x: x, y: y, z: z});
        }

        
        
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