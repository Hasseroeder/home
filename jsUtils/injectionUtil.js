export const make = (tag, props = {}, children) => {
    const el = document.createElement(tag);
    const attrs = { ...props };

    if (attrs.style && typeof attrs.style === "object") {
        Object.assign(el.style, attrs.style);
        delete attrs.style;
    }
    if (attrs.dataset && typeof attrs.dataset === "object") {
        Object.assign(el.dataset, attrs.dataset);
        delete attrs.dataset;
    }

    for (const [key, value] of Object.entries(attrs)) {
        if (value === undefined) continue;
        el[key] = value;
    }

    if (children) el.append(...children);
    return el;
};
