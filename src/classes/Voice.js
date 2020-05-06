import { API_URL } from '../environment.js';

class Voice {

    constructor(game) {
        this.game = game;
        this.roomname = null;
        this.username = null;
        this.room = null;
        this.token = null;
        this.muted = false;
        this.localParticipant = null;
    }

    getToken(callback) {
        $.ajax({
            url: API_URL + '/token',
            type: 'GET',
            data: {
                username: this.username,
                roomname: this.roomname,
                device: 'browser'
            },
            success: function (resp) {
                console.log(resp);
                this.token = resp.token;
                callback();
            }.bind(this),
            error: function (resp) {
                alert(resp);
            }
        });
    }

    connect(username, roomname) {
        this.roomname = roomname;
        this.username = username;
        this.getToken(() => {
            var connectOptions = {name: this.roomname, logLevel: 'error'};
            Twilio.Video.connect(this.token, connectOptions).then((room) => {
                this.room = room;
                this.events();
            }, (error) => {
                console.log('Could not connect to Twilio: ' + error.message)
            });
        })
    }

    events() {
        console.log('Logged as ' + this.username);

        $('#ui .controls .voice').fadeIn();

        this.localParticipant = this.room.localParticipant;
        this.localParticipant.videoTracks.forEach(function (videoTrack) {
            videoTrack.disable();
        });

        this.room.participants.forEach((participant) => {
            var previewContainer = document.getElementById('users');
            this.attachParticipantTracks(participant, previewContainer)
        });

        this.room.on('participantConnected', (participant) => {
            console.log(participant.identity + ' has joined the room')
        });

        this.room.on('trackAdded', (track, participant) => {
            var previewContainer = document.getElementById('users')
            this.attachTracks([track], previewContainer)
        });

        this.room.on('trackRemoved', (track, participant) => {
            this.detachTracks([track])
        });

        this.room.on('participantDisconnected', (participant) => {
            console.log(participant.identity + ' left the room')
            this.detachParticipantTracks(participant)
        });

        this.room.on('disconnected', () => {
            console.log('Disconnected')
            this.detachParticipantTracks(room.localParticipant)
            this.room.participants.forEach(this.detachParticipantTracks)
            this.room = null
        });

        $('#toggle-mute').on('click', () => {
            console.log('MUTE')
            $('#toggle-mute').toggleClass('muted');
            this.toggleMute();
        });

        $(document).on('keydown', (e) => {
            console.log(e);
        });
        
    }

    attachTracks (tracks, container) {
        tracks.forEach(function (track) {
            if (track.kind === 'audio') {
                container.appendChild(track.attach());
            }
        });
    }

    attachParticipantTracks (participant, container) {
        var tracks = Array.from(participant.tracks.values());
        this.attachTracks(tracks, container);
    }

    detachTracks (tracks) {
        tracks.forEach((track) => {
            track.detach().forEach((detachedElement) => {
                detachedElement.remove()
            });
        });
    }

    detachParticipantTracks (participant) {
        var tracks = Array.from(participant.tracks.values());
        this.detachTracks(tracks);
    }

    toggleMute() {
        this.localParticipant.audioTracks.forEach((audioTrack) => {
            if (this.muted) audioTrack.enable();
            else audioTrack.disable();
        });
    }

}

export { Voice };