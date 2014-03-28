TP.user = null;

TP.events.on("user.auth", function(user) {
    TP.user = user;
});
