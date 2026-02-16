const params = new URLSearchParams(window.location.search);
const form = (params.get("form") || "home").toLowerCase();

if (form === "pre") import("./pre.js");
else if (form === "post") import("./post.js");
else if (form === "eval") import("./eval.js");
else import("./home.js");
