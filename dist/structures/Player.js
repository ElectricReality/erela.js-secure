"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Player = void 0;
const Utils_1 = require("./Utils");
/** The Player class. */
class Player {
    /**
     * Creates a new player, returns one if it already exists.
     * @param options The options to pass.
     */
    constructor(options) {
        this.options = options;
        /** The Queue for the Player. */
        this.queue = new (Utils_1.Structure.get("Queue"))(this);
        /** Whether the queue repeats the track. */
        this.trackRepeat = false;
        /** Whether the queue repeats the queue. */
        this.queueRepeat = false;
        /** The time the player is in the track. */
        this.position = 0;
        /** Whether the player is playing. */
        this.playing = false;
        /** Whether the player is paused. */
        this.paused = false;
        /** The current state of the player. */
        this.state = Utils_1.State.DISCONNECTED;
        /** The equalizer bands array. */
        this.bands = new Array(15).fill(0.0);
        if (!this.player)
            this.player = Utils_1.Structure.get("Player");
        if (!this.player.manager)
            throw new RangeError("Manager has not been initiated.");
        if (this.player.manager.players.has(options.guild.id || options.guild)) {
            return this.player.manager.players.get(options.guild.id || options.guild);
        }
        this.volume = options.volume || 100;
        this.guild = options.guild;
        this.voiceChannel = options.voiceChannel;
        this.textChannel = options.textChannel;
        const node = this.player.manager.nodes.get(options.node);
        this.node = node || this.player.manager.leastLoadNodes.first();
        if (!this.node)
            throw new RangeError("Player() No available nodes.");
        this.player.manager.players.set(options.guild.id || options.guild, this);
        this.player.manager.emit("playerCreate", this);
    }
    /** Only for internal use. */
    static init(manager) {
        this.manager = manager;
    }
    /**
     * Same as Manager#search() but a shortcut on the player itself.
     * @param query The query to search against.
     * @param requester The user who requested the tracks.
     * @returns The search result.
     */
    search(query, requester) {
        return this.player.manager.search(query, requester);
    }
    /**
     * Sets the players equalizer band. Passing nothing will clear it.
     * @param bands The bands to set.
     */
    setEQ(...bands) {
        for (const { band, gain } of bands)
            this.bands[band] = gain;
        this.node.send({
            op: "equalizer",
            guildId: this.guild.id || this.guild,
            bands: this.bands.map((gain, band) => ({ band, gain })),
        });
        return this;
    }
    /** Clears the equalizer. */
    clearEQ() {
        this.bands = new Array(15).fill(0.0);
        return this.setEQ();
    }
    /** Connect to the voice channel. */
    connect() {
        if (!this.voiceChannel)
            throw new RangeError("Player#connect() No voice channel has been set in PlayerOptions.");
        this.state = Utils_1.State.CONNECTING;
        this.player.manager.options.send(this.guild.id || this.guild, {
            op: 4,
            d: {
                guild_id: this.guild.id || this.guild,
                channel_id: this.voiceChannel.id || this.voiceChannel,
                self_mute: this.options.selfMute || false,
                self_deaf: this.options.selfDeafen || false,
            },
        });
        this.state = Utils_1.State.CONNECTED;
        return this;
    }
    /** Disconnect from the voice channel. */
    disconnect() {
        if (!this.voiceChannel)
            return undefined;
        this.state = Utils_1.State.DISCONNECTING;
        this.pause(true);
        this.player.manager.options.send(this.guild.id || this.guild, {
            op: 4,
            d: {
                guild_id: this.guild.id || this.guild,
                channel_id: null,
                self_mute: false,
                self_deaf: false,
            },
        });
        this.voiceChannel = null;
        this.state = Utils_1.State.DISCONNECTED;
        return this;
    }
    /** Destroys the player. */
    destroy() {
        this.state = Utils_1.State.DESTROYING;
        this.disconnect();
        this.node.send({
            op: "destroy",
            guildId: this.guild.id || this.guild,
        });
        this.player.manager.emit("playerDestroy", this);
        this.player.manager.players.delete(this.guild.id || this.guild);
    }
    /**
     * Sets the player voice channel.
     * @param channel The channel to set.
     */
    setVoiceChannel(channel) {
        channel = this.options.voiceChannel.id ? channel : channel.id;
        this.voiceChannel = channel;
        this.connect();
        return this;
    }
    /**
     * Sets the player text channel.
     * @param channel The channel to set.
     */
    setTextChannel(channel) {
        channel = this.textChannel.id ? channel : channel.id;
        this.textChannel = channel;
        return this;
    }
    /**
     * Plays the next track or a specified track in the PlayOptions.
     * @param [options={}] The options to use.
     */
    play(options = {}) {
        if (!this.current)
            throw new RangeError("Player#play() No current track.");
        const finalOptions = Object.assign({ op: "play", guildId: this.guild.id || this.guild, track: this.current.track }, options);
        if (typeof finalOptions.track !== "string") {
            finalOptions.track = finalOptions.track.track;
        }
        this.node.send(finalOptions);
        return this;
    }
    /**
     * Sets the player volume.
     * @param volume The volume to set.
     */
    setVolume(volume) {
        if (isNaN(volume))
            throw new RangeError("Player#setVolume() Volume must be a number.");
        this.volume = Math.max(Math.min(volume, 1000), 0);
        this.node.send({
            op: "volume",
            guildId: this.guild.id || this.guild,
            volume: this.volume,
        });
        return this;
    }
    /**
     * Sets the track repeat.
     * @param repeat If track repeat should be enabled.
     */
    setTrackRepeat(repeat) {
        if (typeof repeat !== "boolean")
            throw new RangeError('Player#setTrackRepeat() Repeat can only be "true" or "false".');
        if (repeat) {
            this.trackRepeat = true;
            this.queueRepeat = false;
        }
        else {
            this.trackRepeat = false;
            this.queueRepeat = false;
        }
        return this;
    }
    /**
     * Sets the queue repeat.
     * @param repeat If queue repeat should be enabled.
     */
    setQueueRepeat(repeat) {
        if (typeof repeat !== "boolean")
            throw new RangeError('Player#setQueueRepeat() Repeat can only be "true" or "false".');
        if (repeat) {
            this.trackRepeat = false;
            this.queueRepeat = true;
        }
        else {
            this.trackRepeat = false;
            this.queueRepeat = false;
        }
        return this;
    }
    /** Stops the current track. */
    stop() {
        this.node.send({
            op: "stop",
            guildId: this.guild.id || this.guild,
        });
        return this;
    }
    /**
     * Pauses the current track.
     * @param pause Whether to pause the current track.
     */
    pause(pause) {
        if (typeof pause !== "boolean")
            throw new RangeError('Player#pause() Pause can only be "true" or "false".');
        this.playing = !pause;
        this.paused = pause;
        this.node.send({
            op: "pause",
            guildId: this.guild.id || this.guild,
            pause,
        });
        return this;
    }
    /**
     * Seeks to the position in the current track.
     * @param pause Whether to pause the current track.
     */
    seek(position) {
        if (!this.current)
            return undefined;
        if (isNaN(position)) {
            throw new RangeError("Player#seek() Position must be a number.");
        }
        if (position < 0 || position > this.current.duration)
            position = Math.max(Math.min(position, this.current.duration), 0);
        this.position = position;
        this.node.send({
            op: "seek",
            guildId: this.guild.id || this.guild,
            position,
        });
        return this;
    }
}
exports.Player = Player;
