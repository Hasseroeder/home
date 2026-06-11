import { Line } from "/lineUtil.js";

export function google({ wrapper, argumentTokens } = {}) {
    const query = argumentTokens.join(" ").trim();
    if (!query) {
        wrapper?.append(
            new Line({ textContent: "usage: google search terms" }),
        );
        return;
    }
    const safeQuery = encodeURIComponent(query);
    const url = `https://www.google.com/search?q=${safeQuery}`;
    wrapper?.append(
        new Line({
            textContent: `Opening \"${url}\"`,
        }),
    );
    window.open(url, "_self");
}
