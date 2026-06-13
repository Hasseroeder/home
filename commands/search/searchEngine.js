import { Line, Prompt } from "/lineUtil.js";

export class SearchEngine {
    constructor({
        slug,
        emoji,
        baseUrl,
        searchPartUrl,
        prettyName,
        aliases,
        aliases_self,
    }) {
        this.aliases_self = aliases_self;
        this.aliases = aliases;
        this.slug = slug;
        this.emoji = emoji;
        this.baseUrl = baseUrl;
        this.prettyName = prettyName;
        this.searchPartUrl = searchPartUrl;
        this.description = `search ${this.prettyName} for results`;
    }
    wrapQuery(q) {
        let urlConstruction = this.baseUrl;
        if (q) urlConstruction += this.searchPartUrl + q;
        return urlConstruction;
    }
    search_self({ wrapper, argumentTokens }) {
        const q = (argumentTokens || []).join(" ").trim();
        const url = this.wrapQuery(q);
        wrapper?.append(new Line({ textContent: `Opening "${url}"` }));
        window.open(url, "_self");
    }
    search_blank({ wrapper, argumentTokens }) {
        const q = (argumentTokens || []).join(" ").trim();
        const url = this.wrapQuery(q);
        wrapper?.append(new Line({ textContent: `Opening "${url}"` }));
        window.open(url, "_blank");
    }
    search({ wrapper, argumentTokens }) {
        const q = (argumentTokens || []).join(" ").trim();
        const url = this.wrapQuery(q);
        wrapper?.append(new Line({ textContent: `Opening "${url}"` }));
        window.open(url);
    }
}
