import { Line } from "/lineUtil.js";
import { make } from "/jsUtils/injectionUtil.js";

const anchors = [];

export function cat({ wrapper, argumentTokens, stateStore, input } = {}) {
    const state = stateStore.getState();
    anchors.length = 0;
    let columns = [],
        colIdx = 0,
        rowIdx = -1;

    const columnsMode =
        argumentTokens[1]?.trim() === "|" &&
        argumentTokens[2]?.trim() === "column";
    const columnsCount = columnsMode ? 7 : 1;

    const clamp = (v, a, b) => Math.max(a, Math.min(v, b));

    const syncFromActive = () => {
        const a = document.activeElement;
        if (a?.classList?.contains("cat-link") && a.dataset.catCol != null) {
            colIdx = +a.dataset.catCol;
            rowIdx = +a.dataset.catRow;
        } else {
            colIdx = clamp(colIdx, 0, (columns || []).length - 1);
            rowIdx = clamp(rowIdx, 0, columns?.[colIdx]?.length ?? -1);
        }
    };

    function onKey(e) {
        if (!anchors.length) return;
        if (!e.ctrlKey && e.key !== "Enter") return input?.focus();
        if (
            !["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight"].includes(e.key)
        )
            return;
        e.preventDefault();
        syncFromActive();

        if (
            e.key === "ArrowDown" &&
            columns[colIdx] &&
            rowIdx < columns[colIdx].length - 1
        )
            rowIdx++;
        else if (e.key === "ArrowUp" && rowIdx > 0) rowIdx--;
        else if (e.key === "ArrowRight" && colIdx < columns.length - 1) {
            colIdx++;
            rowIdx = Math.max(0, Math.min(rowIdx, columns[colIdx].length - 1));
        } else if (e.key === "ArrowLeft" && colIdx > 0) {
            colIdx--;
            rowIdx = Math.max(0, Math.min(rowIdx, columns[colIdx].length - 1));
        }

        const el = columns?.[colIdx]?.[rowIdx];
        if (el) {
            el.focus();
            el.scrollIntoView({ block: "nearest", inline: "nearest" });
        }
    }
    document.addEventListener("keydown", onKey);

    const obs = new MutationObserver((records) => {
        if (records.some((r) => r.target === wrapper)) {
            document.removeEventListener("keydown", onKey);
            obs.disconnect();
        }
    });

    document.addEventListener("focusin", (e) => {
        const t = e.target;
        if (t?.classList?.contains("cat-link") && t.dataset.catCol != null) {
            colIdx = +t.dataset.catCol;
            rowIdx = +t.dataset.catRow;
        }
    });

    const name = argumentTokens[0]?.trim();
    if (!name) {
        wrapper?.append(new Line({ textContent: "usage: cat <filename>" }));
        return;
    }

    const file = (state?.cattableFiles || []).find((f) => f.name === name);
    if (!file) {
        wrapper?.append(new Line({ textContent: `${name} - No such file` }));
        return;
    }

    const printEntry = (entry, depth = 0, localWrapper, currentCol) => {
        const lineEl = make("div", { className: "command-line" });
        lineEl.style.paddingLeft = `${depth}rem`;
        if (entry.href) {
            const a = make("a", {
                href: entry.href,
                textContent: entry.text || "",
            });
            a.className = "cat-link";
            anchors.push(a);
            if (typeof currentCol === "number") {
                columns[currentCol] = columns[currentCol] || [];
                a.dataset.catCol = String(currentCol);
                a.dataset.catRow = String(columns[currentCol].length);
                columns[currentCol].push(a);
            }
            lineEl.append(a);
        } else {
            lineEl.textContent = entry.text || "";
        }
        localWrapper?.append(lineEl);
        (entry.entries || []).forEach((child) =>
            printEntry(child, depth + 1, localWrapper, currentCol),
        );
    };

    const topEntries = file.entries || [];
    const container = make("div", { className: "cat-wrapper" });
    container.style.gridTemplateColumns = `repeat(${columnsCount}, minmax(0, 1fr))`;

    const chunkSize = Math.ceil(topEntries.length / columnsCount) || 1;
    for (let i = 0; i < columnsCount; i++) {
        const colEl = make("div");
        const slice = topEntries.slice(
            i * chunkSize,
            i * chunkSize + chunkSize,
        );
        slice.forEach((e) => printEntry(e, 0, colEl, i));
        container.append(colEl);
    }
    wrapper?.append(container);

    obs.observe(wrapper, { childList: true, subtree: true });
}
