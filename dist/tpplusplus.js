/*! tpplusplus - v0.0.1 - 2014-03-27
* https://github.com/techdotpro/tpplusplus
* Copyright (c) 2014 ;*/
;(function() {
"use strict";
// var slice = Array.prototype.slice;
var TP = {};

TP.Core = {};
TP.UI = {};
TP.UI.Widgets = {};
TP.Utils = {};
TP.DOM = {};
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

// Use QSA
TP.$ = function() {
    return document.querySelectorAll.apply(document, arguments);
};

// Insert a `widget` into the dom by replacing `el` with a new element.
TP.DOM.insertWidget = function(widget, el) {
    var element = document.createElement(widget.tagName),
        event;

    element.className = widget.className;
    
    for(event in widget.events) {
        element.addEventListener(event, function(e) {
            widget.events[event].call(widget, e);
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
window.addEventListener("message", function(e) {
    if (e.origin === "http://oil.com" || e.origin === "http://oilpro.com") {
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
iframe.src = "http://oilpro.com/widget/button";

document.documentElement.appendChild(iframe);
var _widgets = {},
    _instances = {},
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

// Scan the page for any widgets. Will scan by the name of the widget.
// For example, the `PlusPlus` widget will scan the page for elements
// with a tag name of `<tp-plusplus>`.
TP.UI.Widgets.scan = function() {
    var name, elements;
    for (name in _widgets) {
        elements = TP.$("tp-" + name.toLowerCase());

        if (elements.length) {
            TP.UI.Widgets.loadWidgets(name, elements);
        }
    }
};

// Load's a group of widgets by `name`, and an array `elements`.
TP.UI.Widgets.loadWidgets = function(name, elements) {
    var i, len;
    for(i = 0, len = elements.length; i < len; i++) {
        var widget = new _widgets[name](elements[i]);
        
        _instances[name.toLowerCase() + "_" + (++count)] = widget;

        this.loadWidget(widget, elements[i]);
    }
};

TP.UI.Widgets._instances = _instances;

/// Load an individual `widget` to an element `el`
TP.UI.Widgets.loadWidget = function(widget, el) {
    TP.DOM.insertWidget(widget, el);
};


// ### TP.UI.Widgets.PlusPlus
// A widget for rendering a TP++ button
TP.UI.Widgets.register("PlusPlus", function(/*element?*/) {
    this.tagName = "a";

    // The data for rendering in the template
    this.data = {
        count: 0
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
            // window.open("http://tech.pro/links/submit?url="+encodeURIComponent(element.getAttribute("data-href") || window.location.href));
        }.bind(this)
    };

    // Subscribe to events
    this.subscriptions = {
        "countUpdate": function(count) {
            this.data.count = count;
            this.update();
        }.bind(this)
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
window.TP = TP;
}());