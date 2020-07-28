"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.structures = exports.State = exports.LoadType = exports.Plugin = exports.Structure = exports.Utils = exports.buildTrack = void 0;
/** @hidden */
const template = ["second", "minute", "hour", "day", "week", "month", "year"];
/** @hidden */
const sizes = [
    "0",
    "1",
    "2",
    "3",
    "default",
    "mqdefault",
    "hqdefault",
    "maxresdefault",
];
/** @hidden */
function buildTrack(data, requester) {
    try {
        const track = {
            track: data.track,
            title: data.info.title,
            identifier: data.info.identifier,
            author: data.info.author,
            duration: data.info.length,
            isSeekable: data.info.isSeekable,
            isStream: data.info.isStream,
            uri: data.info.uri,
            thumbnail: `https://img.youtube.com/vi/${data.info.identifier}/default.jpg`,
            displayThumbnail(size) {
                const finalSize = sizes.find((s) => s === size) || "default";
                return this.uri.includes("youtube")
                    ? `https://img.youtube.com/vi/${data.info.identifier}/${finalSize}.jpg`
                    : "";
            },
            requester,
        };
        track.displayThumbnail = track.displayThumbnail.bind(track);
        return track;
    }
    catch (_a) {
        return null;
    }
}
exports.buildTrack = buildTrack;
class Utils {
    /**
     * Formats the given duration into human readable format.
     * @param milliseconds The duration to format.
     * @param [minimal=false] Whether to use a minimal format.
     * @returns The formatted duration.
     */
    static formatTime(milliseconds, minimal = false) {
        if (typeof milliseconds === "undefined" || isNaN(milliseconds)) {
            throw new RangeError("Utils#formatTime() Milliseconds must be a number");
        }
        if (typeof minimal !== "boolean") {
            throw new RangeError("Utils#formatTime() Minimal must be a boolean");
        }
        if (milliseconds === 0)
            return minimal ? "00:00" : "N/A";
        const times = {
            years: 0,
            months: 0,
            weeks: 0,
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0,
        };
        while (milliseconds > 0) {
            if (milliseconds - 31557600000 >= 0) {
                milliseconds -= 31557600000;
                times.years++;
            }
            else if (milliseconds - 2628000000 >= 0) {
                milliseconds -= 2628000000;
                times.months++;
            }
            else if (milliseconds - 604800000 >= 0) {
                milliseconds -= 604800000;
                times.weeks += 7;
            }
            else if (milliseconds - 86400000 >= 0) {
                milliseconds -= 86400000;
                times.days++;
            }
            else if (milliseconds - 3600000 >= 0) {
                milliseconds -= 3600000;
                times.hours++;
            }
            else if (milliseconds - 60000 >= 0) {
                milliseconds -= 60000;
                times.minutes++;
            }
            else {
                times.seconds = Math.round(milliseconds / 1000);
                milliseconds = 0;
            }
        }
        const finalTime = [];
        let first = false;
        for (const [k, v] of Object.entries(times)) {
            if (minimal) {
                if (v === 0 && !first)
                    continue;
                finalTime.push(v < 10 ? `0${v}` : `${v}`);
                first = true;
                continue;
            }
            if (v > 0)
                finalTime.push(`${v} ${v > 1 ? k : k.slice(0, -1)}`);
        }
        if (minimal && finalTime.length === 1)
            finalTime.unshift("00");
        let time = finalTime.join(minimal ? ":" : ", ");
        if (time.includes(",")) {
            const pos = time.lastIndexOf(",");
            time = `${time.slice(0, pos)} and ${time.slice(pos + 1)}`;
        }
        return time;
    }
    /**
     * Parses the given duration into milliseconds.
     * @param time The duration to parse.
     * @returns The formatted duration.
     */
    static parseTime(time) {
        if (time.includes(":"))
            time = time
                .split(":")
                .reverse()
                .map((v, i) => v + template[i])
                .join("");
        if (time.includes(" "))
            time = time.split(/\s+/).join("");
        if (time.match(/^\d+$/))
            time = `${time}seconds`;
        const regex = /\d+\.*\d*\D+/g;
        let res;
        let duration = 0;
        while ((res = regex.exec(time)) !== null) {
            if (res.index === regex.lastIndex)
                regex.lastIndex++;
            const local = res[0].toLowerCase();
            if (local.endsWith("seconds") ||
                local.endsWith("second") ||
                (local.endsWith("s") &&
                    local.match(/\D+/)[0].length === 1)) {
                duration +=
                    parseInt(local.match(/\d+\.*\d*/)[0], 10) * 1000;
            }
            else if (local.endsWith("minutes") ||
                local.endsWith("minute") ||
                (local.endsWith("m") &&
                    local.match(/\D+/)[0].length === 1)) {
                duration +=
                    parseInt(local.match(/\d+\.*\d*/)[0], 10) * 60000;
            }
            else if (local.endsWith("hours") ||
                local.endsWith("hour") ||
                (local.endsWith("h") &&
                    local.match(/\D+/)[0].length === 1)) {
                duration +=
                    parseInt(local.match(/\d+\.*\d*/)[0], 10) * 3600000;
            }
            else if (local.endsWith("days") ||
                local.endsWith("day") ||
                (local.endsWith("d") &&
                    local.match(/\D+/)[0].length === 1)) {
                duration +=
                    parseInt(local.match(/\d+\.*\d*/)[0], 10) * 86400000;
            }
            else if (local.endsWith("weeks") ||
                local.endsWith("week") ||
                (local.endsWith("w") &&
                    local.match(/\D+/)[0].length === 1)) {
                duration +=
                    parseInt(local.match(/\d+\.*\d*/)[0], 10) * 604800000;
            }
            else if (local.endsWith("months") || local.endsWith("month")) {
                duration +=
                    parseInt(local.match(/\d+\.*\d*/)[0], 10) * 2628000000;
            }
            else if (local.endsWith("years") ||
                local.endsWith("year") ||
                (local.endsWith("y") &&
                    local.match(/\D+/)[0].length === 1)) {
                duration +=
                    parseInt(local.match(/\d+\.*\d*/)[0], 10) * 31557600000;
            }
        }
        if (duration === 0)
            return null;
        return duration;
    }
}
exports.Utils = Utils;
/** The Structure class. */
class Structure {
    /**
     * Extends a class.
     * @param extender
     */
    static extend(name, extender) {
        if (!exports.structures[name])
            throw new TypeError(`"${name} is not a valid structure`);
        const extended = extender(exports.structures[name]);
        exports.structures[name] = extended;
        return extended;
    }
    /**
     * Returns the structure.
     * @param structure
     */
    static get(structure) {
        const struct = exports.structures[structure];
        if (!struct)
            throw new TypeError('"structure" must be provided.');
        return struct;
    }
}
exports.Structure = Structure;
class Plugin {
    load(manager) { }
}
exports.Plugin = Plugin;
var LoadType;
(function (LoadType) {
    LoadType["TRACK_LOADED"] = "TRACK_LOADED";
    LoadType["PLAYLIST_LOADED"] = "PLAYLIST_LOADED";
    LoadType["SEARCH_RESULT"] = "SEARCH_RESULT";
    LoadType["LOAD_FAILED"] = "LOAD_FAILED";
    LoadType["NO_MATCHES"] = "NO_MATCHES";
})(LoadType = exports.LoadType || (exports.LoadType = {}));
var State;
(function (State) {
    State["CONNECTED"] = "CONNECTED";
    State["CONNECTING"] = "CONNECTING";
    State["DISCONNECTED"] = "DISCONNECTED";
    State["DISCONNECTING"] = "DISCONNECTING";
    State["DESTROYING"] = "DESTROYING";
})(State = exports.State || (exports.State = {}));
/** @hidden */
exports.structures = {
    Player: require("./Player").Player,
    Queue: require("./Queue").Queue,
    Node: require("./Node").Node,
};
