import { printHelp } from "/commands/help/help.js";
import { updateFingerprinting } from "/commands/updateFingerprinting/updateFingerprinting.js";
import { fastfetch } from "/commands/fastfetch/fastfetch.js";
import { set as setState, resetPersistent } from "/jsUtils/stateManager.js";
import { nano } from "/commands/nano/nano.js";
import { Line } from "/lineUtil.js";

const SEARCH_ENGINES = {
    youtube: (q) =>
        q
            ? `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`
            : "https://www.youtube.com",
    duckduckgo: (q) =>
        q
            ? `https://duckduckgo.com/?q=${encodeURIComponent(q)}`
            : "https://duckduckgo.com",
    google: (q) =>
        q
            ? `https://www.google.com/search?q=${encodeURIComponent(q)}`
            : "https://www.google.com",
    wikipedia: (q) =>
        q
            ? `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(q)}`
            : "https://en.wikipedia.org",
    arch_linux_wiki: (q) =>
        q
            ? `https://wiki.archlinux.org/index.php?search=${encodeURIComponent(q)}`
            : "https://wiki.archlinux.org",
};

const makeSearchCommand =
    (searchFn) =>
    ({ wrapper, argumentTokens } = {}) => {
        const query = (argumentTokens || []).join(" ").trim();
        const url = searchFn(query);
        wrapper?.append(new Line({ textContent: `Opening "${url}"` }));
        window.open(url, "_self");
    };

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
        engine: "youtube",
        command: makeSearchCommand(SEARCH_ENGINES.youtube),
    },
    {
        name: "duckduckgo",
        aliases: ["duckduckgo", "d", "!d"],
        description: "search DuckDuckGo for results",
        engine: "duckduckgo",
        command: makeSearchCommand(SEARCH_ENGINES.duckduckgo),
    },
    {
        name: "google",
        aliases: ["google", "g", "!g"],
        description: "search Google for results",
        engine: "google",
        command: makeSearchCommand(SEARCH_ENGINES.google),
    },
    {
        name: "wikipedia",
        aliases: ["wikipedia", "w", "!w"],
        description: "search Wikipedia for results",
        engine: "wikipedia",
        command: makeSearchCommand(SEARCH_ENGINES.wikipedia),
    },
    {
        name: "arch_linux_wiki",
        aliases: ["arch_linux_wiki", "a", "!a"],
        description: "search ArchWiki for results",
        command: makeSearchCommand(SEARCH_ENGINES.arch_linux_wiki),
    },
];
