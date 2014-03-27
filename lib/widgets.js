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