import { loadJson } from "/jsUtils/jsonUtil.js";

const STORAGE_KEY = "app_state";
let _state = null;

function isObject(o) {
    return o && typeof o === "object" && !Array.isArray(o);
}

function deepMerge(target, src) {
    if (!isObject(target) || !isObject(src)) return src;
    const out = { ...target };
    for (const [k, v] of Object.entries(src)) {
        if (k in target) out[k] = deepMerge(target[k], v);
        else out[k] = v;
    }
    return out;
}

export async function initState() {
    const defaultState = await loadJson("/defaultState.json");
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        try {
            const overrides = JSON.parse(stored);
            _state = deepMerge(defaultState, overrides);
        } catch (err) {
            console.error("Failed to parse stored state, using default:", err);
            _state = JSON.parse(JSON.stringify(defaultState));
        }
    } else {
        _state = JSON.parse(JSON.stringify(defaultState));
    }
}

export function getState() {
    return _state;
}

export function save() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(_state));
    } catch (err) {
        console.error("Failed to save state:", err);
    }
}

export function set(path, value) {
    if (!path) return;
    const parts = path.split(".");
    let cur = _state;
    for (let i = 0; i < parts.length - 1; i++) {
        const p = parts[i];
        if (!isObject(cur[p])) cur[p] = {};
        cur = cur[p];
    }
    cur[parts[parts.length - 1]] = value;
    save();
}

export function exportJSON() {
    return JSON.stringify(_state, null, 2);
}

export function importJSON(jsonStr) {
    try {
        const parsed = JSON.parse(jsonStr);
        _state = parsed;
        save();
        return true;
    } catch (err) {
        console.error("Invalid JSON provided to importJSON:", err);
        return false;
    }
}

export function openEditor() {
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
