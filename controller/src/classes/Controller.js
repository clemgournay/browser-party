import { API_URL } from '../../../src/environment.js';

class Controller {

    constructor() {
        this.ID = window.location.hash.replace('#', '');
        this.socket = io.connect(API_URL, {
            query: 'controlID=' + this.ID
        });
        this.clickInfo = null;
        this.prevPos = {x: 0, y: 0};
        this.prevValues = {
            left: 0,
            right: 0,
            up: 0,
            down: 0
        }
    }

    init() {

        $('.buttons .validate').on('click', () => {
            const controlData = {
                id: this.ID,
                control: 'validate'
            };
            this.socket.emit('control send', controlData);
        });
        $('.buttons .cancel').on('click', () => {
            const controlData = {
                id: this.ID,
                control: 'cancel'
            };
            this.socket.emit('control send', controlData);
        });


        $('.joystick .stick').on('mousedown', (e) => {
            this.clickInfo = {x: e.pageX, y: e.pageY};
        });

        $('body').on('mousemove', (e) => {
            if (this.clickInfo) {
                const directions = {hor: null, ver: null};
                let left = this.prevPos.x;
                let top = this.prevPos.y;
                let perLeft = this.prevValues.left;
                let perRight = this.prevValues.right;
                let perUp = this.prevValues.up;
                let perDown = this.prevValues.down;

                let limit = ($('.joystick').width()/2) - ($('.stick').width()/2);
                const valueLeft = e.pageX - this.clickInfo.x;
                const valueTop = e.pageY - this.clickInfo.y;
                if (valueLeft >= -limit && valueLeft <= limit) {
                    left = valueLeft;
                    this.prevPos.x = left;
                    if (left < 0) {
                        directions.hor = 'left';
                        perLeft = parseInt((Math.abs(left) * 100) / limit);
                        this.prevValues.left = perLeft;
                    }
                    else if (left > 0) {
                        directions.hor = 'right';
                        perRight = parseInt((left * 100) / limit);
                        this.prevValues.right = perRight;
                    }
                }
                if (valueTop >= -limit && valueTop <= limit) {
                    top = valueTop;
                    this.prevPos.y = top;
                    if (top < 0) {
                        directions.ver = 'up';
                        perUp = parseInt((Math.abs(top) * 100) / limit);
                        this.prevValues.up = perUp;
                    }
                    else if (top > 0) {
                        directions.ver = 'down';
                        perDown = parseInt((top * 100) / limit);
                        this.prevValues.down = perDown;
                    }
                }
                const transform = 'translate3d(' + left + 'px, ' + top + 'px, 0px)';
                $('.stick').css('transform', transform);

                const controlData = {
                    id: this.ID,
                    control: 'joystick',
                    directions: directions,
                    values: {
                        left: perRight, right: perRight,
                        up: perUp, down: perDown
                    }
                };
                console.log(controlData)
                this.socket.emit('control send', controlData);
            }
        });
        $('body').on('mouseup', (e) => {
            this.clickInfo = null;
            $('.stick').css('transform', 'none');
            const controlData = {
                id: this.ID,
                control: 'joystick',
                directions: {hor: 'none', ver: 'none'},
                values: {
                    left: 0, right: 0,
                    up: 0, down: 0
                }
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
            const left = ($('.joystick').width()/2) - ($('.stick').width()/2);
            const top = ($('.joystick').height()/2) - ($('.stick').height()/2);
            $('.stick').css({
                left: left + 'px',
                top: top + 'px'
            });
        }
    }

}

export { Controller };