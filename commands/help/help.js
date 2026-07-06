import { Line } from "/lineUtil.js";

function commandLines(commands) {
    return commands.flatMap((command) => [
        new Line({
            textContent: command.name,
        }),
        new Line({
            textContent: `  description:  ${command.description}`,
        }),
        new Line({
            textContent: `  aliases:      ${command.aliases.join(", ")}`,
        }),
        new Line(),
    ]);
}

function nanoHelp(command, stateStore) {
    const files = stateStore?.listFiles?.() ?? [];
    return [
        new Line({
            textContent: command.name,
        }),
        new Line({
            textContent: `  description:     ${command.description}`,
        }),
        new Line({
            textContent: `  aliases:         ${command.aliases.join(", ")}`,
        }),
        new Line({
            textContent: `  editable files:  ${files.join(", ")}`,
        }),
        new Line(),
    ];
}

function searchHelp(searchCommands) {
    if (!searchCommands.length) return [];

    const rows = [
        ["Engine", "open in _blank", "open in _self"],
        ["------", "--------------", "-------------"],
    ];

    searchCommands.forEach((command) => {
        const slug = command.searchEngine?.slug ?? "unknown";
        const prettyName = command.searchEngine?.prettyName ?? slug;
        let commandRow = rows.find((row) => row[0] === prettyName);
        if (!commandRow) {
            commandRow = [prettyName, "", ""];
            rows.push(commandRow);
        }
        if (command.searchTarget === "blank")
            commandRow[1] = command.aliases.join(", ");
        else if (command.searchTarget === "self")
            commandRow[2] = command.aliases.join(", ");
    });

    let maxLength = [0, 0, 0];
    rows.forEach((row) => {
        row.forEach((str, i) => {
            maxLength[i] = Math.max(maxLength[i], str.length);
        });
    });
    rows.forEach((row) => {
        row.forEach((str, i) => {
            row[i] = str.padEnd(maxLength[i], " ");
        });
    });

    return [
        new Line({ textContent: "Direct Search Commands:" }),
        ...rows.map((row) => new Line({ textContent: "  " + row.join(" | ") })),
    ];
}

export function help({ wrapper, commandRegistry, stateStore } = {}) {
    const searchCommands = commandRegistry.filter(
        (command) => command.category === "searchEngine",
    );
    const nanoCommand = commandRegistry.find(
        (command) => command.name === "nano",
    );
    const regularCommands = commandRegistry.filter(
        (command) => !command.customHelp,
    );

    wrapper.append(
        ...commandLines(regularCommands),
        ...nanoHelp(nanoCommand, stateStore),
        ...searchHelp(searchCommands),
    );
}
