import { make } from "/jsUtils/injectionUtil.js";
import { renderFunctionRegistry } from "/commands/fastfetch/fastfetchModules.js";
import { Line } from "/lineUtil.js";

class FastfetchKeyManager {
    constructor(separator = "  ⇀ ") {
        this.array = [];
        this.separator = separator;
    }

    add(key) {
        this.array.push(key);
        this.update();
    }

    remove(key) {
        const i = this.array.indexOf(key);
        if (i > -1) {
            this.array.splice(i, 1);
            this.update();
        }
    }

    update() {
        const groups = new Map();
        let maxPadding = 0;
        for (const key of this.array) {
            maxPadding = Math.max(maxPadding, key.textpadding);
            !groups.has(key.category) && groups.set(key.category, []);
            groups.get(key.category).push(key);
        }
        for (const [, keys] of groups) {
            keys.forEach((key, i) => {
                if (i === keys.length - 1 || key.category === undefined)
                    key.structure = "└";
                else key.structure = "├";
            });
        }
        for (const key of this.array) {
            key.textpadding = maxPadding;
            key.update();
        }
    }
}

export function fastfetch({ wrapper, state, input } = {}) {
    const fetchModules = state.fetchModules.map(createFastfetchModule);
    const fetchWrapper = make("div", { className: "fetch-wrapper" });
    const textWrapper = make("div", { className: "fetch-text-wrapper" });
    fetchWrapper.append(textWrapper);
    wrapper.append(new Line(), fetchWrapper, new Line());

    const context = {
        input,
        state,
        fetchWrapper,
        textWrapper,
        keyManager: new FastfetchKeyManager(),
    };

    // synchronous
    fetchModules.forEach((module) => module.init(context));
    // async (parallel)
    fetchModules.forEach((module) => module.tryRenderContent(context));
}

const createFastfetchModule = (config) => {
    const renderFunction = renderFunctionRegistry[config.slug];
    if (!renderFunction) throw new Error(`Unknown module: ${config.slug}`);
    return new FastfetchModule({
        ...config,
        renderContent: renderFunction,
    });
};

class FastfetchModule {
    constructor(config) {
        this.slug = config.slug;
        this.data = { ...(config.data ?? {}) };
        this.renderContent = config.renderContent;
        this.el = null;
        this.progressLine = null;
    }

    init(context) {
        this.el = make("div", { className: "grid" });
        this.progressLine = new FastfetchLine(
            {
                keyConfig: {
                    ...this.data.keyConfig,
                    textContent: "Module",
                },
                valueConfig: { textContent: "in progress" },
            },
            context.keyManager,
        );
        this.el.append(this.progressLine.wrapper);
        context.textWrapper.append(this.el);
    }

    async tryRenderContent(context) {
        try {
            await this.renderContent(context);
            this.progressLine.remove();
        } catch (err) {
            this.progressLine.value.el.textContent = "failed";
            console.error(`Error loading module '${this.slug}':`, err);
        }
        context.input.scrollIntoView();
    }
}

export class FastfetchLine {
    constructor(config, keyManager) {
        const { keyConfig, valueConfig } = config;

        this.key = new FastfetchKey(keyConfig, keyManager);
        this.value = new FastfetchValue(valueConfig);
        this.wrapper = make("span", { className: "command-line" }, [
            this.key.el,
            this.value.el,
        ]);
    }
    remove() {
        this.wrapper.remove();
        this.key.manager.remove(this.key);
    }
}

class FastfetchValue {
    constructor({ textContent, href }) {
        this.el = href
            ? make("a", { textContent, href })
            : make("span", { textContent });
    }
}

class FastfetchKey {
    constructor({ category, emoji, textContent }, manager) {
        this.category = category;
        this._emoji = emoji;
        this._textContent = textContent;
        this.textpadding = textContent.length;
        this.structure = "├";

        this.el = make("span");
        this.manager = manager;
        this.manager.add(this);
    }

    get emoji() {
        return this._emoji;
    }
    set emoji(emoji) {
        this._emoji = emoji;
        this.manager.update();
    }

    get textContent() {
        return this._textContent;
    }
    set textContent(textContent) {
        this._textContent = textContent;
        this.manager.update();
    }

    update() {
        this.el.textContent =
            `${this.structure} ` +
            `${this._emoji}  ` +
            this.textContent.padEnd(this.textpadding) +
            this.manager.separator;
    }
}
