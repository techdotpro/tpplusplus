// var slice = Array.prototype.slice;
if (typeof Object.create !== "function") {
    (function () {
        var F = function () {};
        Object.create = function (o) {
            F.prototype = o;
            return new F();
        };
    })();
}