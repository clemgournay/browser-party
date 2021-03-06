class UI {

    constructor(game) {
        this.game = game;
        this.view = 'ui';
        this.QRCode = null;
    }

    init () {
        this.showView(this.view);
        this.events();
    }

    createPlayerScore(player) {
        const $template = $('.player-score.template').clone().removeClass('template');
        $template.attr('data-id', player.id);
        $('.players-score .players').append($template);
        this.updatePlayerScore(player);
    }

    updatePlayersScore() {
        for (let id in this.game.players) {
            this.updatePlayerScore(this.game.players[id]);
        }
    }

    updatePlayerScore(player) {
        const $dom = $('.player-score[data-id="' + player.id + '"]');
        $dom.addClass('order-' + player.order);
        if (player.constructor.name === 'MainPlayer') $dom.addClass('main');
        if (this.game.currentPlayer && this.game.currentPlayer.id === player.id) $dom.addClass('current');
        else $dom.removeClass('current');
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

    events() {
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

    showQRCode() {
        this.QRCode = new QRCode(document.getElementById('qr-code'), {
            //text: window.location.href + '/controller/#' + this.game.sync.controlID,
            text: 'https://a081d7a297a4.eu.ngrok.io/controller/#' + this.game.sync.controlID,
            width: 128,
            height: 128,
            colorDark : "#000000",
            colorLight : "#ffffff",
            correctLevel : QRCode.CorrectLevel.H
        });
    }

}

export { UI };