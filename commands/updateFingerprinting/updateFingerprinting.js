import { Prompt } from "/lineUtil.js";

export function updateFingerprinting({ stateStore } = {}) {
    const state = stateStore.getState();
    const fp = {
        ...bowser.getParser(window.navigator.userAgent).parsedResult,
        language: navigator.language || navigator.userLanguage,
    };
    state.fingerPrintInfo = fp;

    const hostName =
        (state && state.userName ? state.userName : "") +
        "@" +
        fp.browser.name.toLowerCase() +
        "-" +
        fp.browser.version.split(".")[0];

    state.hostName = hostName;

    Prompt.array.forEach((prompt) => (prompt.hostName = hostName));
}
