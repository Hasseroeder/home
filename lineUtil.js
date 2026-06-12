import { make } from "/jsUtils/injectionUtil.js";

export class Line {
    constructor({ className = "command-line", textContent = " " } = {}) {
        return make("div", { className, textContent });
    }
}

export class Prompt {
    static array = [];
    constructor({
        hostName = "user",
        directory = "~",
        prompt = ">",
        command = "",
        child = "",
        className = "command-line",
    }) {
        this.hostNameSpan = make("span", {
            textContent: hostName,
        });
        this.directorySpan = make("span", {
            textContent: directory,
        });
        this.promptSpan = make("span", {
            textContent: prompt,
        });
        this.commandSpan = make("span", {
            textContent: command,
        });

        this.el = make("div", { className }, [
            this.hostNameSpan,
            make("span", { textContent: " " }),
            this.directorySpan,
            make("span", { textContent: " " }),
            this.promptSpan,
            make("span", { textContent: " " }),
            this.commandSpan,
        ]);

        this.el.append(child);

        Prompt.array.push(this);
    }
    set hostName(string) {
        this.hostNameSpan.textContent = string;
    }
}
