import { printHelp } from "/commands/help/help.js";
import { updateFingerprinting } from "/commands/updateFingerprinting/updateFingerprinting.js";
import { fastfetch } from "/commands/fastfetch/fastfetch.js";
import { set as setState, resetPersistent } from "/jsUtils/stateManager.js";
import { nano } from "/commands/nano/nano.js";
import { Line } from "/lineUtil.js";

function clearCommand({ wrapper } = {}) {
    if (wrapper) wrapper.innerHTML = "";
}

function setCommand({ wrapper, argumentTokens } = {}) {
    const raw = (argumentTokens || []).join(" ").trim();
    const [leftPart, ...rest] = raw.split("=");
    if (!rest.length) {
        if (wrapper)
            wrapper.append(new Line({ textContent: "usage: set path = jsonValue" }));
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
    if (wrapper)
        wrapper.append(
            new Line({ textContent: `Set ${left} = ${JSON.stringify(value)}` }),
        );
}

function nanoCommand({ wrapper } = {}) {
    nano();
    if (wrapper)
        wrapper.append(new Line({ textContent: "Opened state editor (in-page)." }));
}

export const commandRegistry = [
    {
        name: "fetch",
        aliases: ["fetch", "fastfetch", "hyfetch", "neofetch"],
        description:
            "fetches interesting or useful information about current session",
        command: fastfetch,
    },
    {
        name: "clear",
        aliases: ["c", "clear"],
        description: "clears up command history",
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
        description:
            "debug function used to refresh outdated fingerprinting info",
        command: updateFingerprinting,
    },
    {
        name: "set",
        aliases: ["set"],
        description:
            'set a state value by path. Example: set config.autorun = ["fetch"]',
        command: setCommand,
    },
    {
        name: "nano",
        aliases: ["nano", "editstate", "editor"],
        description: "open simple JSON editor for state",
        command: nanoCommand,
    },
    {
        name: "reset",
        aliases: ["reset", "resetstate"],
        description: "restore persistent state to default and reload",
        command: () => resetPersistent(),
    },
];
