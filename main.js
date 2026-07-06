import { make } from "/jsUtils/injectionUtil.js";
import { Prompt } from "/lineUtil.js";
import { commandRegistry, initiateEngines } from "/commands/commands.js";
import { createStateManager } from "/jsUtils/stateManager.js";

const stateStore = createStateManager([
    "/defaultState/autorun.json",
    "/defaultState/profile.json",
    "/defaultState/searchEngines.json",
    "/defaultState/cattableFiles.json",
    "/defaultState/fetchModules.json",
    "/defaultState/iana.json",
]);
await stateStore.init();
const state = stateStore.getState();

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

    const [name, ...argumentTokens] = CMD.split(/\s+/);

    const commandObj = commandRegistry.find((c) => c.aliases.includes(name));
    commandObj?.command({
        wrapper: history,
        input,
        stateStore,
        argumentTokens,
        commandRegistry,
    });
    if (!commandObj) {
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
