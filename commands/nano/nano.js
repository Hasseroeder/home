import { make } from "/jsUtils/injectionUtil.js";
import { exportJSON, importJSON } from "/jsUtils/stateManager.js";

export function nano() {
    const overlay = make("div", { className: "state-editor-overlay" });
    const modal = make("div", { className: "state-editor-modal" });
    const textarea = make("textarea", { className: "state-editor-textarea", value: exportJSON() });
    const btnSave = make("button", { textContent: "Save" });
    const btnCancel = make("button", { textContent: "Cancel" });
    const btnExport = make("button", { textContent: "Export" });

    modal.append(textarea, btnSave, btnCancel, btnExport);
    overlay.append(modal);
    document.body.append(overlay);

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
}
