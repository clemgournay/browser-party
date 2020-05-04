class User {

    constructor(username) {
        this.name = username;
        this.id = null;
        this.initPos = {x: 6, y: 3, z: 15};
        this.position = this.initPos;
        this.rotation = 0;
        this.avatar = this.randomAvatar();
    }

    randomAvatar() {
        const id = Math.floor(Math.random() * 25) + 1;
        return './assets/avatars/' + id + '.png';
    }
    
    updateAvatar(URL) {
        this.avatar = URL;
    }
    
}

export { User };