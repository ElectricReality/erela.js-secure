import { Manager, Query, SearchResult } from "./Manager";
import { Node } from "./Node";
import { Queue } from "./Queue";
import { State } from "./Utils";
/** The PlayerOptions interface. */
export interface PlayerOptions {
    /** The guild the Player belongs to. */
    guild: any;
    /** The text channel the Player belongs to. */
    textChannel: any;
    /** The voice channel the Player belongs to. */
    voiceChannel?: any;
    /** The node the Player uses. */
    node?: string;
    /** The initial volume the Player will use. */
    volume?: number;
    /** If the player should mute itself. */
    selfMute?: boolean;
    /** If the player should deafen itself. */
    selfDeafen?: boolean;
}
/** The Track interface. */
export interface Track {
    /** The base64 encoded track. */
    readonly track: string;
    /** The title of the track. */
    readonly title: string;
    /** The identifier of the track. */
    readonly identifier: string;
    /** The author of the track. */
    readonly author: string;
    /** The duration of the track. */
    readonly duration: number;
    /** If the track is seekable. */
    readonly isSeekable: boolean;
    /** If the track is a stream.. */
    readonly isStream: boolean;
    /** The uri of the track. */
    readonly uri: string;
    /** The thumbnail of the track. */
    readonly thumbnail: string;
    /** The user that requested the track. */
    readonly requester: any;
    /** Displays the track thumbnail with a size in "0", "1", "2", "3", "default", "mqdefault", "hqdefault", "maxresdefault". Only for youtube as others require an API. */
    displayThumbnail(size?: "0" | "1" | "2" | "3" | "default" | "mqdefault" | "hqdefault" | "maxresdefault"): string;
}
/** The PlayOptions interface */
export interface PlayOptions {
    /** The track to play. */
    readonly track?: Track;
    /** The position to start the track. */
    readonly startTime?: number;
    /** The position to end the track. */
    readonly endTime?: number;
    /** Whether to not replace the track if a play payload is sent. */
    readonly noReplace?: boolean;
}
/** The EqualizerBand interface. */
export interface EqualizerBand {
    /** The band number being 0 to 14. */
    band: number;
    /** The gain amount being -0.25 to 1.00, 0.25 being double. */
    gain: number;
}
/** The Player class. */
export declare class Player {
    options: PlayerOptions;
    /** The Manager instance. */
    static manager: Manager;
    /** The Queue for the Player. */
    readonly queue: Queue;
    /** The current track for the Player. */
    current?: Track;
    /** Whether the queue repeats the track. */
    trackRepeat: boolean;
    /** Whether the queue repeats the queue. */
    queueRepeat: boolean;
    /** The time the player is in the track. */
    position: number;
    /** Whether the player is playing. */
    playing: boolean;
    /** Whether the player is paused. */
    paused: boolean;
    /** Whether the player is playing. */
    volume: number;
    /** The Node for the Player. */
    node: Node;
    /** The guild the player. */
    guild: any;
    /** The voice channel for the player. */
    voiceChannel: any;
    /** The text channel for the player. */
    textChannel: any;
    /** The current state of the player. */
    state: State;
    /** The equalizer bands array. */
    bands: number[];
    private player;
    /** Only for internal use. */
    static init(manager: Manager): void;
    /**
     * Creates a new player, returns one if it already exists.
     * @param options The options to pass.
     */
    constructor(options: PlayerOptions);
    /**
     * Same as Manager#search() but a shortcut on the player itself.
     * @param query The query to search against.
     * @param requester The user who requested the tracks.
     * @returns The search result.
     */
    search(query: string | Query, requester: any): Promise<SearchResult>;
    /**
     * Sets the players equalizer band. Passing nothing will clear it.
     * @param bands The bands to set.
     */
    setEQ(...bands: EqualizerBand[]): this;
    /** Clears the equalizer. */
    clearEQ(): this;
    /** Connect to the voice channel. */
    connect(): this;
    /** Disconnect from the voice channel. */
    disconnect(): this | void;
    /** Destroys the player. */
    destroy(): void;
    /**
     * Sets the player voice channel.
     * @param channel The channel to set.
     */
    setVoiceChannel(channel: any): this;
    /**
     * Sets the player text channel.
     * @param channel The channel to set.
     */
    setTextChannel(channel: any): this;
    /**
     * Plays the next track or a specified track in the PlayOptions.
     * @param [options={}] The options to use.
     */
    play(options?: PlayOptions): this;
    /**
     * Sets the player volume.
     * @param volume The volume to set.
     */
    setVolume(volume: number): this;
    /**
     * Sets the track repeat.
     * @param repeat If track repeat should be enabled.
     */
    setTrackRepeat(repeat: boolean): this;
    /**
     * Sets the queue repeat.
     * @param repeat If queue repeat should be enabled.
     */
    setQueueRepeat(repeat: boolean): this;
    /** Stops the current track. */
    stop(): this;
    /**
     * Pauses the current track.
     * @param pause Whether to pause the current track.
     */
    pause(pause: boolean): this;
    /**
     * Seeks to the position in the current track.
     * @param pause Whether to pause the current track.
     */
    seek(position: number): this | void;
}
