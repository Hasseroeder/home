export async function loadJson(path) {
    try {
        const response = await fetch(path);
        return await response.json();
    } catch (error) {
        console.error("Error loading json:", error);
        return undefined;
    }
}

export async function loadAll(obj) {
    const entries = Object.entries(obj);
    const results = await Promise.all(entries.map(([_, p]) => p));
    return Object.fromEntries(entries.map(([key], i) => [key, results[i]]));
}
