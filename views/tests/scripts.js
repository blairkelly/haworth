console.log("Tests");

socket.on('connect', function () {
    socket.on('refresh', function (data) {
        window.location.reload();
    });
});