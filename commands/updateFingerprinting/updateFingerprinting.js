import { Prompt } from "/lineUtil.js";

export function updateFingerprinting({ state } = {}) {
    state.fingerPrintInfo = {
        ...bowser.getParser(window.navigator.userAgent).parsedResult,
        language: navigator.language || navigator.userLanguage,
    };

    state.hostname =
        state.userName +
        "@" +
        state.fingerPrintInfo.browser.name.toLowerCase() +
        "-" +
        state.fingerPrintInfo.browser.version.split(".")[0];

    Prompt.array.forEach((prompt) => (prompt.hostname = state.hostname));
}
