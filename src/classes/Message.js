class Message {

    constructor(app, id, author, date, content) {
        this.app = app;
        this.id = id;
        this.tempID = (this.id === null) ? this.generateID() : '';
        this.$dom = $('#chat .template').clone().removeClass('template');
        this.author = author;
        this.date = date;
        this.content = content;
    }

    show(isTemp) {
        if (isTemp) {
            this.$dom.attr('data-tempID', this.tempID);
            this.$dom.addClass('temp');
        } else {
            this.$dom.attr('data-id', this.id);
            this.$dom.removeClass('temp');
        }
        this.$dom.attr('title', this.getDateStr());
        if (this.author.id === this.app.mainUser.id) this.$dom.addClass('me');
        const message = this.author.name + ' : ' + this.content;
        this.$dom.html(message);
        $('#chat .messages').append(this.$dom);
    }

    updateView() {
        this.$dom.attr('title', this.getDateStr());
        this.$dom.attr('data-id', this.id);
    }

    getDateStr() {
        const date = new Date(this.date);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const hours = date.getHours();
        const min = date.getMinutes();
        return year + '/' + month + '/' + day + ' ' + hours + ':' + min;
    }

    generateID() {
        return '_' + Math.random().toString(36).substr(2, 9);
    }

}

export { Message }; 