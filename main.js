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
        if (idx === -1) idx = cmdHistory.length;
        if (idx > 0) idx--;
        setRuntime("commandHistoryIndex", idx);
        input.value = cmdHistory[idx] || "";
        return;
    }

    // ArrowDown
    if (idx === -1) return;
    if (idx < cmdHistory.length - 1) {
        idx++;
        setRuntime("commandHistoryIndex", idx);
        input.value = cmdHistory[idx] || "";
        return;
    }

    // moved past the newest entry: restore temp and reset cursor
    const temp = state?.commandHistoryTemp || "";
    setRuntime("commandHistoryIndex", -1);
    input.value = temp;
}

function runCommand(cmd) {
    try {
        const prev = state?.commandHistory || [];
        const deduped = prev.filter((c) => c !== cmd);
        setRuntime("commandHistory", [...deduped, cmd]);
        setRuntime("commandHistoryIndex", -1);
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

document.addEventListener("keydown", (e) => {
    if (!e.ctrlKey) return;
    const anchors = window.latestCatAnchors;
    if (!anchors || !anchors.length) return;
    if (!e.key === "ArrowDown" && !e.key === "ArrowUp") return;
    e.preventDefault();

    let idx = window.latestCatIndex ?? -1;
    if (e.key === "ArrowDown") {
        idx = idx + 1;
    } else if (e.key === "ArrowUp") {
        idx = idx - 1;
    }
    idx = Math.max(0, Math.min(idx, anchors.length - 1));

    window.latestCatIndex = idx;
    const el = anchors[idx];
    if (el) {
        el.focus();
        el.scrollIntoView({ block: "nearest", inline: "nearest" });
    }
});
