/// <reference types="node" />
import Collection from "@discordjs/collection";
import { EventEmitter } from "events";
import { Node, NodeOptions } from "./Node";
import { Player, PlayerOptions, Track } from "./Player";
import { LoadType, Plugin, TrackData } from "./Utils";
export interface Payload {
    /** The OP code */
    op: number;
    d: {
        guild_id: string;
        channel_id: string | null;
        self_mute: boolean;
        self_deaf: boolean;
    };
}
/** The ManagerOptions interface. */
export interface ManagerOptions {
    /** The array of nodes to connect to. */
    nodes?: NodeOptions[];
    /** The client ID to use. */
    clientId?: string;
    /** The shard count. */
    shards?: number;
    /** A array of plugins to use. */
    plugins?: Plugin[];
    /** Whether players should automatically play the next song. */
    autoPlay?: boolean;
    /**
     * Function to send data to the websocket.
     * @param id The ID of the guild.
     * @param payload The payload to send.
     */
    send(id: string, payload: Payload): void;
}
/** The IQuery interface. */
export interface Query {
    /** The source to search from. */
    source?: "youtube" | "soundcloud";
    /** The query to search for. */
    query: string;
}
/** The SearchResult interface. */
export interface SearchResult {
    /** The load type of the result. */
    loadType: LoadType;
    /** The array of tracks if the load type is SEARCH_RESULT or TRACK_LOADED. */
    tracks?: Track[];
    /** The playlist object if the load type is PLAYLIST_LOADED. */
    playlist?: {
        /** The playlist info object. */
        info: {
            /** The playlist name. */
            name: string;
            /** The playlist selected track. */
            selectedTrack?: Track;
        };
        /** The tracks in the playlist. */
        tracks: Track[];
        /** The duration of the playlist. */
        duration: number;
    };
    /** The exception when searching if one. */
    exception?: {
        /** The message for the exception. */
        message: string;
        /** The severity of exception. */
        severity: string;
    };
}
export interface Manager {
    /**
     * Emitted when a Node is created.
     * @event Manager#nodeCreate
     */
    on(event: "nodeCreate", listener: (node: Node) => void): this;
    /**
     * Emitted when a Node is destroyed.
     * @event Manager#nodeDestroy
     */
    on(event: "nodeDestroy", listener: (node: Node) => void): this;
    /**
     * Emitted when a Node connects.
     * @event Manager#nodeConnect
     */
    on(event: "nodeConnect", listener: (node: Node) => void): this;
    /**
     * Emitted when a Node reconnects.
     * @event Manager#nodeReconnect
     */
    on(event: "nodeReconnect", listener: (node: Node) => void): this;
    /**
     * Emitted when a Node disconnects.
     * @event Manager#nodeDisconnect
     */
    on(event: "nodeDisconnect", listener: (node: Node, reason: {
        code: number;
        reason: string;
    }) => void): this;
    /**
     * Emitted when a Node has an error.
     * @event Manager#nodeError
     */
    on(event: "nodeError", listener: (node: Node, error: Error) => void): this;
    /**
     * Emitted whenever any Lavalink event is received.
     * @event Manager#nodeRaw
     */
    on(event: "nodeRaw", listener: (payload: any) => void): this;
    /**
     * Emitted when a player is created.
     * @event Manager#playerCreate
     */
    on(event: "playerCreate", listener: (player: Player) => void): this;
    /**
     * Emitted when a player is destroyed.
     * @event Manager#playerDestroy
     */
    on(event: "playerDestroy", listener: (player: Player) => void): this;
    /**
     * Emitted when a player queue ends.
     * @event Manager#queueEnd
     */
    on(event: "queueEnd", listener: (player: Player) => void): this;
    /**
     * Emitted when a player is moved to a new voice channel.
     * @event Manager#playerMove
     */
    on(event: "playerMove", listener: (player: Player, oldChannel: any, newChannel: string) => void): this;
    /**
     * Emitted when a track starts.
     * @event Manager#trackStart
     */
    on(event: "trackStart", listener: (player: Player, track: Track, payload: any) => void): this;
    /**
     * Emitted when a track ends.
     * @event Manager#trackEnd
     */
    on(event: "trackEnd", listener: (player: Player, track: Track, payload: any) => void): this;
    /**
     * Emitted when a track gets stuck during playback.
     * @event Manager#trackStuck
     */
    on(event: "trackStuck", listener: (player: Player, track: Track, payload: any) => void): this;
    /**
     * Emitted when a track has an error during playback.
     * @event Manager#trackError
     */
    on(event: "trackError", listener: (player: Player, track: Track, payload: any) => void): this;
    /**
     * Emitted when a voice connect is closed.
     * @event Manager#socketClosed
     */
    on(event: "socketClosed", listener: (player: Player, payload: any) => void): this;
}
/**
 * The Manager class.
 * @noInheritDoc
 */
export declare class Manager extends EventEmitter {
    /** The map of players. */
    readonly players: Collection<string, Player>;
    /** The map of nodes. */
    readonly nodes: Collection<string, Node>;
    /** The options that were set. */
    readonly options: ManagerOptions;
    protected readonly voiceStates: Map<string, any>;
    /** Returns the least used Nodes. */
    get leastUsedNodes(): Collection<string, Node>;
    /** Returns the least system load Nodes. */
    get leastLoadNodes(): Collection<string, Node>;
    /**
     * Creates the Manager class.
     * @param options The options to use.
     */
    constructor(options: ManagerOptions);
    /**
     * Initiates the manager (with a client ID if none provided in ManagerOptions).
     * @param clientId The client ID to use.
     */
    init(clientId?: string): this;
    /**
     * Searches YouTube with the query.
     * @param query The query to search against.
     * @param requester The user who requested the tracks.
     * @returns The search result.
     */
    search(query: string | Query, requester: any): Promise<SearchResult>;
    /** Decodes the base64 encoded track and returns a Track. */
    decodeTrack(track: string): Promise<TrackData>;
    /**
     * Create method for an easier option to creating players.
     * @param options The options to pass.
     */
    create(options: PlayerOptions): Player;
    /**
     * Sends voice data to the Lavalink server.
     * @param data The data to send.
     */
    updateVoiceState(data: any): void;
}
