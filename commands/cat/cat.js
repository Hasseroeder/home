import { Line } from "/lineUtil.js";
import { make } from "/jsUtils/injectionUtil.js";

const anchors = [];
let idx;

export function cat({ wrapper, argumentTokens, state, input } = {}) {
    anchors.length = 0;
    idx = -1;
    function listenForKeyboardNavigation(e) {
        if (!e.ctrlKey) return;
        if (!anchors.length) return;
        if (!e.key === "ArrowDown" && !e.key === "ArrowUp") return;
        e.preventDefault();

        if (e.key === "ArrowDown") {
            idx = idx + 1;
        } else if (e.key === "ArrowUp") {
            idx = idx - 1;
        }
        idx = Math.max(0, Math.min(idx, anchors.length - 1));

        const el = anchors[idx];
        if (el) {
            el.focus();
            el.scrollIntoView({ block: "nearest", inline: "nearest" });
        }
    }

    document.addEventListener("keydown", listenForKeyboardNavigation);
    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter")
            document.removeEventListener(
                "keydown",
                listenForKeyboardNavigation,
            );
    });

    const name = (argumentTokens || []).join(" ").trim();
    if (!name) {
        wrapper?.append(new Line({ textContent: "usage: cat <filename>" }));
        return;
    }

    const files = state?.cattableFiles || [];
    const file = files.find((f) => f.name === name);
    if (!file) {
        wrapper?.append(
            new Line({ textContent: `cat: ${name}: No such file` }),
        );
        return;
    }

    const printEntry = (entry, depth = 0) => {
        const href = entry.href || "";
        const text = entry.text || "";
        const lineEl = make("div", { className: "command-line" });
        lineEl.style.paddingLeft = `${depth * 1}rem`;
        if (href) {
            const anchor = make("a", { href, textContent: text });
            anchor.className = "cat-link";
            anchor.dataset.catIndex = anchors.length;
            anchors.push(anchor);
            lineEl.append(anchor);
        } else {
            lineEl.textContent = text;
        }
        wrapper?.append(lineEl);
        if (entry.entries && entry.entries.length) {
            entry.entries.forEach((e) => printEntry(e, depth + 1));
        }
    };

    (file.entries || []).forEach((e) => printEntry(e, 0));
}
