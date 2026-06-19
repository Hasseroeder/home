import { Line, Prompt } from "/lineUtil.js";
import { make } from "/jsUtils/injectionUtil.js";
import { SearchEngine } from "/commands/search/searchEngine.js";

export function search({ wrapper, input, bigState } = {}) {
    const state = bigState.getProxy();
    if (!wrapper) return;

    // don't open a second search UI
    const existingRoot = wrapper.querySelector(".search-root");
    if (existingRoot) {
        const inp = existingRoot.querySelector("input");
        if (inp) inp.focus();
        return;
    }

    const engines = state.searchEngines.map(
        (config) => new SearchEngine(config),
    );
    let idx = 0;

    // Header
    const title = new Line({ textContent: "  # Search" });
    title.classList.add("search-section");
    const controls = [
        new Line({
            textContent: "   ## swap engine ",
        }),
        new Line({
            textContent:
                "        back / forth    [ shift + tab / tab ], [ up / down ]",
        }),
        new Line({
            textContent:
                "        first / last    [ page up / page down ]         ",
        }),
        new Line({
            textContent:
                "   ## search          [ enter ]                      ",
        }),
        new Line({
            textContent: "        newtab          [ + ctrl ]               ",
        }),
        new Line({
            textContent: "        newtab(focus)   [ + ctrl + shift ]       ",
        }),
        new Line({
            textContent: "        newwindow       [ + shift ]               ",
        }),
        new Line({
            textContent:
                "   ## exit            [ ctrl + c ], [ esc ]          ",
        }),
    ];

    // Engines list
    const enginesTitle = new Line({ textContent: "  # Engines" });
    enginesTitle.classList.add("search-section");
    engines.forEach((engine, i) => {
        engine.ln = new Line({
            className: "command-line search-engine-line",
        });
        engine.ln.update = function () {
            const prefix = i === idx ? "   -> " : "      ";
            this.textContent = prefix + engine.emoji + " " + engine.slug;
            this.classList.toggle("search-selected", i === idx);
        };
        engine.ln.update();
    });

    // Query prompt
    const queryTitle = new Line({ textContent: "  # Query" });
    queryTitle.classList.add("search-section");
    const inputEl = make("input", { type: "text" });
    const promptWrapper = new Prompt({
        hostName: `      ${state.userName ?? "user"}@search`,
        directory: "~",
        prompt: ">",
        command: "",
        child: inputEl,
        className: "command-line command-input search-root",
    }).el;

    // hide main prompt input (only while search UI active)
    input.parentElement.style.display = "none";

    // append all parts into history
    wrapper.append(
        title,
        ...controls,
        enginesTitle,
        ...engines.map((engine) => engine.ln),
        queryTitle,
        promptWrapper,
    );

    function updateEngineLines() {
        engines.forEach((engine) => engine.ln.update());
    }

    function close() {
        title.remove();
        controls.forEach((control) => control.remove());
        enginesTitle.remove();
        engines.forEach((engine) => engine.ln.remove());
        queryTitle.remove();
        promptWrapper.remove();
        document.removeEventListener("keydown", docHandler);
        inputEl.removeEventListener("keydown", inputHandler);
        // restore main prompt
        input.parentElement.style.display = "flex";
        input.focus();
    }

    function inputHandler(e) {
        if (e.key === "Tab") {
            e.preventDefault();
            idx = e.shiftKey
                ? (idx - 1 + engines.length) % engines.length
                : (idx + 1) % engines.length;
            updateEngineLines();
            return;
        }

        if (e.key === "ArrowUp" || e.key === "ArrowDown") {
            e.preventDefault();
            idx =
                e.key === "ArrowUp"
                    ? (idx - 1 + engines.length) % engines.length
                    : (idx + 1) % engines.length;
            updateEngineLines();
            return;
        }

        if (e.key === "PageUp" || e.key === "PageDown") {
            e.preventDefault();
            idx = e.key === "PageUp" ? 0 : engines.length - 1;
            updateEngineLines();
            return;
        }

        if (e.key === "Enter") {
            engines[idx].search({
                wrapper,
                argumentTokens: [inputEl.value],
            });
            close();
            return;
        }

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
}
