import { Board } from './Board.js';
import { Player } from './Player.js';
import { MainPlayer } from './MainPlayer.js'; 
import { MessageSystem } from './MessageSystem.js';
import { Sync } from './Sync.js';
import { Chat } from './Chat.js';
import { UI } from './UI.js';


class Game {

    constructor () {
        this.board = new Board(this);
        this.mainPlayer = new MainPlayer(this);
        this.UI = new UI(this);
        this.diceRolling = false;
        this.messageSystem = new MessageSystem(this);
        
        this.sync = new Sync(this);
        this.chat = new Chat(this);
        
        this.players = {};
        this.currentPlayerID = null;
        this.currentPlayer = null;
    }

    init() {
        this.updateRank();
        this.board.load(() => {
            this.UI.init();
            this.board.build();
            this.sync.connect(this.mainPlayer, (playerData) => {
                this.currentPlayerID = playerData.currentPlayerID;
                this.setPlayers(playerData.players);
                this.update();
                this.chat.connect();
                this.start();
            });
        });
    }

    update() {
        this.board.update();
        window.requestAnimationFrame(() => {
            this.update();
        });
    }

    start() {
        this.UI.updatePlayersScore();
        this.board.showDice();
    }

    nextPlayerTurn(nextPlayerID) {
        this.currentPlayerID = nextPlayerID;
        this.currentPlayer = this.players[nextPlayerID];
        this.board.currentCharacter = this.board.characters[nextPlayerID];
        this.board.showDice();
        this.UI.updatePlayersScore();
    }

    setPlayers(players) {
        for (let id in players) {
            this.newPlayer(id, players[id]);
            if (id === this.currentPlayerID) {
                this.currentPlayer = this.players[id];
                this.board.currentCharacter = this.board.characters[id];
            }
        }
        console.log('[PLAYERS]', this.players);
        console.log('[CURRENT PLAYER]', this.currentPlayer);
        console.log('[CURRENT CHARACTER]', this.board.currentCharacter);
    }

    newPlayer(id, player) {
        if (id === this.mainPlayer.id) this.players[id] = this.mainPlayer;
        else this.players[id] = new Player(this, player.name);
        this.players[id].id = id;
        this.players[id].position = player.position;
        this.players[id].order = player.order;
        this.board.newCharacter(this.players[id]);
        this.UI.createPlayerScore(this.players[id]);
    }

    updateRank() {
        const players = [];
        for (let key in this.players) {
            players.push(this.players[key]);
        }
        const ordered = players.sort((a, b) => {
            if (a.stars < b.stars) {
                return 1;
            } else if (a.stars > b.stars) {
                return -1;
            } else {
                if (a.coins < b.coins) {
                    return 1;
                }
                else if (a.coins > b.coins) {
                    return -1;
                }
                else {
                    return 0;
                }
            }
        });
        ordered.forEach((player, index)=>{
            player.rank = index + 1;
            this.players[player.id].rank = index + 1;
        });
    }

    movePlayer(id, position) {
        this.board.moveCharacter(id, position);
    }

    removePlayer(id) {
        this.board.removeCharacter(id);
        delete this.players[id];
    }

    playerSelect(id, selection, params) {
        switch (selection) {
            case 'way-chose':
                this.game.board.playerWayChosen(id, params.resultIndex);
                break;
            case 'confrim':
                this.messageSystem.confirmAction(id, params.action);
                break;
            case 'alert':
                this.messageSystem.alertAction(id);
                break;
        }
    }

    mainPlayerHitDice(score) {
        this.sync.mainPlayerHitDice(score);
    }

    mainPlayerWayChose(way) {
        this.sync.mainPlayerWayChose(way);
    }

    mainPlayerTurnOver() {
        this.sync.mainPlayerTurnOver();
    }

    mainPlayerSelection(selection, params) {
        this.sync.mainPlayerSelection(selection);
    }


}

export { Game };