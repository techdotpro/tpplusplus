// Use QSA
TP.$ = function() {
    return document.querySelectorAll.apply(document, arguments);
};

TP.$.on = function(el, name, fn) {
    if (el.addEventListener) {
        el.addEventListener(name, fn, false);
    }
    else if (el.attachEvent)  {
        el.attachEvent(name, fn);
    }
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