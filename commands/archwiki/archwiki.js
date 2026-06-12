import { Line } from "/lineUtil.js";

export function archwiki({ wrapper, argumentTokens } = {}) {
    const query = argumentTokens.join(" ").trim();
    let url;
    if (!query) {
        url = "https://wiki.archlinux.org";
    } else {
        const safeQuery = encodeURIComponent(query);
        url = `https://wiki.archlinux.org/index.php?search=${safeQuery}`;
    }
    wrapper?.append(
        new Line({
            textContent: `Opening \"${url}\"`,
        }),
    );
    window.open(url, "_self");
}
