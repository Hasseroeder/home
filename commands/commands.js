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
        description:
            "open a JSON state file editor for personalizing app state",
        command: nano,
    },
    {
        name: "reset",
        aliases: ["reset [filename]"],
        description:
            "restore all state (or one JSON state file) to default and reload",
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
        name: "searchTUI",
        aliases: ["searchTUI", "search", "s", "!"],
        description: "open fake TUI search",
        command: search,
        customHelp: true,
    },
];

export function initiateEngines(searchEngines) {
    const engines = searchEngines.map((config) => new SearchEngine(config));
    engines.forEach((engine) => {
        commandRegistry.push({
            customHelp: true,
            aliases: engine.aliases,
            category: "searchEngine",
            searchTarget: "blank",
            searchEngine: {
                slug: engine.slug,
                prettyName: engine.prettyName,
            },
            command: (args) => engine.search_blank(args),
        });
        commandRegistry.push({
            customHelp: true,
            aliases: engine.aliases_self,
            category: "searchEngine",
            searchTarget: "self",
            searchEngine: {
                slug: engine.slug,
                prettyName: engine.prettyName,
            },
            command: (args) => engine.search_self(args),
        });
    });
}
