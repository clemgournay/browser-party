import * as THREE from '../vendor/three/three.module.js';

class Animator {

    constructor (game0) {
        this.game = game;
        this.mixers = {};
        this.animations = {};
    }

    create(id, model) {
        this.mixer = new THREE.AnimationMixer(model);
        this.animations[id] = {};
    }

    addAnimation(id, action, index) {
        this.animations[id][action] = this.mixers[id].clipAction(this.mixer._root.animations[index]);
    }

    play(id, action) {
        this.animations[id][action].play();
    }

    prepareCrossFade(id, startAction, endAction, duration) {
        const startClip = this.animations[id][startAction];
        const endClip = this.animations[id][endAction];
		this.unPauseAllActions(id);
        if (startClip === this.animations[id].idle) {
            this.executeCrossFade(startClip, endClip, duration);
        } else {
            this.synchronizeCrossFade(id, startClip, endClip, duration);
        }
    }

    unPauseAllActions(id) {
        for (var action in this.animations[id]) {
            this.animations[id][action].paused = false;
        }
    }

    executeCrossFade(startClip, endClip, duration) {
        this.setWeight(endClip, 1);
        endClip.time = 0;
        startClip.crossFadeTo(endClip, duration, true);
    }


    synchronizeCrossFade(id, startClip, endClip, duration) {
        const onLoopFinished = (e) => {
            if (e.action === startClip) {
                this.mixers[id].removeEventListener('loop', onLoopFinished);
                this.executeCrossFade(startClip, endClip, duration);
            }
        }
        this.mixers[id].addEventListener( 'loop', (e) => {
            onLoopFinished(e);
        });
    }


    setWeight(clip, weight) {
        clip.enabled = true;
        clip.setEffectiveTimeScale(1);
        clip.setEffectiveWeight(weight);
    }


}