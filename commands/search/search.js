import { Line, Prompt } from "/lineUtil.js";
import { make } from "/jsUtils/injectionUtil.js";

export const SEARCH_ENGINES = {
    youtube: (q) =>
        q
            ? `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`
            : "https://www.youtube.com",
    duckduckgo: (q) =>
        q
            ? `https://duckduckgo.com/?q=${encodeURIComponent(q)}`
            : "https://duckduckgo.com",
    google: (q) =>
        q
            ? `https://www.google.com/search?q=${encodeURIComponent(q)}`
            : "https://www.google.com",
    wikipedia: (q) =>
        q
            ? `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(q)}`
            : "https://en.wikipedia.org",
    arch_linux_wiki: (q) =>
        q
            ? `https://wiki.archlinux.org/index.php?search=${encodeURIComponent(q)}`
            : "https://wiki.archlinux.org",
};

export function search({ wrapper, input } = {}) {
    if (!wrapper) return;

    // don't open a second search UI
    const existingRoot = wrapper.querySelector(".search-root");
    if (existingRoot) {
        const inp = existingRoot.querySelector("input");
        if (inp) inp.focus();
        return;
    }

    const engines = Object.keys(SEARCH_ENGINES);
    let idx = 0;

    // Header
    const title = new Line({ textContent: "  # Search" });
    title.classList.add("search-section");
    const controls = [
        new Line({
            textContent:
                "      cycle engines:  [ shift + tab, tab ], [ up, down ]",
        }),
        new Line({
            textContent:
                "      first/last:     [ page up, page down ]         ",
        }),
        new Line({
            textContent:
                "      exit:           [ ctrl + c ], [ esc ]          ",
        }),
        new Line({
            textContent:
                "      search:         [ enter ]                      ",
        }),
        new Line({
            textContent:
                "      _blank search:  [ ctrl + enter ], [ shift + enter ]",
        }),
    ];

    // Engines list
    const enginesTitle = new Line({ textContent: "  # Engines" });
    enginesTitle.classList.add("search-section");
    const engineLines = engines.map((name, i) => {
        const prefix = i === idx ? "   -> " : "      ";
        const ln = new Line({ textContent: `${prefix}${name}` });
        ln.classList.add("search-engine-line");
        if (i === idx) ln.classList.add("search-selected");
        return ln;
    });

    // Query prompt
    const queryTitle = new Line({ textContent: "  # Query" });
    queryTitle.classList.add("search-section");
    const inputEl = make("input", { type: "text" });
    const promptWrapper = new Prompt({
        hostName: "      user@search",
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
        ...engineLines,
        queryTitle,
        promptWrapper,
    );

    function updateEngineLines() {
        engineLines.forEach((ln, i) => {
            ln.textContent = (i === idx ? "   -> " : "      ") + engines[i];
            ln.classList.toggle("search-selected", i === idx);
        });
    }

    function close() {
        title.remove();
        controls.forEach((control) => control.remove());
        enginesTitle.remove();
        engineLines.forEach((l) => l.remove());
        queryTitle.remove();
        promptWrapper.remove();
        document.removeEventListener("keydown", docHandler);
        inputEl.removeEventListener("keydown", inputHandler);
        // restore main prompt
        input.parentElement.style.display = "flex";
        input.focus();
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

        // Arrow keys: Up (back) and Down (forward)
        if (e.key === "ArrowUp" || e.key === "ArrowDown") {
            e.preventDefault();
            idx =
                e.key === "ArrowUp"
                    ? (idx - 1 + engines.length) % engines.length
                    : (idx + 1) % engines.length;
            updateEngineLines();
            return;
        }

        // Page keys: PageUp (start) and PageDown (end)
        if (e.key === "PageUp" || e.key === "PageDown") {
            e.preventDefault();
            idx = e.key === "PageUp" ? 0 : engines.length - 1;
            updateEngineLines();
            return;
        }

        // Enter: open search
        if (e.key === "Enter") {
            const q = inputEl.value.trim();
            const url = SEARCH_ENGINES[engines[idx]](q);
            const target = e.ctrlKey || e.shiftKey ? "_blank" : "_self";
            wrapper.append(new Line({ textContent: `Opening "${url}"` }));
            const newTab = window.open(url, target);
            newTab.focus();
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
}
