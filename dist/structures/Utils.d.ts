import { Manager } from "./Manager";
import { Node } from "./Node";
import { Player, Track } from "./Player";
import { Queue } from "./Queue";
export interface TrackData {
    track: string;
    info: {
        title: string;
        identifier: string;
        author: string;
        length: number;
        isSeekable: boolean;
        isStream: boolean;
        uri: string;
    };
}
/** @hidden */
export declare function buildTrack(data: TrackData, requester: any): Track | null;
export declare class Utils {
    /**
     * Formats the given duration into human readable format.
     * @param milliseconds The duration to format.
     * @param [minimal=false] Whether to use a minimal format.
     * @returns The formatted duration.
     */
    static formatTime(milliseconds: number, minimal?: boolean): string;
    /**
     * Parses the given duration into milliseconds.
     * @param time The duration to parse.
     * @returns The formatted duration.
     */
    static parseTime(time: string): number | null;
}
/** The Structure class. */
export declare class Structure {
    /**
     * Extends a class.
     * @param extender
     */
    static extend<K extends keyof Extendable, T extends Extendable[K]>(name: K, extender: (klass: Extendable[K]) => T): T;
    /**
     * Returns the structure.
     * @param structure
     */
    static get<K extends keyof Extendable>(structure: K): Extendable[K];
}
export declare class Plugin {
    load(manager: Manager): void;
}
export declare enum LoadType {
    TRACK_LOADED = "TRACK_LOADED",
    PLAYLIST_LOADED = "PLAYLIST_LOADED",
    SEARCH_RESULT = "SEARCH_RESULT",
    LOAD_FAILED = "LOAD_FAILED",
    NO_MATCHES = "NO_MATCHES"
}
export declare enum State {
    CONNECTED = "CONNECTED",
    CONNECTING = "CONNECTING",
    DISCONNECTED = "DISCONNECTED",
    DISCONNECTING = "DISCONNECTING",
    DESTROYING = "DESTROYING"
}
/** @hidden */
export declare const structures: {
    Player: any;
    Queue: any;
    Node: any;
};
export interface Extendable {
    Player: typeof Player;
    Queue: typeof Queue;
    Node: typeof Node;
}
