import { Line } from "/lineUtil.js";

export function youtube({ wrapper, argumentTokens } = {}) {
    const query = argumentTokens.join(" ").trim();
    if (!query) {
        wrapper?.append(
            new Line({ textContent: "usage: youtube search terms" }),
        );
        return;
    }
    const safeQuery = encodeURIComponent(query);
    const url = `https://www.youtube.com/results?search_query=${safeQuery}`;
    wrapper?.append(
        new Line({
            textContent: `Opening \"${url}\"`,
        }),
    );
    window.open(url, "_blank");
}
