class UI {

    constructor(game) {
        this.game = game;
        this.view = 'ui';
    }

    init () {
        this.showView(this.view);
        this.createPlayersScore();
        this.events();
    }

    createPlayersScore() {
        this.createPlayerScore(this.game.mainPlayer);
    }

    createPlayerScore(player) {
        const $template = $('.player-score.template').clone().removeClass('template');
        $template.attr('data-id', player.id);
        $('.players-score .players').append($template);
        this.updatePlayerScore(player);
    }

    updatePlayerScore(player) {
        const $dom = $('.player-score[data-id="' + player.id + '"]');
        $dom.find('.name').html(player.name);
        $dom.find('.stars .value').html(player.stars);
        $dom.find('.coins .value').html(player.coins);
        let rankStr = '';
        switch(player.rank) {
            case 1:
                rankStr = '1st';
                break;
            case 2:
                rankStr = '2nd';
                break;
            case 3:
                rankStr = '3rd';
                break;
            case 4:
                rankStr = '4th';
                break;
        }
        $dom.find('.rank').html(rankStr);
    }

    events () {
        $('.window .close').on('click', (e) => {
            $(e.target).parents('.window').fadeOut();
            this.app.room.controls.unlock();
        });
    }

    showView(id) {
        this.view = id;
        $('.view').hide();
        $('#' + this.view).fadeIn();
    }

}

export { UI };