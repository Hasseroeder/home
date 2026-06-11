import { printHelp } from "/commands/help/help.js";
import { updateFingerprinting } from "/commands/updateFingerprinting/updateFingerprinting.js";
import { fastfetch } from "/commands/fastfetch/fastfetch.js";

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
            while (wrapper.lastChild) wrapper.lastChild.remove();
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
];
