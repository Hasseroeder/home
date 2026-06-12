import { Line } from "/lineUtil.js";
import { make } from "/jsUtils/injectionUtil.js";

const anchors = [];
let idx;
let columns = null;
let _currentColumn = undefined;
let colIdx = 0;
let rowIdx = -1;

export function cat({ wrapper, argumentTokens, state, input } = {}) {
    anchors.length = 0;
    idx = -1;

    const columnsMode =
        argumentTokens &&
        argumentTokens[1] &&
        argumentTokens[1].trim() === "|" &&
        argumentTokens[2] &&
        argumentTokens[2].trim() === "column";
    const columnsCount = columnsMode ? 6 : 1;

    function listenForKeyboardNavigation(e) {
        if (!anchors.length) return;
        if (!e.ctrlKey) return input.focus();

        const keys = ["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight"];
        if (!keys.includes(e.key)) return;
        e.preventDefault();

        // infer current position from focused element when possible
        const active = document.activeElement;
        if (
            active &&
            active.classList &&
            active.classList.contains("cat-link") &&
            active.dataset.catCol != null
        ) {
            colIdx = Number(active.dataset.catCol);
            rowIdx = Number(active.dataset.catRow);
        } else {
            // initialize position
            colIdx = Math.max(0, Math.min(colIdx, (columns || []).length - 1));
            rowIdx = Math.max(
                0,
                Math.min(
                    rowIdx,
                    columns && columns[colIdx]
                        ? columns[colIdx].length - 1
                        : -1,
                ),
            );
        }

        if (e.key === "ArrowDown") {
            if (columns[colIdx] && rowIdx < columns[colIdx].length - 1)
                rowIdx++;
        } else if (e.key === "ArrowUp") {
            if (rowIdx > 0) rowIdx--;
        } else if (e.key === "ArrowRight") {
            if (colIdx < columns.length - 1) {
                colIdx++;
                rowIdx = Math.min(rowIdx, columns[colIdx].length - 1);
                if (rowIdx < 0) rowIdx = 0;
            }
        } else if (e.key === "ArrowLeft") {
            if (colIdx > 0) {
                colIdx--;
                rowIdx = Math.min(rowIdx, columns[colIdx].length - 1);
                if (rowIdx < 0) rowIdx = 0;
            }
        }

        const el = columns[colIdx] && columns[colIdx][rowIdx];
        if (el) {
            el.focus();
            el.scrollIntoView({ block: "nearest", inline: "nearest" });
        }
        return;
    }

    document.addEventListener("keydown", listenForKeyboardNavigation);

    const observer = new MutationObserver((records) => {
        for (const record of records) {
            if (record.target === wrapper) {
                document.removeEventListener(
                    "keydown",
                    listenForKeyboardNavigation,
                );
                observer.disconnect();
            }
        }
    });

    // keep position state in sync when anchors are focused (click/tab)
    document.addEventListener("focusin", (e) => {
        const t = e.target;
        if (!t || !t.classList) return;
        if (!t.classList.contains("cat-link")) return;
        if (t.dataset.catCol != null) {
            colIdx = Number(t.dataset.catCol);
            rowIdx = Number(t.dataset.catRow);
        }
    });

    const name = argumentTokens[0]?.trim();
    if (!name) {
        wrapper?.append(new Line({ textContent: "usage: cat <filename>" }));
        return;
    }

    const files = state?.cattableFiles || [];
    const file = files.find((f) => f.name === name);
    if (!file) {
        wrapper?.append(new Line({ textContent: `${name} - No such file` }));
        return;
    }

    const printEntry = (entry, depth = 0, localWrapper = wrapper) => {
        const href = entry.href || "";
        const text = entry.text || "";
        const lineEl = make("div", { className: "command-line" });
        lineEl.style.paddingLeft = `${depth * 1}rem`;
        if (href) {
            const anchor = make("a", { href, textContent: text });
            anchor.className = "cat-link";
            anchors.push(anchor);
            if (typeof _currentColumn === "number") {
                columns[_currentColumn] = columns[_currentColumn] || [];
                anchor.dataset.catCol = String(_currentColumn);
                anchor.dataset.catRow = String(columns[_currentColumn].length);
                columns[_currentColumn].push(anchor);
            }
            lineEl.append(anchor);
        } else {
            lineEl.textContent = text;
        }
        localWrapper?.append(lineEl);
        if (entry.entries && entry.entries.length) {
            entry.entries.forEach((e) =>
                printEntry(e, depth + 1, localWrapper),
            );
        }
    };

    const topEntries = file.entries || [];
    const container = make("div");
    Object.assign(container.style, {
        display: "grid",
        gridTemplateColumns: `repeat(${columnsCount}, minmax(0, 1fr))`,
    });

    const chunkSize = Math.ceil(topEntries.length / columnsCount) || 1;
    columns = [];
    for (let i = 0; i < columnsCount; i++) {
        const start = i * chunkSize;
        const colEntries = topEntries.slice(start, start + chunkSize);
        const colEl = make("div");
        Object.assign(colEl.style, {
            display: "flex",
            flexDirection: "column",
        });
        _currentColumn = i;
        colEntries.forEach((e) => printEntry(e, 0, colEl));
        _currentColumn = undefined;
        container.append(colEl);
    }
    wrapper?.append(container);

    observer.observe(wrapper, {
        childList: true,
        subtree: true,
        attributes: false,
        characterData: false,
    });
}
