import { Player, Track } from "./Player";
/**
 * The Queue class.
 * @noInheritDoc
 */
export declare class Queue extends Array<Track> {
    private player;
    /** Returns the total duration of the queue including the current track. */
    get duration(): number;
    constructor(player: Player);
    /**
     * Adds a track to the queue.
     * @param track The track or tracks to add.
     * @param [offset=null] The offset to add the track at.
     */
    add(track: Track | Track[], offset?: number): void;
    /**
     * Removes an amount of tracks using a start and end index.
     * @param start The start to remove from.
     * @param end The end to remove to.
     */
    removeFrom(start: number, end: number): Track[];
    /**
     * Removes a track from the queue. Defaults to the first track.
     * @param [position=0] The track index to remove.
     * @returns The track that was removed, or null if the track does not exist.
     */
    remove(position?: number): Track | null;
    /** Clears the queue. */
    clear(): void;
    /** Shuffles the queue. */
    shuffle(): void;
}
