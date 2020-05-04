import * as THREE from '../vendor/three/three.module.js';
import { OBJLoader } from '../vendor/three/loaders/OBJLoader.js';
import { Controls } from './Controls.js';

class Room {
    
    constructor(app) {
        this.app = app;
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 1, 1100);
        this.scene = new THREE.Scene();
        this.controls = new Controls();
        this.loader = new OBJLoader();
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
        this.buildRoomOBJ();

        this.fontLoader.load('assets/fonts/helvetiker.json', (font) => {
            this.font = font;
            this.newCharacter(this.app.mainUser);
        });

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

    buildRoomOBJ() {

        /*this.textureLoader.load(
            'assets/textures/metal.jpg',
            (texture) => {
                texture.wrapS = texture.wrapT = THREE.RepeatWrapping; 
                texture.repeat.set(20, 20);
                const material = new THREE.MeshBasicMaterial( {
                    map: texture, side: THREE.DoubleSide
                });*/
                const material = new THREE.MeshToonMaterial({color: 'grey', side: THREE.DoubleSide});
                const geometry = new THREE.PlaneGeometry(100, 100, 10, 10);
                const floor = new THREE.Mesh(geometry, material);
                floor.rotation.x = Math.PI / 2;
                this.scene.add(floor);
            /*},
            undefined,
            (err) => {
                console.error('An error happened.');
            }
        );*/

        this.buildWall('front');
        this.buildWall('back');
        this.buildWall('left');
        this.buildWall('right');

        const matRoof = new THREE.MeshToonMaterial({color: 0xffffff, side: THREE.DoubleSide});
        const geoRoof = new THREE.PlaneGeometry(100, 100, 10, 10);
        const roof = new THREE.Mesh(geoRoof, matRoof);
        roof.name = 'roof';
        roof.rotation.x = Math.PI / 2;
        roof.position.y = 15;
        this.scene.add(roof);

        this.loader.load(
            'assets/models/table.obj',
            (obj) => {
                obj.traverse((child) => {
                    if (child instanceof THREE.Mesh) {
                        child.material = new THREE.MeshToonMaterial({color: 'orange'});
                        const outline = child.clone();
                        outline.scale.set(1.02, 1.02, 1.02);
                        outline.material = new THREE.MeshBasicMaterial({color: 'black', side: THREE.BackSide});
                        obj.add(outline);
                        this.colliders.push(child);
                    }
                });
                obj.scale.set(1.5, 1.5, 1.5);
                obj.position.set(0, 0.1, 0);
                obj.name = 'table';
                this.scene.add(obj);
            },
            (xhr) => {
                console.log((xhr.loaded / xhr.total * 100) + '% loaded');
            },
            (error) => {
                console.log('An error happened');
            }
        );
    }

    buildWall(side) {
        let geo, pos;
        const mat = new THREE.MeshToonMaterial({color: 0xffffff});
        switch(side) {
            case 'front':
                geo = new THREE.BoxGeometry(100, 20, 2);
                pos = new THREE.Vector3(0, 5, -50);
                break;
            case 'back':
                geo = new THREE.BoxGeometry(100, 20, 2);
                pos = new THREE.Vector3(0, 5, 50);
                break;
            case 'left':
                geo = new THREE.BoxGeometry(2, 20, 100);
                pos = new THREE.Vector3(-50, 5, 0);
                break;
            case 'right':
                geo = new THREE.BoxGeometry(2, 20, 100);
                pos = new THREE.Vector3(50, 5, 0);
                break;
        }
        const wall = new THREE.Mesh(geo, mat);
        wall.position.set(pos.x, pos.y, pos.z);
        wall.name = 'wall-' + side;
        this.scene.add(wall);

        this.colliders.push(wall);
    }

    newCharacter(user) {
        const isMain = (user.constructor.name === 'MainUser');
        const character = new THREE.Group();

        this.textureLoader.load(user.avatar, (texture) => {
            const material = new THREE.MeshToonMaterial({
                map: texture
            });
            const geometry = new THREE.BoxGeometry(2, 2, 2);
            const mesh = new THREE.Mesh(geometry, material);
            character.add(mesh);
        });
        
        const outGeo = new THREE.BoxGeometry(2.1, 2.1, 2.1);
        const outMat = new THREE.MeshBasicMaterial({color : 0x0000000, side: THREE.BackSide});
        const outline = new THREE.Mesh(outGeo, outMat);
        character.add(outline);
        
        const textGeo = new THREE.TextGeometry(user.name, {
            font: this.font,
            size: 0.2,
            height: 0.2,
            curveSegments: 5,
            bevelEnabled: false,
            bevelThickness: 0.1,
            bevelSize: 0.1,
            bevelSegments: 0.1
        } );
        const txtMat = new THREE.MeshToonMaterial({color: 'white'});
        const txtMesh = new THREE.Mesh(textGeo, txtMat);
        const box = new THREE.Box3().setFromObject(txtMesh);
        const size = box.getSize();
        txtMesh.translateX(-(size.x / 2));
        txtMesh.translateZ(1);
        txtMesh.translateY(1.2);

        const txtOut = txtMesh.clone();
        txtOut.material = new THREE.MeshBasicMaterial({color: 'black', side: THREE.BackSide});
        txtOut.scale.set(1.05, 1.05, 1.05);
        txtOut.translateX(-0.02);
        
        character.add(txtMesh);
        character.add(txtOut);

        character.name = user.id;
        character.position.set(user.initPos.x, user.initPos.y, user.initPos.z);
        this.scene.add(character);

        if (isMain) {
            this.mainCharacter = character;
        } else {
            this.characters[user.id] = character;
        }
        
    }

    updateAvatar(user) {
        this.textureLoader.load(user.avatar, (texture) => {
            const character = this.scene.getObjectByName(user.id);
            const material = new THREE.MeshToonMaterial({
                map: texture
            });
            character.children[0].material = material;
        });
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

export { Room };