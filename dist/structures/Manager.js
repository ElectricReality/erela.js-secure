"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Manager = void 0;
/* eslint-disable no-async-promise-executor, @typescript-eslint/no-explicit-any, no-undef */
const collection_1 = __importDefault(require("@discordjs/collection"));
const axios_1 = __importDefault(require("axios"));
const events_1 = require("events");
const Utils_1 = require("./Utils");
const template = JSON.stringify(["event", "guildId", "op", "sessionId"]);
/**
 * The Manager class.
 * @noInheritDoc
 */
class Manager extends events_1.EventEmitter {
    /**
     * Creates the Manager class.
     * @param options The options to use.
     */
    constructor(options) {
        super();
        /** The map of players. */
        this.players = new collection_1.default();
        /** The map of nodes. */
        this.nodes = new collection_1.default();
        this.voiceStates = new Map();
        if (!options.send)
            throw new RangeError("Missing send method in ManageOptions.");
        this.options = Object.assign({ plugins: [], nodes: [
                {
                    host: "localhost",
                    port: 2333,
                    password: "youshallnotpass",
                },
            ], shards: 1, autoPlay: false }, options);
        for (const plugin of this.options.plugins)
            plugin.load(this);
        for (const node of this.options.nodes) {
            const identifier = node.identifier || `${node.host}:${node.port}`;
            this.nodes.set(identifier, new (Utils_1.Structure.get("Node"))(this, node));
        }
    }
    /** Returns the least used Nodes. */
    get leastUsedNodes() {
        return this.nodes
            .filter((node) => node.connected)
            .sort((a, b) => b.calls - a.calls);
    }
    /** Returns the least system load Nodes. */
    get leastLoadNodes() {
        return this.nodes
            .filter((node) => node.connected)
            .sort((a, b) => {
            const aload = a.stats.cpu
                ? (a.stats.cpu.systemLoad / a.stats.cpu.cores) * 100
                : 0;
            const bload = b.stats.cpu
                ? (b.stats.cpu.systemLoad / b.stats.cpu.cores) * 100
                : 0;
            return aload - bload;
        });
    }
    /**
     * Initiates the manager (with a client ID if none provided in ManagerOptions).
     * @param clientId The client ID to use.
     */
    init(clientId) {
        if (clientId)
            this.options.clientId = clientId;
        if (!this.options.clientId) {
            throw new Error('"clientId" is not set. Pass it in Manager#init() or as a option in the constructor.');
        }
        for (const node of this.nodes.values())
            node.connect();
        Utils_1.Structure.get("Player").init(this);
        return this;
    }
    /**
     * Searches YouTube with the query.
     * @param query The query to search against.
     * @param requester The user who requested the tracks.
     * @returns The search result.
     */
    search(query, requester) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            const node = this.leastUsedNodes.first();
            if (!node)
                throw new Error("Manager#search() No available nodes.");
            const source = { soundcloud: "sc" }[query.source] || "yt";
            let search = query.query || query;
            if (!/^https?:\/\//.test(search)) {
                search = `${source}search:${search}`;
            }
            const url = `https://${node.options.host}:${node.options.port}/loadtracks`;
            const res = yield axios_1.default.get(url, {
                headers: { Authorization: node.options.password },
                params: { identifier: search },
            }).catch((err) => {
                return reject(err);
            });
            node.calls++;
            if (!res || !res.data) {
                return reject(new Error("No data returned from query."));
            }
            const result = {
                loadType: res.data.loadType,
                exception: res.data.exception,
            };
            if ([Utils_1.LoadType.SEARCH_RESULT, Utils_1.LoadType.TRACK_LOADED].includes(Utils_1.LoadType[result.loadType])) {
                result.tracks = res.data.tracks.map((track) => Utils_1.buildTrack(track, requester));
            }
            else if (result.loadType === Utils_1.LoadType.PLAYLIST_LOADED) {
                result.playlist = {
                    tracks: res.data.tracks.map((track) => Utils_1.buildTrack(track, requester)),
                    info: {
                        name: res.data.playlistInfo.name,
                        selectedTrack: Utils_1.buildTrack(res.data.tracks[res.data.playlistInfo.selectedTrack], requester),
                    },
                    duration: res.data.tracks
                        .map((track) => track.info.length)
                        .reduce((acc, cur) => acc + cur, 0),
                };
            }
            return resolve(result);
        }));
    }
    /** Decodes the base64 encoded track and returns a Track. */
    decodeTrack(track) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            const node = this.leastUsedNodes.first();
            if (!node)
                throw new Error("Manager#search() No available nodes.");
            const url = `https://${node.options.host}:${node.options.port}/decodetrack`;
            const res = yield axios_1.default.get(url, {
                headers: { Authorization: node.options.password },
                params: { track: track },
            }).catch((err) => {
                return reject(err);
            });
            node.calls++;
            if (!res || !res.data) {
                return reject(new Error("No data returned from query."));
            }
            return resolve({ track, info: res.data });
        }));
    }
    /**
     * Create method for an easier option to creating players.
     * @param options The options to pass.
     */
    create(options) {
        if (this.players.has(options.guild.id || options.guild)) {
            return this.players.get(options.guild.id || options.guild);
        }
        else {
            return new (Utils_1.Structure.get("Player"))(options);
        }
    }
    /**
     * Sends voice data to the Lavalink server.
     * @param data The data to send.
     */
    updateVoiceState(data) {
        if (!data ||
            !["VOICE_SERVER_UPDATE", "VOICE_STATE_UPDATE"].includes(data.t || ""))
            return;
        const player = this.players.get(data.d.guild_id);
        if (!player)
            return;
        const state = this.voiceStates.get(data.d.guild_id) || {};
        if (data.t === "VOICE_SERVER_UPDATE") {
            state.op = "voiceUpdate";
            state.guildId = data.d.guild_id;
            state.event = data.d;
        }
        else {
            if (data.d.user_id !== this.options.clientId)
                return;
            state.sessionId = data.d.session_id;
            if (player.options.voiceChannel !== data.d.channel_id) {
                this.emit("playerMove", player, player.voiceChannel, data.d.channel_id);
            }
        }
        this.voiceStates.set(data.d.guild_id, state);
        if (JSON.stringify(Object.keys(state).sort()) === template) {
            player.node.send(state);
            this.voiceStates.delete(data.d.guild_id);
        }
    }
}
exports.Manager = Manager;
