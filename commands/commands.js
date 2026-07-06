import { help } from "/commands/help/help.js";
import { updateFingerprinting } from "/commands/updateFingerprinting/updateFingerprinting.js";
import { fastfetch } from "/commands/fastfetch/fastfetch.js";
import { nano } from "/commands/nano/nano.js";
import { Line } from "/lineUtil.js";
import { make } from "/jsUtils/injectionUtil.js";
import { cat } from "/commands/cat/cat.js";
import { search } from "/commands/search/search.js";
import { SearchEngine } from "/commands/search/searchEngine.js";

const clearCommand = ({ wrapper } = {}) => wrapper && (wrapper.innerHTML = "");

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
        command: help,
    },
    {
        name: "updateFingerprinting",
        aliases: ["updateFingerprinting"],
        description: "refresh fingerprinting info",
        command: updateFingerprinting,
    },
    {
        name: "nano",
        aliases: ["nano", "vi", "vim", "config", "edit"],
        description: "open a JSON state file editor (example: nano fastfetch.json)",
        command: nano,
    },
    {
        name: "reset",
        aliases: ["reset"],
        description: "restore all state (or one JSON state file) to default and reload",
        command: ({ stateStore, argumentTokens }) =>
            stateStore.reset(argumentTokens?.[0]),
    },
    {
        name: "cat",
        aliases: ["cat"],
        description: "print cattable file contents",
        command: cat,
    },
    {
        name: "search",
        aliases: ["search", "s", "!"],
        description: "open fake TUI search",
        command: search,
    },
];

export function initiateEngines(searchEngines) {
    const engines = searchEngines.map((config) => new SearchEngine(config));
    engines.forEach((engine) => {
        commandRegistry.push({
            name: engine.slug,
            aliases: engine.aliases,
            description: engine.description,
            command: (args) => engine.search_blank(args),
        });
        commandRegistry.push({
            name: engine.slug + "_self",
            aliases: engine.aliases_self,
            description: engine.description,
            command: (args) => engine.search_self(args),
        });
    });
}
