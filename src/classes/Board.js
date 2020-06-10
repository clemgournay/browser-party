import * as THREE from '../vendor/three/three.module.js';
import { FBXLoader } from '../vendor/three/loaders/FBXLoader.js';

import { Controls } from './Controls.js';
import { Animator } from './Animator.js';
import { Case } from './Case.js';

import { cloneFbx } from '../utils/3d.js';

class Board {
    
    constructor(game) {
        this.game = game;
        this.name = null;
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 1, 1000);
        this.scene = new THREE.Scene();
        this.controls = new Controls(this.game);
        this.animator = new Animator(this.game);
        this.gameObjects = {};
        this.textures = {};
        this.models = {characters: {}};
        this.mainCharacter = new THREE.Group();
        this.loader = new THREE.LoadingManager();
        this.characters = {};
        this.clock = new THREE.Clock();
        this.cases = [];
        this.score = 0;
        this.starPrice = 0;
        this.blueCaseValue = 0;
        this.redCaseValue = 0;
        this.enteredInBoard = false;
        this.nextAction = null;
    }

    load(callback) {

        $.get('./assets/boards/1.json', (board) => {

            this.name = board.name;
            this.starPrice = board.starPrice;
            this.redCaseValue = board.redCaseValue;
            this.blueCaseValue = board.blueCaseValue;

            board.cases.forEach((block) => {
                const theBlock = [];
                block.forEach((way) => {
                    const theWay = [];
                    way.forEach((caseData) => {
                        theWay.push(new Case(this.game, caseData.type, {x: caseData.x, y: caseData.y, z: caseData.z}));
                    });
                    theBlock.push(theWay);
                });
                this.cases.push(theBlock);
            });
            console.log('[BOARD]', this.cases);

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
                this.models.characters.basic = obj;
            });
            fbxLoader.load('./assets/models/Character.fbx', (obj) => {
                this.models.characters.basic2 = obj;
            });

            fbxLoader.load('./assets/models/Arrow.fbx', (obj) => {
                this.models.arrow = obj;
                this.gameObjects.arrows = [];
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

        });

    }

    build() {

        this.controls.init();

        this.buildLights();
        this.buildBoardOBJ();
        this.buildCases();
        //this.newCharacter(this.game.mainPlayer);
        this.buildDice();

        this.renderer = new THREE.WebGLRenderer({antialias: true});
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);

        this.events();

    }

    buildCases() {
        this.cases.forEach((block) => {
            block.forEach((way) => {
                way.forEach((theCase) => {
                    let color;
                    switch (theCase.type) {
                        case 'blue':
                            color = 'blue';
                            break;
                        case 'red':
                            color = 'darkred';
                            break;
                        case 'star':
                            color = 'yellow';
                            break;
                    }
                    const geo = new THREE.SphereGeometry(0.3, 32, 32);
                    const mat = new THREE.MeshToonMaterial({color: color});
                    const mesh = new THREE.Mesh(geo, mat);
                    mesh.scale.set(1, 0.3, 1);
                    mesh.position.set(theCase.position.x, theCase.position.y, theCase.position.z);
                    theCase.mesh = mesh;
                    this.scene.add(mesh);
                });
            });
        });
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

    newCharacter(player) {

        const isMainPlayer = (player.constructor.name === 'MainPlayer');
        const character = isMainPlayer ? this.models.characters.basic : this.models.characters.basic2;
        character.traverse((child) => {
            child.castShadows = true;
            child.receiveShadows = true;
            //if (!isMainPlayer) child.material.color = 'red';
        });
        this.animator.create(player.id, character);
        this.animator.addAnimation(player.id, 'idle', 2, 1, true);
        this.animator.addAnimation(player.id, 'run', 0, 0, true);
        this.animator.addAnimation(player.id, 'jump', 3, 0, false);

        character.scale.set(0.0045, 0.0045, 0.0045);
        const pos = player.position;
        //const case = this.cases[pos.block][pos.way][pos.case].position;
        const offset = player.order * 1;
        character.position.set(10.4 + offset, 0.7, -10);
        if (!isMainPlayer) character.position.set(10.6, 0.7, -10);
        const nextPos = this.getNextCases(player)[0];
        const casePos = this.cases[nextPos.block][nextPos.way][nextPos.case].position;
        const lookPos = new THREE.Vector3(casePos.x, casePos.y+0.1, casePos.z);
        character.lookAt(lookPos);
        character.name = player.id;

        this.characters[player.id] = character;
        if (isMainPlayer) {
            this.mainCharacter = character;
        }

        this.scene.add(character);

    }

    newArrow(theCase, type) {
        if (!this.gameObjects.arrows) this.gameObjects.arrows = [];
        const arrow = this.models.arrow.clone();
        arrow.traverse((child) => {
            child.castShadows = true;
            child.receiveShadows = true;
        });
        const casePos = theCase.mesh.position;
        arrow.position.set(casePos.x, casePos.y+0.2, casePos.z);

        arrow.scale.set(0.015, 0.015, 0.015);
        if (type === 1) {
            arrow.rotation.y = Math.PI;
        }
        this.gameObjects.arrows.push(arrow);
        this.scene.add(arrow);

        let scale = {x: 0, y: 0, z: 0}
        const scaleAnim = new TWEEN.Tween(scale).to({x: 1, y: 1, z: 1}, 600);
        scaleAnim.onUpdate(() => {
            currentCharacter.scale.set(scale.x, scale.y, scale.z);
        });
    }

    moveCharacter(id, position) {
        this.characters[id].position.set(position.x, position.y, position.z);
    }

    removeCharacter(id) {
        this.scene.remove(this.characters[id]);
        delete this.characters[id];
    }

    buildLights() {
        const ambient = new THREE.AmbientLight(0xfffffff, 0.5);
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


    moveToCase(playerID, index) {
        this.moveToNextCase(playerID, () => {
            
            const currentPlayer = this.game.players[playerID];
            const pos = currentPlayer.position;
            const theCase = this.cases[pos.block][pos.way][pos.case];
            
            const currentCharacter = this.characters[playerID];

            if (index === 0) {
                console.log('goal')
                
                this.animator.playFade(playerID, 'idle', 0.2);
                theCase.action(() => {
                    const charPos = currentCharacter.position.clone();
                    this.gameObjects.dice.position.set(charPos.x, 10, charPos.z);
                    currentPlayer.moveInProgress = false;
                    this.showDice();
                });
            } else {

                if (theCase.actionImmediate && theCase.action) {
                    this.animator.playFade(playerID, 'idle', 0.2);
                    theCase.action(() => {
                        this.moveToCase(playerID, index-1);
                    });
                } else {
                    this.moveToCase(playerID, index-1);
                }
            }
        });
    }

    getNextCases(player) {
        const pos = player.position;
        let nextBlockIndex = pos.block;
        let nextWayIndex = pos.way;
        let nextCaseIndex = pos.case + 1;
        const results = [];
        if (nextCaseIndex >= this.cases[nextBlockIndex][nextWayIndex].length) {
            nextCaseIndex = 0;
            nextBlockIndex++;
            if (nextBlockIndex >= this.cases.length) {
                nextBlockIndex = 0;
                nextWayIndex = 0;
            }
            for (let i = 0; i < this.cases[nextBlockIndex].length; i++) {
                results.push({block: nextBlockIndex, way: i, case: nextCaseIndex});
            };
        } else {
            results.push({block: nextBlockIndex, way: nextWayIndex, case: nextCaseIndex});
        }
        return results;
    }

    choseWay(nextPositions, callback) {
        for (let i = 0; i < nextPositions.length; i++) {
            const nextPosition = nextPositions[i];
            const nextCase = this.cases[nextPosition.block][nextPosition.way][nextPosition.case];0
            this.newArrow(nextCase, i);
        }
        
        const currentPlayer = this.game.currentPlayer;
        this.animator.playFade(currentPlayer.id, 'idle', 0.2);
        this.controls.setAction('left', this, () => {
            this.controls.removeJoystickAction('left');
            this.controls.removeJoystickAction('right');
            callback(1);
        });
        this.controls.setAction('right', this, () => {
            this.controls.removeAction('left');
            this.controls.removeAction('right');
            callback(0);
        });
    }

    moveToNextCase(playerID, richedNextCase) {
        
        const currentPlayer = this.game.players[playerID];
        
        const nextPositions = this.getNextCases(currentPlayer);
        if (nextPositions.length > 1) {
            if (playerID === this.game.mainPlayer.id) {
                this.choseWay(nextPositions, (resultIndex) => {
                    this.wayChosen(playerID, nextPositions, resultIndex, richedNextCase);
                    this.game.mainPlayerWayChose(resultIndex);
                });
            } else {
                console.log('SYNC');
                this.nextAction = {nextPositions: nextPositions, richedNextCase: richedNextCase};
            }
        } else {
            
            this.wayChosen(playerID, nextPositions, 0, richedNextCase);
        }
            
    }

    playerWayChosen(playerID, way) {
        this.wayChosen(playerID, this.nextAction.nextPositions, way, this.nextAction.richedNextCase);
    }

    callNextAction() {
        let paramStr = '';
        for (let i = 0; i < this.nextAction.params.length; i++) {
            paramStr += 'this.nextAction.params[' + i + ']';
            if (i < this.nextAction.params.length - 1) paramStr += ', ';
        }
        eval('this.nextAction.func(' + paramStr + ')');
    }

    wayChosen(playerID, nextPositions, resultIndex, richedNextCase) {

        const currentPlayer = this.game.players[playerID];
        if (this.animator.currentAnimations[currentPlayer.id] !== 'run') {
            this.animator.playFade(currentPlayer.id, 'run', 0.2);
        }

        this.gameObjects.arrows.forEach((arrow) => {
            this.scene.remove(arrow);
        });
        this.gameObjects.arrows = [];
        const nextPos = nextPositions[resultIndex];
        const currentCharacter = this.characters[playerID];
        const nextCase = this.cases[nextPos.block][nextPos.way][nextPos.case];
        const nextCasePos = nextCase.mesh.position;

        if (this.animator.currentAnimations[playerID] !== 'run') {
            this.animator.playFade(playerID, 'run', 0.2);
        }

        let position = currentCharacter.position.clone();
        const moveAnim = new TWEEN.Tween(position).to({x: nextCasePos.x, y: nextCasePos.y+0.1, z: nextCasePos.z}, 600);
        moveAnim.onUpdate(() => {
            currentCharacter.position.set(position.x, position.y, position.z);
        });
        moveAnim.onComplete(() => {
            currentPlayer.updatePosition(nextPos);
            if (currentPlayer.position.case >= 0) this.enteredInBoard = true;
            richedNextCase();
        });
        moveAnim.start();

        if (this.enteredInBoard) {
  
            const prevPos = currentPlayer.prevPosition;
            const curPos = currentPlayer.position;
            const prevCase = this.cases[prevPos.block][prevPos.way][prevPos.case];
            const curCase = this.cases[curPos.block][curPos.way][curPos.case];
            const prevCasePos = prevCase.mesh.position;
            const curCasePos = curCase.mesh.position;
        
            const ab = new THREE.Vector3(curCasePos.x - prevCasePos.x, curCasePos.y - prevCasePos.y, curCasePos.z - prevCasePos.z);
            const bc = new THREE.Vector3(nextCasePos.x - curCasePos.x, nextCasePos.y - curCasePos.y, nextCasePos.z - curCasePos.z);
            
            let angle = ab.angleTo(bc)
            if (resultIndex === 0) angle = -angle;
            if (angle !== 0) {
                this.rotateCharacter(currentCharacter, angle);
            }
        }
    }

    rotateCharacter(character, angle) {
        let rotation = character.rotation;
        const endRotation = {y: character.rotation.y + angle};
        const rotationAnim = new TWEEN.Tween(rotation).to(endRotation, 300);
        rotationAnim.onUpdate(() => {
            character.rotation.y = rotation.y;
        });
        rotationAnim.start();
    }

    showDice() {
        const currentPlayer = this.game.currentPlayer;
        const currentCharacter = this.characters[currentPlayer.id];
        let position = this.gameObjects.dice.position.clone();
        const anim = new TWEEN.Tween(position).to({x: position.x, y: currentCharacter.position.y+1.1, z: position.z}, 1000).easing(TWEEN.Easing.Quadratic.Out);
        anim.onUpdate(() => {
            this.gameObjects.dice.position.set(position.x, position.y, position.z);
        });
        anim.onComplete(() => {
            this.controls.setAction('validate', this.game.mainPlayer, this.game.mainPlayer.stopDice);
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
        const id = this.game.mainPlayer.id;
        this.animator.playFade(id, 'jump', 0.2);
        setTimeout(() => {
            this.game.diceRolling = false;
            const score = Math.floor(Math.random() * 6) + 1;
            this.showDiceResult(id, score);
            this.game.mainPlayerHitDice(score);
        }, 500);
    }

    playerDiceHit(playerID, score) {
        this.game.diceRolling = false;
        this.showDiceResult(playerID, score);
    }
    
    update(time) {

        const delta = this.clock.getDelta();

        if (this.game.diceRolling) {
            this.gameObjects.dice.rotation.x += Math.PI * 2 * delta;
            this.gameObjects.dice.rotation.y += Math.PI * 2 *  delta;
            this.gameObjects.dice.rotation.z += Math.PI * 2 * delta;
        }

        const relativeCameraOffset = new THREE.Vector3(-150, 330, -250);

        const currentPlayer = this.game.currentPlayer;
        if (this.characters[currentPlayer.id]) {
            const currentCharacter = this.characters[currentPlayer.id];
            //const currentCharacter = this.characters[this.game.mainPlayer.id];

            const cameraOffset = relativeCameraOffset.applyMatrix4(currentCharacter.matrixWorld);

            this.camera.position.x = cameraOffset.x;
            this.camera.position.y = cameraOffset.y;
            this.camera.position.z = cameraOffset.z;
            this.camera.lookAt(currentCharacter.position);
        }

        this.animator.update(delta);
        this.renderer.render(this.scene, this.camera);

        TWEEN.update(time);

    }

    showDiceResult(playerID, score) {

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
                this.moveToCase(playerID, score-1);
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