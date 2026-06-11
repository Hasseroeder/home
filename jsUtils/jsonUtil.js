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
    const keys = Object.keys(obj);
    const values = await Promise.all(Object.values(obj));
    return Object.fromEntries(keys.map((k, i) => [k, values[i]]));
}
