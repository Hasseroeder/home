function setCookie(name, value, daysToLive = 365) {
    const date = new Date();
    date.setDate(date.getDate() + daysToLive);

    const expires = "expires=" + date.toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; ${expires}; path=/;`;
}

function deleteCookie(name) {
    setCookie(name, "", -1);
}

function getCookie(name) {
    const cookieDecoded = decodeURIComponent(document.cookie || "");
    const cookieArray = cookieDecoded.split("; ");

    for (const element of cookieArray) {
        if (element.startsWith(name + "=")) {
            return element.substring(name.length + 1);
        }
    }
    return null;
}

export { getCookie, setCookie, deleteCookie };
