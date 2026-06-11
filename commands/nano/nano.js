import { make } from "/jsUtils/injectionUtil.js";
import { exportJSON, importJSON } from "/jsUtils/stateManager.js";

export function nano() {
    const overlay = make("div", { className: "state-editor-overlay" });
    const modal = make("div", { className: "state-editor-modal" });
    const textarea = make("textarea", { className: "state-editor-textarea", value: exportJSON() });
    const btnSave = make("button", { textContent: "(ctrl + s) Save" });
    const btnCancel = make("button", { textContent: "(ctrl + c) Cancel" });
    const btnExport = make("button", { textContent: "(ctrl + e) Export" });

    modal.append(textarea, btnSave, btnCancel, btnExport);
    overlay.append(modal);
    document.body.append(overlay);
    textarea.focus();

    btnCancel.addEventListener("click", () => overlay.remove());

    btnSave.addEventListener("click", () => {
        const ok = importJSON(textarea.value);
        if (!ok) {
            alert("Invalid JSON — not saved.");
            return;
        }
        overlay.remove();
        location.reload();
    });

    btnExport.addEventListener("click", () => {
        const blob = new Blob([exportJSON()], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = make("a", { href: url, download: "state.json" });
        a.click();
        URL.revokeObjectURL(url);
    });

    overlay.addEventListener("keydown", (e) => {
        if (!e.ctrlKey) return;
        const k = (e.key || "").toLowerCase();
        if (k === "s") {
            e.preventDefault();
            btnSave.click();
        } else if (k === "e") {
            e.preventDefault();
            btnExport.click();
        } else if (k === "c") {
            e.preventDefault();
            btnCancel.click();
        }
    });
}
