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
        this.game.board.controls.setAction('down', this, this.nextChoice);
        this.game.board.controls.setAction('up', this, this.prevChoice);
        this.game.board.controls.setAction('validate', this, () => {
            this.$dom.find('.btn.selected').click();
        });
        this.game.board.controls.setAction('cancel', this, () => {
            this.$dom.find('.btn.cancel').click();
        });
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
        this.game.board.controls.setAction('validate', this, () => {
            this.$dom.find('.btn.selected').click();
        });
        this.game.board.controls.setAction('cancel', this, () => {
            this.$dom.find('.btn.ok').click();
        });
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
        this.game.board.controls.removeAction('validate');
        this.game.board.controls.removeAction('down');
        this.game.board.controls.removeAction('up');
    }

    nextChoice() {
        const $choices = this.$dom.find('.controls .btn');
        let current = $choices.index(this.$dom.find('.controls .btn.selected'));
        if (current < $choices.length - 1) {
            current++;
        }
        this.$dom.find('.controls .btn.selected').removeClass('selected');
        this.$dom.find('.controls .btn').eq(current).addClass('selected');
    }

    prevChoice() {
        const $choices = this.$dom.find('.controls .btn');
        let current = $choices.index(this.$dom.find('.controls .btn.selected'));
        if (current > 0) {
            current--;
        }
        this.$dom.find('.controls .btn.selected').removeClass('selected');
        this.$dom.find('.controls .btn').eq(current).addClass('selected');
    }


}
export { MessageSystem };