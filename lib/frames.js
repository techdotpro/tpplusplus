// Special event listner for the frame events
TP.Frames.on = function(topic, data, fn) {
    TP.events.on(topic, function(d) {
        data.eventData = d;
        iframe.contentWindow.postMessage(JSON.stringify(data), "*");
    });

    TP.events.on(topic + ".done", function(data) {
        fn(data);
    });
};

var isAuthenticated;
var messageRecieved = function(e) {
    if (e.origin === "http://oil.com" || e.origin === "http://oilpro.com") {
        var el = document.createElement("pre");
        el.style.display = "block";
        el.innerHTML = e.data;
        document.documentElement.appendChild(el);

        var data = JSON.parse(e.data);

        if (data.member && typeof isAuthenticated == "undefined") {
            TP.events.emit("user.auth", data.member);
            isAuthenticated = true;

            TP.events.emit("frame.ready");
        }

        if (data.topic) {
            TP.events.emit(data.topic, data.data);
        }

        isAuthenticated = false;
    }
};

// Listen for messages from the iframe.
TP.$.on(window, "message", messageRecieved);

var iframe = TP.Frames.main = document.createElement("iframe");

// ###TP.Frames.initialize
// Initialize the main iframe
TP.Frames.initialize = function() {
    iframe.width = 0;
    iframe.height = 0;
    iframe.style.display = "none";
    iframe.src = "http://oil.com/widget/button";

    document.documentElement.appendChild(iframe);
};
