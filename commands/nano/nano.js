import { make } from "/jsUtils/injectionUtil.js";
import { exportJSON, importJSON } from "/jsUtils/stateManager.js";

export function nano({ input } = {}) {
    const overlay = make("div", { className: "state-editor-overlay" });
    const modal = make("div", { className: "state-editor-modal" });
    const textarea = make("textarea", {
        className: "state-editor-textarea",
        value: exportJSON(),
    });
    const btnSave = make("button", { textContent: "(ctrl + s) Save" });
    const btnCancel = make("button", { textContent: "(esc) Cancel" });
    const btnExport = make("button", { textContent: "(ctrl + e) Export" });

    modal.append(textarea, btnSave, btnCancel, btnExport);
    overlay.append(modal);
    document.body.append(overlay);
    textarea.focus();

    btnCancel.addEventListener("click", close);

    btnSave.addEventListener("click", () => {
        const ok = importJSON(textarea.value);
        if (!ok) {
            alert("Invalid JSON — not saved.");
            return;
        }
        close();
        location.reload();
    });

    btnExport.addEventListener("click", () => {
        const blob = new Blob([exportJSON()], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = make("a", { href: url, download: "state.json" });
        a.click();
        URL.revokeObjectURL(url);
    });

    const shortcutListener = (e) => {
        const k = (e.key || "").toLowerCase();
        if (k === "s" && e.ctrlKey) {
            e.preventDefault();
            btnSave.click();
        } else if (k === "e" && e.ctrlKey) {
            e.preventDefault();
            btnExport.click();
        } else if (k === "escape") {
            e.preventDefault();
            btnCancel.click();
        }
    };

    document.addEventListener("keydown", shortcutListener);

    function close() {
        overlay.remove();
        input?.focus();
        document.removeEventListener("keydown", shortcutListener);
    }
}
