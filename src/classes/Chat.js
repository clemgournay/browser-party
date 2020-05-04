import { Message } from './Message.js';

class Chat {

    constructor (app) {
        this.app = app;
        this.socket = null;
        this.messages = [];
    }

    connect() {
        this.socket = this.app.sync.socket;
        
        this.socket.on('chat messages', (messages) => {
            this.messages = messages;
            this.messages.forEach(msg => {
                const message = new Message(this.app, msg.id, msg.author, msg.date, msg.content);
                this.messages.push(message);
                message.show();
            });
            this.scrollToLastMessage();
            setTimeout(() => {
                this.scrollToLastMessage();
            }, 500)
        });

        this.socket.on('chat sent', (msg) => {
            if (msg.author.id === this.app.mainUser.id) {
                const index = this.getTempMessageIndex(msg.tempID);
                const message = this.messages[index];
                message.id = msg.id;
                message.date = msg.date;
                message.updateView();
            } else {
                const message = new Message(this.app, msg.id, msg.author, msg.date, msg.content);
                this.messages.push(message);
                message.show();
                this.scrollToLastMessage();
            }
        });

        this.events();
    }

    events() {
        $('#chat textarea').on('keydown', (e) => {
            if (e.keyCode === 13) {
                e.preventDefault();
                let val = $('#chat textarea').val();
                if (val.length > 0) {
                    val = val.replace(/</g, "&lt;").replace(/>/g, "&gt;");
                    const message = new Message(this.app, null, {id: this.app.mainUser.id, name: this.app.mainUser.name}, new Date(), val);
                    this.messages.push(message);
                    message.show(true);
                    this.socket.emit('chat send', {tempID: message.tempID, content: val});
                    $('#chat textarea').val('');
                    this.scrollToLastMessage();
                }
            }
        });
        $('#chat textarea').on('focus', (e) => {
            this.app.room.controls.lock();
        })
        $('#chat textarea').on('blur', (e) => {
            this.app.room.controls.unlock();
        })
    }

    getTempMessageIndex(tempID) {
        let found = false, i = 0;
        while(!found && i < this.messages.length) {
            if (this.messages[i].tempID === tempID) found = true;
            else i++;
        }
        return (found) ? i : -1;
    }

    scrollToLastMessage() {
        setTimeout(() => {
            const scrollTop = $('.messages').outerHeight() - $('.messages-cont').outerHeight();
            $('#chat .messages-cont').scrollTop(scrollTop);
        }, 20);
    }

    

}

export { Chat };