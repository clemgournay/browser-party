class UI {

    constructor(app) {
        this.app = app;
        this.loadedAvatars = [];
        this.avatarsLoaded = false;
    }

    init () {
        this.setAvatar();
        this.events();
    }

    setAvatar() {
        $('.avatar-icon').css('background-image', 'url(' + this.app.mainUser.avatar + ')');
    }

    events () {
        $('.avatar-change').on('click', () => {
            this.app.room.controls.lock();
            $('#avatar-selection').fadeIn();
            if (!this.avatarsLoaded) this.buildAvatarList();
        });

        $('.window .close').on('click', (e) => {
            $(e.target).parents('.window').fadeOut();
            this.app.room.controls.unlock();
        });
    }

    buildAvatarList() {
        for (let i = 1; i <= 80; i++) {
            $('#avatar-selection .avatars').append('<div class="avatar" data-id="' + i + '"></div>');
            const img = new Image();
            img.src = './assets/avatars/' + i + '.png';
            img.ID = i;
            const self = this;
            img.onload = function () {
                $('.avatar[data-id="' + this.ID + '"]').css('background-image', 'url(' + this.src + ')');
                self.loadedAvatars.push(this);
                if (self.loadedAvatars.length === 25) self.avatarsLoaded = true;
            }
        }

        $('#avatar-selection .avatar').on('click', (e) => {
            const $img = $(e.target);
            const id = $img.attr('data-id');
            const URL = './assets/avatars/' + id + '.png';
            this.app.updateAvatar(URL);
            this.setAvatar();
            this.app.room.updateAvatar(this.app.mainUser);
        });

        $('#avatar-selection .avatar-url-btn').on('click', () => {
            const val = $('.avatar-url').val();
            const img = new Image();
            img.src = val;
            img.onload = () => {
                this.app.updateAvatar(val);
                this.setAvatar();
                this.app.room.updateAvatar(this.app.mainUser);
            }
            img.onerror = () => {
                alert('Please set valid image URL');
            }
        });
    }

}

export { UI };