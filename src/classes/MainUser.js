import { User } from './User.js';

class MainUser extends User {

    constructor(name) {
        super(name);
        this.id = this.generateID();
        $('.username').html(this.name);
        $('#loading').fadeOut();
        console.log('MAIN USER ID: ' + this.id);
    }

    generateID() {
        return '_' + Math.random().toString(36).substr(2, 9);
    }

}

export { MainUser };