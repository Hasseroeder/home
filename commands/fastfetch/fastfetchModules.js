import { loadJson } from "/jsUtils/jsonUtil.js";
import { make } from "/jsUtils/injectionUtil.js";
import { FastfetchLine } from "/commands/fastfetch/fastfetch.js";

const weatherCodesPromise = loadJson("/media/weather_codes.json");

// Simple localStorage caching helpers for fastfetch
const CACHE_PREFIX = "fastfetch_cache_v1";
const LOCATION_CACHE_KEY = `${CACHE_PREFIX}.location`;
const WEATHER_CACHE_PREFIX = `${CACHE_PREFIX}.weather:`; // suffix with constructed URL
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

function readCache(key) {
    try {
        const raw = localStorage.getItem(key);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== "object") return null;
        if (!parsed.ts || !("data" in parsed)) return null;
        if (Date.now() - parsed.ts > CACHE_TTL_MS) {
            localStorage.removeItem(key);
            return null;
        }
        return parsed.data;
    } catch (err) {
        console.error("fastfetch cache read error:", err);
        return null;
    }
}

function writeCache(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify({ ts: Date.now(), data }));
    } catch (err) {
        console.error("fastfetch cache write error:", err);
    }
}

function getCachedLocation() {
    return readCache(LOCATION_CACHE_KEY);
}

function getLocation(context) {
    if (!context.locationPromise) {
        context.locationPromise = fetch("https://ipinfo.io/json")
            .then((response) => response.json())
            .then((data) => {
                try {
                    writeCache(LOCATION_CACHE_KEY, data);
                } catch (e) {
                    /* ignore cache write errors */
                }
                return data;
            });
    }
    return context.locationPromise;
}

function getUtcOffsetString(timeZone) {
    const local = new Date();
    const utc = new Date(local.toLocaleString("en-US", { timeZone: "UTC" }));
    const zoned = new Date(local.toLocaleString("en-US", { timeZone }));
    const utcOffset = (zoned - utc) / 60000 / 60;

    return new Intl.NumberFormat("en-US", {
        signDisplay: "always",
    }).format(utcOffset);
}

export const renderFunctionRegistry = {
    header: async function (context) {
        this.el.append(
            make("span", {
                className: "command-line",
                ...this.data,
            }),
        );
    },
    hostname: async function (context) {
        this.el.append(
            make("span", {
                className: "command-line",
                textContent: context.state.hostname,
            }),
        );
    },
    image: async function (context) {
        this.el.append(this.progressLine.wrapper);

        this.fetchImage = make("img", {
            className: "fastfetch-image",
            referrerPolicy: "no-referrer",
            decoding: "async",
        });
        context.fetchWrapper.prepend(this.fetchImage);
        let imageData = {
            src: "/media/backupImage.jpg",
            id: 399022,
            source: "https://www.pixiv.net/en/artworks/140831161",
        };
        try {
            const antix1Fetch = await fetch(
                "https://antix1.transaero.space/api",
                {
                    method: "GET",
                    headers: {
                        "x-api-key": "my_super_duper_mega_ultra_secure_API_key",
                    },
                },
            );
            imageData = await antix1Fetch.json();
            const antix1ImageFetch = await fetch(
                "https://antix1.transaero.space/images/" + imageData.id,
                {
                    method: "GET",
                    headers: {
                        "x-api-key": "my_super_duper_mega_ultra_secure_API_key",
                    },
                },
            );
            const imageBlob = await antix1ImageFetch.blob();
            this.fetchImage.src = URL.createObjectURL(imageBlob);
        } catch {
            console.error(
                "Failed to fetch image from Antix1, using backup image.",
            );
            this.fetchImage.src = imageData.src;
        }

        const sourceLine = new FastfetchLine(
            {
                keyConfig: {
                    ...this.data.keyConfig,
                    textContent: "Source",
                },
                valueConfig: {
                    textContent: imageData.source,
                    href: imageData.source,
                },
            },
            context.keyManager,
        );
        const konachanLine = new FastfetchLine(
            {
                keyConfig: {
                    ...this.data.keyConfig,
                    textContent: "Konachan",
                },
                valueConfig: {
                    textContent: `https://konachan.net/post/show/${imageData.id}`,
                    href: `https://konachan.net/post/show/${imageData.id}`,
                },
            },
            context.keyManager,
        );
        this.el.append(sourceLine.wrapper, konachanLine.wrapper);
    },
    os: async function (context) {
        const fingerPrintInfo = context.state.fingerPrintInfo;
        const line = new FastfetchLine(
            {
                keyConfig: this.data.keyConfig,
                valueConfig: {
                    textContent: `${fingerPrintInfo.platform.type} ${fingerPrintInfo.os.name.toLowerCase()}`,
                },
            },
            context.keyManager,
        );
        const OSicon = {
            linux: "󰌽",
            android: "󰀲",
            windows: "󰨡",
            ios: "",
            macos: "",
        }[fingerPrintInfo.os.name.toLowerCase()];
        if (OSicon) line.key.emoji = OSicon;

        this.el.append(line.wrapper);
    },
    locale: async function (context) {
        const line = new FastfetchLine(
            {
                keyConfig: this.data.keyConfig,
                valueConfig: {
                    textContent: context.state.fingerPrintInfo.language,
                },
            },
            context.keyManager,
        );
        this.el.append(line.wrapper);
    },
    time: async function (context) {
        this.el.append(this.progressLine.wrapper);

        this.data.timezones.forEach((tz) => {
            const utcString = getUtcOffsetString(tz.timeZone);
            const region = tz.timeZone.split("/")[0];
            const globeIcon = {
                Africa: "",
                America: "",
                Asia: "",
                Europe: "",
            }[region];

            const clockLine = new FastfetchLine(
                {
                    keyConfig: {
                        category: this.data.keyConfig.category,
                        emoji: globeIcon ?? this.data.keyConfig.emoji,
                        textContent: tz.airport + " UTC" + utcString,
                    },
                    valueConfig: {
                        textContent: new Date().toLocaleTimeString("en-US", tz),
                    },
                },
                context.keyManager,
            );
            this.el.append(clockLine.wrapper);

            const update = () =>
                (clockLine.value.el.textContent = new Date().toLocaleTimeString(
                    "en-US",
                    tz,
                ));
            update();
            setInterval(update, 10 * 1000);
        });
    },
    ip: async function (context) {
        const cached = getCachedLocation();
        let line;
        if (cached) {
            line = new FastfetchLine(
                {
                    keyConfig: this.data.keyConfig,
                    valueConfig: { textContent: `${cached.ip} (cached)` },
                },
                context.keyManager,
            );
            this.el.append(line.wrapper);
        } else {
            this.el.append(this.progressLine.wrapper);
        }

        const locationData = await getLocation(context);
        if (line) {
            line.value.el.textContent = locationData.ip;
        } else {
            const freshLine = new FastfetchLine(
                {
                    keyConfig: this.data.keyConfig,
                    valueConfig: { textContent: locationData.ip },
                },
                context.keyManager,
            );
            this.el.append(freshLine.wrapper);
        }
    },
    location: async function (context) {
        const cached = getCachedLocation();
        let line;
        if (cached) {
            line = new FastfetchLine(
                {
                    keyConfig: this.data.keyConfig,
                    valueConfig: {
                        textContent: `${cached.city} ${cached.region} ${cached.country} (cached)`,
                    },
                },
                context.keyManager,
            );
            this.el.append(line.wrapper);
        } else {
            this.el.append(this.progressLine.wrapper);
        }

        const locationData = await getLocation(context);
        if (line) {
            line.value.el.textContent = `${locationData.city} ${locationData.region} ${locationData.country}`;
        } else {
            const freshLine = new FastfetchLine(
                {
                    keyConfig: this.data.keyConfig,
                    valueConfig: {
                        textContent: `${locationData.city} ${locationData.region} ${locationData.country}`,
                    },
                },
                context.keyManager,
            );
            this.el.append(freshLine.wrapper);
        }
    },
    weather: async function (context) {
        const header = make("span", {
            className: "command-line",
            textContent: "Weather for loading...",
        });
        this.el.append(header);
        this.el.append(this.progressLine.wrapper);
        const locationData = await getLocation(context);
        header.textContent = `Weather for ${this.data.label ?? locationData.city}`;

        const [latitude, longitude] =
            this.data.latitude && this.data.longitude
                ? [this.data.latitude, this.data.longitude]
                : locationData.loc.split(",");
        const metroAPI = "https://api.open-meteo.com/v1/forecast?";
        const options = [
            "latitude=" + latitude,
            "longitude=" + longitude,
            "daily=" +
                [
                    "temperature_2m_max",
                    "temperature_2m_min",
                    "weather_code",
                    "precipitation_probability_max",
                ].join(","),
            "timezone=auto",
            "forecast_days=3",
        ].join("&");
        const constructedURL = metroAPI + options;

        const [weatherCodes, weatherData] = await Promise.all([
            weatherCodesPromise,
            loadJson(constructedURL),
        ]);
        const dailyData = weatherData.daily;
        dailyData.time.forEach((day, i) => {
            const date = new Date(day);
            const weatherCode = weatherCodes[dailyData.weather_code[i]];
            const rainStr =
                weatherCode +
                " " +
                `(${dailyData.precipitation_probability_max[i]}% prob.)`;
            const tempStr =
                ` ${dailyData.temperature_2m_max[i]}°C`.padEnd(10) +
                ` ${dailyData.temperature_2m_min[i]}°C`;

            const line = new FastfetchLine(
                {
                    keyConfig: {
                        ...this.data.keyConfig,
                        textContent: date.toLocaleString(
                            ...this.data.keyConfig.dateFormat,
                        ),
                    },
                    valueConfig: {
                        textContent: rainStr.padEnd(35) + tempStr,
                    },
                },
                context.keyManager,
            );
            this.el.append(line.wrapper);
        });
    },
};
