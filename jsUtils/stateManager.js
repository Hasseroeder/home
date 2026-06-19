import { loadJson } from "/jsUtils/jsonUtil.js";

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

export function createStateManager(storageKey, defaultJsonPath) {
    let _persistent = {}; // saved to localStorage
    let _runtime = {}; // transient, never saved

    function save() {
        try {
            localStorage.setItem(storageKey, JSON.stringify(_persistent));
        } catch (err) {
            console.error(`Failed to save state (${storageKey}):`, err);
        }
    }

    async function init() {
        const defaultState = await loadJson(defaultJsonPath);
        const stored = localStorage.getItem(storageKey);
        if (stored) {
            try {
                const overrides = JSON.parse(stored);
                _persistent = deepMerge(defaultState, overrides);
            } catch (err) {
                console.error(
                    `Failed to parse stored state (${storageKey}), using default:`,
                    err,
                );
                _persistent = JSON.parse(JSON.stringify(defaultState));
            }
        } else {
            _persistent = JSON.parse(JSON.stringify(defaultState));
        }
        _runtime = {};
    }

    function getProxy() {
        return new Proxy(
            {},
            {
                get(_, prop) {
                    if (prop in _runtime) return _runtime[prop];
                    return _persistent?.[prop];
                },
                set(_, prop, value) {
                    _runtime[prop] = value;
                    return true;
                },
            },
        );
    }

    function set(path, value) {
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
    }

    function exportJSON() {
        return JSON.stringify(_persistent || {}, null, 2);
    }

    function importJSON(jsonStr) {
        try {
            const parsed = JSON.parse(jsonStr);
            _persistent = parsed;
            _runtime = {};
            save();
            return true;
        } catch (err) {
            console.error(`Invalid JSON for import (${storageKey}):`, err);
            return false;
        }
    }

    async function reset() {
        const defaultState = await loadJson(defaultJsonPath);
        _persistent = JSON.parse(JSON.stringify(defaultState));
        save();
        location.reload();
    }

    return {
        init,
        getProxy,
        set,
        exportJSON,
        importJSON,
        reset,
    };
}
