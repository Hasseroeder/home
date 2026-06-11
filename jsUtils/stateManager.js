import { loadJson } from "/jsUtils/jsonUtil.js";

const STORAGE_KEY = "app_state";
let _persistent = null; // persisted state (saved to localStorage)
let _runtime = {}; // transient runtime-only values
let _stateFacade = null; // lightweight facade with getters for top-level props

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
            _persistent = deepMerge(defaultState, overrides);
        } catch (err) {
            console.error("Failed to parse stored state, using default:", err);
            _persistent = JSON.parse(JSON.stringify(defaultState));
        }
    } else {
        _persistent = JSON.parse(JSON.stringify(defaultState));
    }
    _runtime = {};
    _stateFacade = null;
}
function ensureFacadeProp(prop) {
    if (!_stateFacade) _stateFacade = {};
    if (prop in _stateFacade) return;
    Object.defineProperty(_stateFacade, prop, {
        enumerable: true,
        configurable: true,
        get() {
            if (prop in _runtime) return _runtime[prop];
            return _persistent ? _persistent[prop] : undefined;
        },
    });
}

export function getState() {
    if (!_stateFacade) {
        _stateFacade = {};
        const keys = Object.keys(_persistent || {});
        keys.forEach((k) => ensureFacadeProp(k));
        Object.keys(_runtime || {}).forEach((k) => ensureFacadeProp(k));
    }
    return _stateFacade;
}

export function setRuntime(path, value) {
    if (!path) return;
    const parts = path.split(".");
    let cur = _runtime;
    for (let i = 0; i < parts.length - 1; i++) {
        const p = parts[i];
        if (!isObject(cur[p])) cur[p] = {};
        cur = cur[p];
    }
    cur[parts[parts.length - 1]] = value;
    // ensure facade has top-level getter so reads reflect runtime values
    ensureFacadeProp(parts[0]);
}

export function clearRuntime(path) {
    if (!path) {
        _runtime = {};
        return;
    }
    const parts = path.split(".");
    let cur = _runtime;
    for (let i = 0; i < parts.length - 1; i++) {
        const p = parts[i];
        if (!isObject(cur[p])) return;
        cur = cur[p];
    }
    delete cur[parts[parts.length - 1]];
}

export function save() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(_persistent));
    } catch (err) {
        console.error("Failed to save state:", err);
    }
}

export function set(path, value) {
    if (!path) return;
    const parts = path.split(".");
    let cur = _persistent;
    for (let i = 0; i < parts.length - 1; i++) {
        const p = parts[i];
        if (!isObject(cur[p])) cur[p] = {};
        cur = cur[p];
    }
    cur[parts[parts.length - 1]] = value;
    save();
    // ensure facade has top-level getter for callers
    ensureFacadeProp(parts[0]);
}

export function exportJSON() {
    return JSON.stringify(_persistent || {}, null, 2);
}

export function importJSON(jsonStr) {
    try {
        const parsed = JSON.parse(jsonStr);
        _persistent = parsed;
        _runtime = {};
        _stateFacade = null;
        save();
        return true;
    } catch (err) {
        console.error("Invalid JSON provided to importJSON:", err);
        return false;
    }
}

export async function resetPersistent() {
    try {
        const defaultState = await loadJson("/defaultState.json");
        _persistent = JSON.parse(JSON.stringify(defaultState));
        _runtime = {};
        _stateFacade = null;
        save();
        return true;
    } catch (err) {
        console.error("Failed to reset persistent state:", err);
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
