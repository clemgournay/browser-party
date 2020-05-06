import { Game } from './classes/Game.js';

window.onload = function () {
    const browserParty = new Game();
    browserParty.init();
}