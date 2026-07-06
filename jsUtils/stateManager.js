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

function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

export function createStateManager(configManifest) {
    let _files = {}; // saved to localStorage, keyed by editable file name
    let _defaultFiles = {};
    let _runtime = {}; // transient, never saved

    function saveFile(fileName) {
        try {
            localStorage.setItem(fileName, JSON.stringify(_files[fileName]));
        } catch (err) {
            console.error(`Failed to save state (${fileName}):`, err);
        }
    }

    async function init() {
        _defaultFiles = {};
        _files = {};

        await Promise.all(
            configManifest.map(async (path) => {
                const fileName = path.split("/").pop();
                const defaultState = await loadJson(path);
                _defaultFiles[fileName] = defaultState;

                const stored = localStorage.getItem(fileName);
                if (stored) {
                    try {
                        const overrides = JSON.parse(stored);
                        _files[fileName] = deepMerge(defaultState, overrides);
                        return;
                    } catch (err) {
                        console.error(
                            `Failed to parse stored state (${fileName}), using default:`,
                            err,
                        );
                    }
                }
                _files[fileName] = clone(defaultState);
            }),
        );

        _runtime = {};
    }

    function combinedPersistentState() {
        return Object.assign({}, ...Object.values(_files));
    }

    function getState() {
        return new Proxy(
            {},
            {
                get(_, prop) {
                    if (prop in _runtime) return _runtime[prop];
                    return combinedPersistentState()[prop];
                },
                set(_, prop, value) {
                    _runtime[prop] = value;
                    return true;
                },
            },
        );
    }

    function listFiles() {
        return configManifest.map((path) => path.split("/").pop());
    }

    function resolveFileName(fileName) {
        return listFiles().find((name) => {
            const lowerName = name?.toLowerCase() ?? "";
            const lowerFileName = fileName?.toLowerCase() ?? "";
            return (
                lowerName === lowerFileName ||
                lowerName.replace(/\.json$/, "") === lowerFileName
            );
        });
    }

    function readFileJSON(fileName) {
        const normalized = resolveFileName(fileName);
        return JSON.stringify(_files[normalized] || {}, null, 2);
    }

    function writeFileJSON(fileName, jsonStr) {
        const normalized = resolveFileName(fileName);
        try {
            _files[normalized] = JSON.parse(jsonStr);
            saveFile(normalized);
            _runtime = {};
            return true;
        } catch (err) {
            console.error(`Invalid JSON for import (${fileName}):`, err);
            return false;
        }
    }

    function resetFile(fileName) {
        const normalized = resolveFileName(fileName);
        if (!normalized) return false;

        _files[normalized] = clone(_defaultFiles[normalized]);
        saveFile(normalized);
        location.reload();
        return true;
    }

    function resetAll() {
        for (const name of listFiles()) {
            _files[name] = clone(_defaultFiles[name]);
            saveFile(name);
        }
        location.reload();
        return true;
    }

    function reset(fileName) {
        if (fileName) {
            return resetFile(fileName);
        } else {
            return resetAll();
        }
    }

    return {
        init,
        getState,
        listFiles,
        resolveFileName,
        readFileJSON,
        writeFileJSON,
        reset,
    };
}
