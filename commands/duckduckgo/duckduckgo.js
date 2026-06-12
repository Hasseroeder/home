import { Line } from "/lineUtil.js";

export function duckduckgo({ wrapper, argumentTokens } = {}) {
    const query = argumentTokens.join(" ").trim();
    let url;
    if (!query) {
        url = "https://duckduckgo.com";
    } else {
        const safeQuery = encodeURIComponent(query);
        url = `https://duckduckgo.com/?q=${safeQuery}`;
    }
    wrapper?.append(
        new Line({
            textContent: `Opening \"${url}\"`,
        }),
    );
    window.open(url, "_self");
}
