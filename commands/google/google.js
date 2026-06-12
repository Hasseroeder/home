import { Line } from "/lineUtil.js";

export function google({ wrapper, argumentTokens } = {}) {
    const query = argumentTokens.join(" ").trim();
    let url;
    if (!query) {
        url = "https://www.google.com";
    } else {
        const safeQuery = encodeURIComponent(query);
        url = `https://www.google.com/search?q=${safeQuery}`;
    }
    wrapper?.append(
        new Line({
            textContent: `Opening \"${url}\"`,
        }),
    );
    window.open(url, "_self");
}
