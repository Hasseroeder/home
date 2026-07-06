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

function storageKeyFor(prefix, fileName) {
    return `${prefix}:${fileName}`;
}

function normalizeConfigEntry(fileName, entry) {
    if (typeof entry === "string") {
        return { fileName, path: entry, keys: [] };
    }
    return { fileName, keys: [], ...entry };
}

function pickKeys(source, keys) {
    return Object.fromEntries(
        keys.filter((key) => key in source).map((key) => [key, source[key]]),
    );
}

export function createStateManager(storagePrefix, configManifest) {
    let _files = {}; // saved to localStorage, keyed by editable file name
    let _defaultFiles = {};
    let _runtime = {}; // transient, never saved

    const fileEntries = Object.entries(configManifest).map(
        ([fileName, entry]) => normalizeConfigEntry(fileName, entry),
    );
    const keyToFileName = new Map(
        fileEntries.flatMap(({ fileName, keys }) =>
            keys.map((key) => [key, fileName]),
        ),
    );

    function saveFile(fileName) {
        try {
            localStorage.setItem(
                storageKeyFor(storagePrefix, fileName),
                JSON.stringify(_files[fileName]),
            );
        } catch (err) {
            console.error(`Failed to save state (${fileName}):`, err);
        }
    }

    async function init() {
        _defaultFiles = {};
        _files = {};

        await Promise.all(
            fileEntries.map(async ({ fileName, path }) => {
                const defaultState = await loadJson(path);
                _defaultFiles[fileName] = defaultState;

                const stored = localStorage.getItem(
                    storageKeyFor(storagePrefix, fileName),
                );
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

        migrateLegacyState();
        _runtime = {};
    }

    function migrateLegacyState() {
        const legacyStored = localStorage.getItem(storagePrefix);
        if (!legacyStored) return;

        try {
            const legacy = JSON.parse(legacyStored);
            for (const { fileName, keys } of fileEntries) {
                _files[fileName] = deepMerge(
                    _files[fileName],
                    pickKeys(legacy, keys),
                );
                saveFile(fileName);
            }
            localStorage.removeItem(storagePrefix);
        } catch (err) {
            console.error(
                `Failed to migrate legacy state (${storagePrefix}):`,
                err,
            );
        }
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
                    return combinedPersistentState()?.[prop];
                },
                set(_, prop, value) {
                    _runtime[prop] = value;
                    return true;
                },
            },
        );
    }

    function listFiles() {
        return fileEntries.map(({ fileName }) => fileName);
    }

    function resolveFileName(fileName) {
        if (!fileName) return null;
        const exact = listFiles().find((name) => name === fileName);
        if (exact) return exact;
        return listFiles().find(
            (name) => name.replace(/\.json$/, "") === fileName,
        );
    }

    function readFileJSON(fileName) {
        const normalized = resolveFileName(fileName);
        const state = normalized
            ? _files[normalized]
            : combinedPersistentState();
        return JSON.stringify(state || {}, null, 2);
    }

    function writeFileJSON(fileName, jsonStr) {
        const normalized = resolveFileName(fileName);
        if (!normalized) return false;

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
        importJSON: (jsonStr, fileName) => writeFileJSON(fileName, jsonStr),
    };
}
