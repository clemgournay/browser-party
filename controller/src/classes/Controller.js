import { API_URL } from '../../../src/environment.js';

class Controller {

    constructor() {
        this.ID = window.location.hash.replace('#', '');
        this.socket = io.connect(API_URL, {
            query: 'controlID=' + this.ID
        });
    }

    init() {

        $('.buttons .action').on('click', () => {
            const controlData = {
                id: this.ID,
                control: 'action'
            };
            console.log(controlData)
            this.socket.emit('control send', controlData);
        });

        this.resize();
        $(window).on('resize', this.resize);
    }

    resize() {
        if (window.innerHeight > window.innerWidth) {
            $('#portrait').show();
            $('#landscape').hide();
        } else {
            $('#portrait').hide();
            $('#landscape').show();
        }
    }

}

export { Controller };