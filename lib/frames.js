window.addEventListener("message", function(e) {
    if (e.origin === "http://oil.com") {
        var el = document.createElement("pre");
        el.style.display = "block";
        el.innerHTML = JSON.stringify(JSON.parse(e.data), null, 4);
        document.documentElement.appendChild(el);
    }
});

var iframe = document.createElement("iframe");
iframe.width = 0;
iframe.height = 0;
iframe.style.display = "none";
iframe.src = "http://oil.com/widget/button";

document.documentElement.appendChild(iframe);