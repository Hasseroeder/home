import { make } from "/jsUtils/injectionUtil.js";
import { exportJSON, importJSON } from "/jsUtils/stateManager.js";

export function nano() {
    const overlay = document.createElement("div");
    overlay.className = "state-editor-overlay";
    const modal = document.createElement("div");
    modal.className = "state-editor-modal";
    const textarea = document.createElement("textarea");
    textarea.className = "state-editor-textarea";
    textarea.value = exportJSON();
    const btnSave = document.createElement("button");
    btnSave.textContent = "Save";
    const btnCancel = document.createElement("button");
    btnCancel.textContent = "Cancel";
    const btnExport = document.createElement("button");
    btnExport.textContent = "Export";

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
        const a = document.createElement("a");
        a.href = url;
        a.download = "state.json";
        a.click();
        URL.revokeObjectURL(url);
    });
}
