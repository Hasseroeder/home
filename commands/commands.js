import { printHelp } from "/commands/help/help.js";
import { updateFingerprinting } from "/commands/updateFingerprinting/updateFingerprinting.js";
import { fastfetch } from "/commands/fastfetch/fastfetch.js";
import { set as setState, resetPersistent } from "/jsUtils/stateManager.js";
import { nano } from "/commands/nano/nano.js";
import { Line } from "/lineUtil.js";

export const commandRegistry = [
    {
        prettyName: "fetch",
        aliases: ["fetch", "fastfetch", "hyfetch", "neofetch"],
        description:
            "fetches interesting or useful information about current session",
        command: fastfetch,
    },
    {
        prettyName: "clear",
        aliases: ["c", "clear"],
        description: "clears up command history",
        command: (wrapper) => {
            wrapper.innerHTML = "";
        },
    },
    {
        prettyName: "help",
        aliases: ["h", "help"],
        description: "shows a list of commands, descriptions and aliases",
        command: printHelp,
    },
    {
        prettyName: "updateFingerprinting",
        aliases: ["updateFingerprinting"],
        description:
            "debug function used to refresh outdated fingerprinting info",
        command: updateFingerprinting,
    },
    {
        prettyName: "set",
        aliases: ["set"],
        description:
            'set a state value by path. Example: set config.autorun = ["fetch"]',
        command: ({ wrapper, argumentTokens } = {}) => {
            const raw = argumentTokens.join(" ");
            const parts = raw.split("=");
            if (parts.length < 2) {
                wrapper.append(
                    new Line({ textContent: "usage: set path = jsonValue" }),
                );
                return;
            }
            const left = parts.shift().trim();
            const right = parts.join("=").trim();
            let value;
            try {
                value = JSON.parse(right);
            } catch (err) {
                value = right;
            }
            setState(left, value);
            wrapper.append(
                new Line({
                    textContent: `Set ${left} = ${JSON.stringify(value)}`,
                }),
            );
        },
    },
    {
        prettyName: "nano",
        aliases: ["nano", "editstate", "editor"],
        description: "open simple JSON editor for state",
        command: ({ wrapper } = {}) => {
            nano();
            wrapper.append(
                new Line({ textContent: "Opened state editor (in-page)." }),
            );
        },
    },
    {
        prettyName: "reset",
        aliases: ["reset", "resetstate"],
        description: "restore persistent state to default and reload",
        command: () => resetPersistent(),
    },
];
