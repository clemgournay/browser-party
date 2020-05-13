import * as THREE from '../vendor/three/three.module.js';

class Animator {

    constructor (game) {
        this.game = game;
        this.mixers = {};
        this.animations = {};
        this.currentAnimations = {};
    }

    create(id, model) {
        this.mixers[id] = new THREE.AnimationMixer(model);
        this.animations[id] = {};
    }

    addAnimation(id, action, index, weight, loop) {
        this.animations[id][action] = this.mixers[id].clipAction(this.mixers[id]._root.animations[index]);
        this.animations[id][action].play();
        this.setWeight(id, action, weight);
        if (loop === false) this.animations[id][action].clampWhenFinished = true;
    }

    play(id, action) {
        this.animations[id][action].play();
    }

    playFade(id, endAction, duration, callback) {
        const startAction = this.currentAnimations[id];
        const endClip = this.animations[id][endAction]
        this.crossFade(id, startAction, endAction, dur);
        
        // If animation not loop, callback when animation finishes
        if (endClip.clampWhenFinished === true) {
            const totalDuration = (duration*1000) + (endClip._clip.duration * 1000);
            setTimeout(() => {
                    //this.setWeight(id, endAction, 0);
                    //this.playFade(id, startAction, duration);
            }, totalDuration);
        } else { // else, callback after animation cross fade
            setTimeout(() => {
                if (callback) callback();
            }, duration);
        }
        
    }

    update(delta) {
        for (const id in this.mixers) {
            this.mixers[id].update(delta);
        }
    }

    crossFade(id, startAction, endAction, duration) {
		this.unPauseAllActions(id);
        if (startAction === 'idle') {
            this.executeCrossFade(id, startAction, endAction, duration);
        } else {
            this.synchronizeCrossFade(id, startAction, endAction, duration);
        }
    }

    unPauseAllActions(id) {
        for (var action in this.animations[id]) {
            this.animations[id][action].paused = false;
        }
    }

    executeCrossFade(id, startAction, endAction, duration) {
        const startClip = this.animations[id][startAction];
        const endClip = this.animations[id][endAction];
        this.setWeight(id, endAction, 1);
        endClip.time = 0;
        startClip.crossFadeTo(endClip, duration, true);
    }


    synchronizeCrossFade(id, startAction, endAction, duration) {
        const startClip = this.animations[startAction];
        const endClip = this.animations[endAction];
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


    setWeight(id, action, weight) {
        const clip = this.animations[id][action];;
        clip.enabled = true;
        clip.setEffectiveTimeScale(1);
        clip.setEffectiveWeight(weight);
        if (weight === 1) this.currentAnimations[id] = action;
    }


}

export { Animator };