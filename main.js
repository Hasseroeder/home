import { make } from "/jsUtils/injectionUtil.js";
import { Prompt, Line } from "/lineUtil.js";
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

document.onclick = (e) => {
    const selection = window.getSelection();
    if (selection.toString().length > 0) return;
    const tag = e.target.tagName.toLowerCase();
    if (["a", "button", "input"].includes(tag)) return;
    if (e.target.isContentEditable) return;
    input.focus();
};

input.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    const inputStr = event.target.value;
    event.target.value = "";
    runCommand(inputStr);
});

function runCommand(string) {
    history.append(
        new Prompt({ hostname: state.hostname, command: string }).el,
    );

    const commandTokens = string.split(" ");
    const commandToken = commandTokens[0];
    const argumentTokens = commandTokens.slice(1);

    const commandObj = commandRegistry.find((command) =>
        command.aliases.includes(commandToken),
    );
    if (!commandObj) return;
    commandObj.command({
        wrapper: history,
        state,
        argumentTokens,
        commandRegistry,
    });
}

state.autorun.forEach(runCommand);
