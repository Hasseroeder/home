import { Line, Prompt } from "/lineUtil.js";
import { make } from "/jsUtils/injectionUtil.js";

export function createTuiCommand(SEARCH_ENGINES) {
    return ({ wrapper } = {}) => {
        if (!wrapper) return;

        // don't open a second TUI
        const existingRoot = wrapper.querySelector(".tui-root");
        if (existingRoot) {
            const inp = existingRoot.querySelector("input");
            if (inp) inp.focus();
            return;
        }

        // inject minimal TUI styles (only once)
        if (!document.getElementById("tui-styles")) {
            const css = `
.tui-selected{color:#9ad;font-weight:700}
.tui-engines .command-line{white-space:pre}
.tui-header{color:lightgray}
.tui-section{color:lightgray}
`;
            const style = make("style", { id: "tui-styles", textContent: css });
            document.head.appendChild(style);
        }

        const engines = Object.keys(SEARCH_ENGINES);
        let idx = 0;

        // Header
        const title = new Line({ textContent: "  # Search TUI" });
        title.classList.add("tui-section");
        const controls1 = new Line({
            textContent: "      cycle engines: [ shift + tab, tab ]",
        });
        const controls2 = new Line({
            textContent: "      exit:          [ ctrl + c ] or [ esc ]",
        });

        // Engines list
        const enginesTitle = new Line({ textContent: "  # Engines" });
        enginesTitle.classList.add("tui-section");
        const engineLines = engines.map((name, i) => {
            const prefix = i === idx ? "   -> " : "      ";
            const ln = new Line({ textContent: `${prefix}${name}` });
            ln.classList.add("tui-engine-line");
            if (i === idx) ln.classList.add("tui-selected");
            return ln;
        });

        // Query prompt
        const queryTitle = new Line({ textContent: "  # Query" });
        queryTitle.classList.add("tui-section");
        const inputEl = make("input", { type: "text" });
        const promptWrapper = new Prompt({
            hostname: "      user@tui",
            directory: "~",
            prompt: ">",
            command: "",
            child: inputEl,
            className: "command-line command-input tui-root",
        }).el;

        // hide main prompt input (only while TUI active)
        const mainPromptEl = document.querySelector(
            ".body-wrapper .command-line.command-input",
        );
        if (mainPromptEl && !mainPromptEl.classList.contains("tui-root")) {
            mainPromptEl.dataset._prevDisplay =
                mainPromptEl.style.display || "";
            mainPromptEl.style.display = "none";
            mainPromptEl.dataset._tuiActive = "1";
        }

        // append all parts into history
        wrapper.append(
            title,
            controls1,
            controls2,
            enginesTitle,
            ...engineLines,
            queryTitle,
            promptWrapper,
        );

        function updateEngineLines() {
            engineLines.forEach((ln, i) => {
                ln.textContent = (i === idx ? "   -> " : "      ") + engines[i];
                ln.classList.toggle("tui-selected", i === idx);
            });
        }

        function close() {
            title.remove();
            controls1.remove();
            controls2.remove();
            enginesTitle.remove();
            engineLines.forEach((l) => l.remove());
            queryTitle.remove();
            promptWrapper.remove();
            document.removeEventListener("keydown", docHandler);
            inputEl.removeEventListener("keydown", inputHandler);
            // restore main prompt
            if (mainPromptEl && mainPromptEl.dataset._tuiActive) {
                mainPromptEl.style.display =
                    mainPromptEl.dataset._prevDisplay || "";
                delete mainPromptEl.dataset._prevDisplay;
                delete mainPromptEl.dataset._tuiActive;
            }
        }

        function inputHandler(e) {
            // cycle engines: Tab (forward) and Shift+Tab (back)
            if (e.key === "Tab") {
                e.preventDefault();
                idx = e.shiftKey
                    ? (idx - 1 + engines.length) % engines.length
                    : (idx + 1) % engines.length;
                updateEngineLines();
                return;
            }

            // Enter: open search
            if (e.key === "Enter") {
                const q = inputEl.value.trim();
                const url = SEARCH_ENGINES[engines[idx]](q);
                wrapper.append(new Line({ textContent: `Opening "${url}"` }));
                window.open(url, "_self");
                close();
                return;
            }

            // Escape or Ctrl+C: close
            if (
                e.key === "Escape" ||
                (e.key.toLowerCase && e.key.toLowerCase() === "c" && e.ctrlKey)
            ) {
                close();
                return;
            }
        }

        function docHandler(e) {
            if (
                e.key === "Escape" ||
                (e.key.toLowerCase && e.key.toLowerCase() === "c" && e.ctrlKey)
            )
                close();
        }

        inputEl.addEventListener("keydown", inputHandler);
        document.addEventListener("keydown", docHandler);

        promptWrapper.scrollIntoView();
        inputEl.focus();
    };
}
