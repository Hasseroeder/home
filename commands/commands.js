import { printHelp } from "/commands/help/help.js";
import { updateFingerprinting } from "/commands/updateFingerprinting/updateFingerprinting.js";
import { fastfetch } from "/commands/fastfetch/fastfetch.js";
import { youtube } from "/commands/youtube/youtube.js";
import { duckduckgo } from "/commands/duckduckgo/duckduckgo.js";
import { google } from "/commands/google/google.js";
import { wikipedia } from "/commands/wikipedia/wikipedia.js";
import { archwiki } from "/commands/archwiki/archwiki.js";
import { set as setState, resetPersistent } from "/jsUtils/stateManager.js";
import { nano } from "/commands/nano/nano.js";
import { Line } from "/lineUtil.js";

const clearCommand = ({ wrapper } = {}) => wrapper && (wrapper.innerHTML = "");

function setCommand({ wrapper, argumentTokens } = {}) {
    const raw = (argumentTokens || []).join(" ").trim();
    const [leftPart, ...rest] = raw.split("=");
    if (!rest.length) {
        wrapper?.append(
            new Line({ textContent: "usage: set path = jsonValue" }),
        );
        return;
    }
    const left = leftPart.trim();
    const right = rest.join("=").trim();
    let value;
    try {
        value = JSON.parse(right);
    } catch (_) {
        value = right;
    }
    setState(left, value);
    wrapper?.append(
        new Line({ textContent: `Set ${left} = ${JSON.stringify(value)}` }),
    );
}

export const commandRegistry = [
    {
        name: "fetch",
        aliases: ["fetch", "fastfetch", "hyfetch", "neofetch"],
        description: "shows session info",
        command: fastfetch,
    },
    {
        name: "clear",
        aliases: ["c", "clear"],
        description: "clears command history",
        command: clearCommand,
    },
    {
        name: "help",
        aliases: ["h", "help"],
        description: "shows a list of commands, descriptions and aliases",
        command: printHelp,
    },
    {
        name: "updateFingerprinting",
        aliases: ["updateFingerprinting"],
        description: "refresh fingerprinting info",
        command: updateFingerprinting,
    },
    {
        name: "set",
        aliases: ["set"],
        description:
            'set state value by path (e.g. set config.autorun = ["fetch"])',
        command: setCommand,
    },
    {
        name: "nano",
        aliases: ["nano", "vi", "vim", "config", "edit"],
        description: "open JSON state editor",
        command: nano,
    },
    {
        name: "reset",
        aliases: ["reset"],
        description: "restore persistent state to default and reload",
        command: resetPersistent,
    },
    {
        name: "youtube",
        aliases: ["youtube", "y", "!y"],
        description: "search YouTube for videos",
        command: youtube,
    },
    {
        name: "duckduckgo",
        aliases: ["duckduckgo", "d", "!d"],
        description: "search DuckDuckGo for results",
        command: duckduckgo,
    },
    {
        name: "google",
        aliases: ["google", "g", "!g"],
        description: "search Google for results",
        command: google,
    },
    {
        name: "wikipedia",
        aliases: ["wikipedia", "w", "!w"],
        description: "search Wikipedia for results",
        command: wikipedia,
    },
    {
        name: "archlinux wiki",
        aliases: ["archwiki", "a", "!a"],
        description: "search ArchWiki for results",
        command: archwiki,
    },
];
