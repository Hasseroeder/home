import { make } from "/jsUtils/injectionUtil.js";
import { Prompt } from "/lineUtil.js";
import { commandRegistry } from "/commands/commands.js";
import { initState, getState } from "/jsUtils/stateManager.js";

await initState();
const state = getState();
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
    input.focus();
}
document.addEventListener("click", handleDocumentClick);

function handleInputKeyDown(event) {
    if (event.key !== "Enter") return;
    const inputStr = event.target.value.trim();
    event.target.value = "";
    if (!inputStr) return;
    runCommand(inputStr);
}
input.addEventListener("keydown", handleInputKeyDown);

function runCommand(cmd) {
    history.append(new Prompt({ hostname: state.hostname, command: cmd }).el);

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

state.autorun.forEach(runCommand);
input.focus();
fetch("https://antix1.transaero.space/images/", {
    method: "GET",
    headers: {
        "x-api-key": "my_super_duper_mega_ultra_secure_API_key",
    },
});
