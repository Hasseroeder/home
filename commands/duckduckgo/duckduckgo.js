import { Line } from "/lineUtil.js";

export function duckduckgo({ wrapper, argumentTokens } = {}) {
    const query = argumentTokens.join(" ").trim();
    if (!query) {
        wrapper?.append(
            new Line({ textContent: "usage: duckduckgo search terms" }),
        );
        return;
    }
    const safeQuery = encodeURIComponent(query);
    const url = `https://duckduckgo.com/?q=${safeQuery}`;
    wrapper?.append(
        new Line({
            textContent: `Opening \"${url}\"`,
        }),
    );
    window.open(url, "_self");
}
