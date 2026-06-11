import { Line } from "/lineUtil.js";

export function archwiki({ wrapper, argumentTokens } = {}) {
    const query = argumentTokens.join(" ").trim();
    if (!query) {
        wrapper?.append(
            new Line({ textContent: "usage: archwiki search terms" }),
        );
        return;
    }
    const safeQuery = encodeURIComponent(query);
    const url = `https://wiki.archlinux.org/index.php?search=${safeQuery}`;
    wrapper?.append(
        new Line({
            textContent: `Opening \"${url}\"`,
        }),
    );
    window.open(url, "_self");
}
