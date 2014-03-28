/*! tpplusplus - v0.0.1 - 2014-03-28
* https://github.com/techdotpro/tpplusplus
* Copyright (c) 2014 ;*/
;(function() {
"use strict";
if (typeof Object.create !== "function") {
    (function () {
        var F = function () {};
        Object.create = function (o) {
            F.prototype = o;
            return new F();
        };
    })();
}

if (!Function.prototype.bind) {
  Function.prototype.bind = function (oThis) {
    if (typeof this !== "function") {
      // closest thing possible to the ECMAScript 5 internal IsCallable function
      throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
    }

    var aArgs = Array.prototype.slice.call(arguments, 1),
        fToBind = this,
        FNOP = function () {},
        FBound = function () {
          return fToBind.apply(this instanceof FNOP && oThis ? this : oThis, aArgs.concat(Array.prototype.slice.call(arguments)));
        };

    FNOP.prototype = this.prototype;
    FBound.prototype = new FNOP();

    return FBound;
  };
}
var TP = {};

TP.Core = {};
TP.UI = {};
TP.UI.Widgets = {};
TP.Utils = {};
TP.DOM = {};
TP.Frames = {};

// A small template function. Use it like...
//
//    template("something {{foo}}", {
//        foo: "bar"
//    }); // something bar
//
var template = function(html, options) {
    var re = /{{(\s*[\w\.]+\s*)}}/g,
        match,
        reExp = /(^( )?(if|for|else|switch|case|break|{|}))(.*)?/g, 
        code = "var r=[];\n",
        cursor = 0;
    
    var add = function(line, js) {
        if (js) {
            code += line.match(reExp) ? line + "\n" : "r.push(this." + line + ");\n";
        }
        else {
            code += line !== "" ? "r.push('" + line.replace(/"/g, "\\\"") + "');\n" : "";
        }
        return add;
    };
    while(match = re.exec(html)) {
        add(html.slice(cursor, match.index))(match[1], true);
        cursor = match.index + match[0].length;
    }
    add(html.substr(cursor, html.length - cursor));
    
    code += "return r.join(\"\");";

    return new Function(code.replace(/[\r\t\n]/g, '')).apply(options);
};
TP.events = {};

// https://gist.github.com/fatihacet/1290216
(function(q) {
    var topics = {}, subUid = -1;
    q.on = function(topic, func) {
        if (!topics[topic]) {
            topics[topic] = [];
        }
        var token = (++subUid).toString();
        topics[topic].push({
            token: token,
            func: func
        });

        return token;
    };

    q.emit = function(topic, args) {
        if (!topics[topic]) {
            return false;
        }
        setTimeout(function() {
            var subscribers = topics[topic],
                len = subscribers ? subscribers.length : 0;

            while (len--) {
                subscribers[len].func(args, {
                    topic: topic,
                    data: args,
                    timestamp: new Date()
                });
            }
        }, 0);
        return true;

    };

    q.off = function(token) {
        for (var m in topics) {
            if (topics[m]) {
                for (var i = 0, j = topics[m].length; i < j; i++) {
                    if (topics[m][i].token === token) {
                        topics[m].splice(i, 1);
                        return token;
                    }
                }
            }
        }
        return false;
    };
}(TP.events));

// Use QSA
TP.$ = function() {
    return document.querySelectorAll.apply(document, arguments);
};

TP.$.on = function(el, name, fn) {
    if (el.addEventListener) {
        el.addEventListener(name, fn, false);
    }
    else if (el.attachEvent)  {
        el.attachEvent("on" + name, fn);
    }
};

// Insert a `widget` into the dom by replacing `el` with a new element.
TP.DOM.insertWidget = function(widget, el) {
    var element = document.createElement(widget.tagName),
        eventName;

    element.className = widget.className;

    for(eventName in widget.events) {
        TP.$.on(element, eventName, function(e) {
            widget.events[eventName].call(widget, e);
        });
    }

    el.parentNode.replaceChild(element, el);
    widget.element = element;
    widget.update();
};

// Update a `widget` with `content`.
TP.DOM.updateWidget = function(widget, content) {
    widget.element.innerHTML = content;
};

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

TP.$.on(window, "message", messageRecieved);

var iframe = TP.Frames.main = document.createElement("iframe");
TP.Frames.initialize = function() {
    iframe.width = 0;
    iframe.height = 0;
    iframe.style.display = "none";
    iframe.src = "http://oil.com/widget/button";

    document.documentElement.appendChild(iframe);
};

TP.user = null;

TP.events.on("user.auth", function(user) {
    TP.user = user;
});

var _widgets = {},
    _instances = [],
    count = 0;

// ### TP.UI.Widgets.BaseWidget
// A base widget
TP.UI.Widgets.BaseWidget = function() {
    this.template = "";
    this.data = {};
};

// Update the widget by re-rendering it's template
TP.UI.Widgets.BaseWidget.prototype.update = function() {
    TP.DOM.updateWidget(this, template(this.template, this.data));
};

// Register's a new widget
TP.UI.Widgets.register = function(name, widget) {
    _widgets[name] = widget;
    widget.prototype = Object.create(TP.UI.Widgets.BaseWidget.prototype);
    widget.prototype.constructor = widget;
};

TP.UI.Widgets.BaseWidget.prototype.emit = function(eventName, data) {
    TP.events.emit([
        "widgets",
        this._instanceId,
        this._name,
        eventName].join("."), data);
};

// Scan the page for any widgets. Will scan by the name of the widget.
// For example, the `PlusPlus` widget will scan the page for elements
// with a tag name of `<tp-plusplus>`.
TP.UI.Widgets.scan = function() {
    var name, tpElements, elements = [];
    for (name in _widgets) {
        tpElements = document.getElementsByTagName("tp-" + name.toLowerCase());

        if (tpElements.length) {
            for(var i = 0, len = tpElements.length; i < len; i++) {
                elements.push(tpElements[i]);
            }
        }

        if (elements.length) {
            TP.UI.Widgets.loadWidgets(name, elements);
        }
    }
};

// Load's a group of widgets by `name`, and an array `elements`.
TP.UI.Widgets.loadWidgets = function(name, elements) {
    var i, len;
    for(i = 0, len = elements.length; i < len; i++) {
        var widget = new _widgets[name](elements[i]),
            instanceId = (++count);

        _instances.push(widget);

        widget._name = name.toLowerCase();
        widget._instanceId = instanceId;

        this.loadWidget(widget, elements[i]);
    }
};

TP.UI.Widgets._instances = _instances;


var widgetEvents = [];
// Load an individual `widget` to an element `el`
TP.UI.Widgets.loadWidget = function(widget, el) {
    var eventName;

    TP.DOM.insertWidget(widget, el);

    if (widget.on) {
        for (eventName in widget.on) {
            // Defer adding widget events until communication between the frame
            // and window is ready.
            // e.g. widgets.plusplus.1.countUpdate
            widgetEvents.push(addWidgetEvent(widget, eventName));
        }
    }
};
function addWidgetEvent(widget, eventName) {
    return function() {
            TP.Frames.on([
                "widgets",
                widget._instanceId,
                widget._name,
                eventName
                ].join("."), {
                    topic: widget._name + "." + eventName,
                    id: widget._instanceId,
                    data: widget.data
                }, function(data) {
            widget.on[eventName].call(widget, data);
        });
    }
}

TP.events.on("frame.ready", function() {
    var i;

    for(i = 0; i < widgetEvents.length; i++) {
        widgetEvents[i]();
    }

    for(i = 0; i < _instances.length; i++) {
        _instances[i].initialize();
    }
});


// ### TP.UI.Widgets.PlusPlus
// A widget for rendering a TP++ button
TP.UI.Widgets.register("PlusPlus", function(el) {
    this.tagName = "a";

    // The data for rendering in the template
    this.data = {
        count: 0,
        url: el.getAttribute("data-href") || window.location.href
    };
    // The template will look for `{{key}}` in the `data` and be rendered with the `update` method
    // of a base widget.
    this.template =
        "<img class=\"bookmarklet-ico\" src=\"http://tpstatic.com/img/root/techpro/favicon.ico\">" +
        "<span class=\"bookmarklet-inner\">TP++</span>" +
        "<span class=\"count\">{{count}}</span>";

    this.className = "btn-bookmarklet pull-left";

    // Assign dom events to this widget
    this.events = {
        click: function() {
            this.data.count++;
            this.update();

            this.emit("countUpdate")
            // window.open("http://tech.pro/links/submit?url="+encodeURIComponent(element.getAttribute("data-href") || window.location.href));
        }
    };

    // Subscribe to events
    this.on = {
        countUpdate: function(data) {
            this.data.count = data.count;
            this.update();
        },
        foo: function(data) {
            console.log("some damn foo:" + data.bar);
        }
    };

    this.initialize = function() {
        this.emit("countUpdate");
    };
});

// Create style tag for button styles
var css = "body {font-family: \"museo-sans\",\"Helvetica Neue\",Helvetica,Arial,sans-serif;} .btn-bookmarklet .bookmarklet-inner{font-size:14px;line-height:16px;font-weight:700;color:#444;vertical-align:middle;display:inline-block}Inherited from a#bookmarklet.btn-bookmarklet.pull-left .btn-bookmarklet{}.btn-bookmarklet{display:inline-block;margin-top:1px;-moz-box-shadow:#ddd 1px 1px 4px;-webkit-box-shadow:#ddd 1px 1px 4px;box-shadow:#ddd 1px 1px 4px;-webkit-border-radius:3px;-moz-border-radius:3px;border-radius:3px;padding:5px 6px;background-color:#fafafa;border:1px solid #aaa;}a{cursor:pointer;color:#457bbe}.btn-bookmarklet .bookmarklet-ico{width:16px;height:16px}a img{border:0}img{max-width:100%;vertical-align:middle;border:0;-ms-interpolation-mode:bicubic}",
    head = document.head || document.getElementsByTagName("head")[0],
    style = document.createElement("style");

style.type = "text/css";
if (style.styleSheet){
    style.styleSheet.cssText = css;
} else {
    style.appendChild(document.createTextNode(css));
}

head.appendChild(style);
// Begin scanning for widgets
TP.UI.Widgets.scan();
TP.Frames.initialize();

window.TP = TP;
}());