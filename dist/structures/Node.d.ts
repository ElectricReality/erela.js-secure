/// <reference types="node" />
import WebSocket from "ws";
import { Manager } from "./Manager";
import { Player, Track } from "./Player";
/** The NodeOptions interface. */
export interface NodeOptions {
    /** The host for the node. */
    readonly host: string;
    /** The port for the node. */
    readonly port: number;
    /** The password for the node. */
    readonly password: string;
    /** The identifier for the node. */
    readonly identifier?: string;
    /** The retryAmount for the node. */
    readonly retryAmount?: number;
    /** The retryDelay for the node. */
    readonly retryDelay?: number;
}
/** The NodeOptions interface. */
export interface NodeStats {
    /** The amount of players on the node. */
    players: number;
    /** The amount of playing players on the node. */
    playingPlayers: number;
    /** The uptime for the node. */
    uptime: number;
    /** The memory stats for the node. */
    memory: {
        /** The free memory of the allocated amount. */
        free: number;
        /** The used memory of the allocated amount. */
        used: number;
        /** The total allocated memory. */
        allocated: number;
        /** The reservable memory. */
        reservable: number;
    };
    /** The cpu stats for the node. */
    cpu: {
        /** The core amount the host machine has. */
        cores: number;
        /** The system load. */
        systemLoad: number;
        /** The lavalink load. */
        lavalinkLoad: number;
    };
    /** The frame stats for the node. */
    frameStats: {
        /** The amount of sent frames. */
        sent?: number;
        /** The amount of nulled frames. */
        nulled?: number;
        /** The amount of deficit frames. */
        deficit?: number;
    };
}
/** The Node class. */
export declare class Node {
    manager: Manager;
    options: NodeOptions;
    /** The socket for the node. */
    socket: WebSocket | null;
    /** The amount of rest calls the node has made. */
    calls: number;
    /** The stats for the node. */
    stats: NodeStats;
    private reconnectTimeout?;
    private reconnectAttempts;
    /** Returns if connected to the Node. */
    get connected(): boolean;
    /**
     * Creates an instance of Node.
     * @param manager The Manager.
     * @param options The NodeOptions to pass.
     */
    constructor(manager: Manager, options: NodeOptions);
    /** Connects to the Node. */
    connect(): void;
    /** Reconnects to the Node. */
    reconnect(): void;
    /** Destroys the Node. */
    destroy(): void;
    /**
     * Sends data to the Node.
     * @param data The data to send.
     */
    send(data: any): Promise<boolean>;
    protected open(): void;
    protected close(code: number, reason: string): void;
    protected error(error: Error): void;
    protected message(d: Buffer | string): void;
    protected handleEvent(payload: any): void;
    protected trackEnd(player: Player, track: Track, payload: any): void;
    protected trackStart(player: Player, track: Track, payload: any): void;
    protected trackStuck(player: Player, track: Track, payload: any): void;
    protected trackError(player: Player, track: Track, payload: any): void;
    protected socketClosed(player: Player, payload: any): void;
}
