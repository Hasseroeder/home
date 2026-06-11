import { Line } from "/lineUtil.js";

export function printHelp({ wrapper, commandRegistry } = {}) {
    const helpLines = commandRegistry.flatMap((command) => [
        new Line({
            textContent: command.name,
        }),
        new Line({
            textContent: `  ${command.description}`,
        }),
        new Line({
            textContent: `  [ ${command.aliases.join(", ")} ]`,
        }),
    ]);

    wrapper.append(new Line(), ...helpLines, new Line());
}
