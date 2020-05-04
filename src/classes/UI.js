class UI {

    constructor(app) {
        this.app = app;\
    }

    init () {
        this.events();
    }

    events () {

        $('.window .close').on('click', (e) => {
            $(e.target).parents('.window').fadeOut();
            this.app.room.controls.unlock();
        });
    }

}

export { UI };