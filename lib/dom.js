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
