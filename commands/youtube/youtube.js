import { Line } from "/lineUtil.js";

export function youtube({ wrapper, argumentTokens } = {}) {
    const query = argumentTokens.join(" ").trim();
    let url;
    if (!query) {
        url = "https://www.youtube.com";
    } else {
        const safeQuery = encodeURIComponent(query);
        url = `https://www.youtube.com/results?search_query=${safeQuery}`;
    }
    wrapper?.append(
        new Line({
            textContent: `Opening \"${url}\"`,
        }),
    );
    window.open(url, "_self");
}
