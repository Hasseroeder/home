import { make } from "/jsUtils/injectionUtil.js";
import { Prompt } from "/lineUtil.js";
import { commandRegistry } from "/commands/commands.js";
import { initState, getState, setRuntime } from "/jsUtils/stateManager.js";

const initStatePromise = initState();

const bodyWrapper = document.querySelector(".body-wrapper");
const history = document.querySelector(".command-history");
const input = make("input", { type: "text" });
bodyWrapper.append(
    new Prompt({ className: "command-line command-input", child: input }).el,
);

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
        if (!inputStr) return;
        runCommand(inputStr);
        return;
    }

    // handle history navigation
    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
        event.preventDefault();
        navigateHistory(event.key === "ArrowUp");
        return;
    }
}
input.addEventListener("keydown", handleInputKeyDown);

function navigateHistory(isUp) {
    const cmdHistory = state?.commandHistory || [];
    if (!cmdHistory || !cmdHistory.length) return;

    let idx = state?.commandHistoryIndex ?? -1;

    if (isUp) {
        // starting navigation: stash current input
        if (idx === -1) setRuntime("commandHistoryTemp", input.value || "");
        if (idx === -1) idx = cmdHistory.length;
        if (idx > 0) idx -= 1;
        setRuntime("commandHistoryIndex", idx);
        input.value = cmdHistory[idx] || "";
        input.setSelectionRange(input.value.length, input.value.length);
        return;
    }

    // ArrowDown
    if (idx === -1) return;
    if (idx < cmdHistory.length - 1) {
        idx += 1;
        setRuntime("commandHistoryIndex", idx);
        input.value = cmdHistory[idx] || "";
        input.setSelectionRange(input.value.length, input.value.length);
        return;
    }

    // moved past the newest entry: restore temp and reset cursor
    const temp = state?.commandHistoryTemp || "";
    setRuntime("commandHistoryIndex", -1);
    setRuntime("commandHistoryTemp", "");
    input.value = temp;
    input.setSelectionRange(input.value.length, input.value.length);
}

function runCommand(cmd) {
    try {
        const prev = state?.commandHistory || [];
        // keep only the latest instance of the command
        const deduped = prev.filter((c) => c !== cmd);
        setRuntime("commandHistory", [...deduped, cmd]);
        setRuntime("commandHistoryIndex", -1);
        setRuntime("commandHistoryTemp", "");
    } catch {}

    history.append(new Prompt({ hostname: state?.hostname, command: cmd }).el);

    const [name, ...args] = cmd.split(/\s+/);

    const commandObj = commandRegistry.find((c) => c.aliases.includes(name));
    if (!commandObj) return;
    commandObj.command({
        wrapper: history,
        input,
        state,
        argumentTokens: args,
        commandRegistry,
    });
    input.scrollIntoView();
}

await initStatePromise;
const state = getState();
state.autorun.forEach(runCommand);
input.focus();
