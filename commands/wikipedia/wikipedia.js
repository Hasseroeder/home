import { Line } from "/lineUtil.js";

export function wikipedia({ wrapper, argumentTokens } = {}) {
    const query = argumentTokens.join(" ").trim();
    if (!query) {
        wrapper?.append(
            new Line({ textContent: "usage: wikipedia search terms" }),
        );
        return;
    }
    const safeQuery = encodeURIComponent(query);
    const url = `https://en.wikipedia.org/wiki/Special:Search?search=${safeQuery}`;
    wrapper?.append(
        new Line({
            textContent: `Opening \"${url}\"`,
        }),
    );
    window.open(url, "_self");
}
