import { Line } from "/lineUtil.js";

export function wikipedia({ wrapper, argumentTokens } = {}) {
    const query = argumentTokens.join(" ").trim();
    let url;
    if (!query) {
        url = "https://en.wikipedia.org";
    } else {
        const safeQuery = encodeURIComponent(query);
        url = `https://en.wikipedia.org/wiki/Special:Search?search=${safeQuery}`;
    }
    wrapper?.append(
        new Line({
            textContent: `Opening \"${url}\"`,
        }),
    );
    window.open(url, "_self");
}
