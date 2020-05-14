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


    playFade(id, endAction, duration, callback) {
        const startAction = this.currentAnimations[id];
        const startClip = this.animations[id][startAction];
        const endClip = this.animations[id][endAction];

        endClip.play();
        this.setWeight(id, endAction, 1);
        endClip.time = 0;
        startClip.crossFadeTo(endClip, duration);
        console.log(endAction)
        this.currentAnimations[id] = endAction;
        if (endClip.clampWhenFinished) {
            const totalDuration = (duration*1000) + (endClip._clip.duration * 1000) - 100;
            setTimeout(() => {
                if (callback) callback();
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


    setWeight(id, action, weight) {
        const clip = this.animations[id][action];;
        clip.enabled = true;
        clip.setEffectiveTimeScale(1);
        clip.setEffectiveWeight(weight);
        if (weight === 1) this.currentAnimations[id] = action;
    }


}

export { Animator };