class MessageSystem {

    constructor(game) {
        this.game = game;
        this.id = new Date().getTime();
        this.character = null;
        this.message = null;
        this.$dom = null;
        this.action1 = null;
        this.action2 = null;
    }

    confirm(character, message, ok, cancel) {
        this.character = character;
        this.message = message;
        this.action1 = ok;
        this.action2 = cancel;
        this.$dom = $('#message-system .confirm').clone().removeClass('template');
        this.$dom.attr('data-id', this.id);
        this.$dom.find('.character').html(this.character);
        this.$dom.find('.text').html(this.message);
        $('#message-system .messages').append(this.$dom);
        this.show();
        this.$dom.find('.controls .ok').on('click', () => {
            this.action1();
            this.close();
        });
        this.$dom.find('.controls .cancel').on('click', () => {
            this.action2();
            this.close();
        });
    }

    alert(message, ok) {
        this.message = message;
        this.action1 = ok;
        this.$dom = $('#message-system .alert').clone().removeClass('template');
        this.$dom.attr('data-id', this.id);
        this.$dom.find('.text').html(this.message);
        $('#message-system .messages').append(this.$dom);
        this.show();
        this.$dom.find('.controls .ok').on('click', () => {
            this.action1();
            this.close();
        });
    }

    show() {
        this.$dom.addClass('show');
    }

    close() {
        this.$dom.remove();
    }


}
export { MessageSystem };