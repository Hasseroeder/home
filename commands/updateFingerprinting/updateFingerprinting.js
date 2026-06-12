import { Prompt } from "/lineUtil.js";
import { setRuntime } from "/jsUtils/stateManager.js";

export function updateFingerprinting({ state } = {}) {
    const fp = {
        ...bowser.getParser(window.navigator.userAgent).parsedResult,
        language: navigator.language || navigator.userLanguage,
    };
    setRuntime("fingerPrintInfo", fp);

    const hostName =
        (state && state.userName ? state.userName : "") +
        "@" +
        fp.browser.name.toLowerCase() +
        "-" +
        fp.browser.version.split(".")[0];

    setRuntime("hostName", hostName);

    Prompt.array.forEach((prompt) => (prompt.hostName = hostName));
}
