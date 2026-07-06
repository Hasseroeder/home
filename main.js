import { make } from "/jsUtils/injectionUtil.js";
import { Prompt } from "/lineUtil.js";
import { commandRegistry, initiateEngines } from "/commands/commands.js";
import { createStateManager } from "/jsUtils/stateManager.js";

const stateStore = createStateManager("app_state", {
    "autostart.json": {
        path: "/defaultState/autostart.json",
        keys: ["autorun"],
    },
    "profile.json": {
        path: "/defaultState/profile.json",
        keys: ["userName", "hostName"],
    },
    "search.json": {
        path: "/defaultState/search.json",
        keys: ["searchEngines"],
    },
    "links.json": {
        path: "/defaultState/links.json",
        keys: ["cattableFiles"],
    },
    "fastfetch.json": {
        path: "/defaultState/fastfetch.json",
        keys: ["fetchModules"],
    },
});
await stateStore.init();
const state = stateStore.getState();
state.IANApromise = fetch("https://data.iana.org/TLD/tlds-alpha-by-domain.txt");

const bodyWrapper = document.querySelector(".body-wrapper");
const history = document.querySelector(".command-history");

function handleDocumentClick(e) {
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) return;
    const el = e.target;
    if (el.isContentEditable) return;
    if (
        el.closest &&
        el.closest("a, button, input, textarea, select, [tabindex]")
    )
        return;

    const searchInput = document.querySelector(".search-root input");
    if (searchInput) {
        searchInput.focus();
        return;
    }
    input.focus();
}
document.addEventListener("click", handleDocumentClick);

function handleInputKeyDown(event) {
    // handle enter
    if (event.key === "Enter") {
        const inputStr = event.target.value.trim();
        event.target.value = "";
        runCommand(inputStr);
        return;
    }

    // handle history navigation
    if (event.ctrlKey) return;
    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
        event.preventDefault();
        navigateHistory(event.key === "ArrowUp");
        return;
    }
}

function navigateHistory(isUp) {
    const cmdHistory = state?.commandHistory || [];
    if (!cmdHistory || !cmdHistory.length) return;

    let idx = state?.commandHistoryIndex ?? -1;

    if (isUp) {
        if (idx === -1) idx = cmdHistory.length;
        if (idx > 0) idx--;
        state.commandHistoryIndex = idx;
        input.value = cmdHistory[idx] || "";
        return;
    }

    // ArrowDown
    if (idx === -1) return;
    if (idx < cmdHistory.length - 1) {
        idx++;
        state.commandHistoryIndex = idx;
        input.value = cmdHistory[idx] || "";
        return;
    }

    // moved past the newest entry: restore temp and reset cursor
    const temp = state?.commandHistoryTemp || "";
    state.commandHistoryIndex = -1;
    input.value = temp;
}

async function runCommand(CMD) {
    try {
        const prev = state?.commandHistory || [];
        const deduped = prev.filter((c) => c !== CMD);
        state.commandHistory = [...deduped, CMD];
        state.commandHistoryIndex = -1;
    } catch {}

    history.append(new Prompt({ hostName: state?.hostName, command: CMD }).el);

    const [name, ...args] = CMD.split(/\s+/);

    const commandObj = commandRegistry.find((c) => c.aliases.includes(name));
    commandObj?.command({
        wrapper: history,
        input,
        stateStore,
        argumentTokens: args,
        commandRegistry,
    });
    if (!commandObj) {
        if (!state.TLDs)
            await state.IANApromise.then((r) => r.text())
                .then((txt) => txt.split(/\r?\n/).slice(1, -1))
                .then((lines) => (state.TLDs = lines));

        const cmd = CMD.toLowerCase();
        const tlds = state.TLDs.map((TLD) => TLD.toLowerCase());
        const tld = tlds.find((tld) => cmd.includes(`.${tld}`));
        if (!tld) return;

        if (CMD.includes("://")) window.open(CMD);
        else window.open("http://" + CMD);
    }

    input.scrollIntoView();
}

const input = make("input", { type: "text" });
bodyWrapper.append(
    new Prompt({
        className: "command-line command-input",
        hostName: state.hostName,
        child: input,
    }).el,
);
input.addEventListener("keydown", handleInputKeyDown);
initiateEngines(state.searchEngines ?? []);
state.autorun.forEach(await runCommand);
input.focus();
