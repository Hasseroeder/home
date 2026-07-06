import { Line } from "/lineUtil.js";

function aliasesCell(aliases = []) {
    return `[ ${aliases.join(", ")} ]`;
}

function commandLines(commands) {
    return commands.flatMap((command) => [
        new Line({
            textContent: command.name,
        }),
        new Line({
            textContent: `  ${command.description}`,
        }),
        new Line({
            textContent: `  ${aliasesCell(command.aliases)}`,
        }),
    ]);
}

function editableJsonLines(stateStore) {
    const files = stateStore?.listFiles?.() ?? [];
    if (!files.length) return [];

    return [
        new Line({ textContent: "Editable JSON Files:" }),
        new Line({ textContent: "  usage: nano <file>.json" }),
        ...files.map(
            (fileName) => new Line({ textContent: `  - ${fileName}` }),
        ),
        new Line(),
    ];
}

function directSearchLines(searchCommands) {
    if (!searchCommands.length) return [];

    const rows = [
        ["Engine", "open in _blank", "open in _self"],
        ["------", "--------------", "-------------"],
    ];
    let longestEngineName = rows[0][0].length;
    let longestBlankAliases = rows[0][1].length;
    let longestSelfAliases = rows[0][2].length;

    searchCommands.forEach((command) => {
        const slug = command.searchEngine?.slug ?? "unknown";
        const prettyName = command.searchEngine?.prettyName ?? slug;
        longestEngineName = Math.max(longestEngineName, prettyName.length);
        let commandRow = rows.find((row) => row[0] === prettyName);
        if (!commandRow) {
            commandRow = [prettyName, "", ""];
            rows.push(commandRow);
        }
        if (command.searchTarget === "blank") {
            commandRow[1] = aliasesCell(command.aliases);
            longestBlankAliases = Math.max(
                longestBlankAliases,
                commandRow[1].length,
            );
        } else if (command.searchTarget === "self") {
            commandRow[2] = aliasesCell(command.aliases);
            longestSelfAliases = Math.max(
                longestSelfAliases,
                commandRow[2].length,
            );
        }
    });

    const toOutput = rows.map((row, i) => {
        const padChar = i === 1 ? "-" : " ";
        return [
            row[0].padEnd(longestEngineName, padChar),
            row[1].padEnd(longestBlankAliases, padChar),
            row[2].padEnd(longestSelfAliases, padChar),
        ];
    });
    return [
        new Line({ textContent: "Direct Search Commands:" }),
        ...toOutput.map(
            (row) => new Line({ textContent: "  " + row.join(" | ") }),
        ),
    ];
}

export function help({ wrapper, commandRegistry, stateStore } = {}) {
    const searchCommands = commandRegistry.filter(
        (command) => command.category === "searchEngine",
    );
    const regularCommands = commandRegistry.filter(
        (command) => command.category !== "searchEngine",
    );

    wrapper.append(
        new Line(),
        ...commandLines(regularCommands),
        new Line(),
        ...editableJsonLines(stateStore),
        ...directSearchLines(searchCommands),
        new Line(),
    );
}
