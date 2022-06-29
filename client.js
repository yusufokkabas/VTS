
//client.js
var io = require('socket.io-client');
var socket = io.connect('http://127.0.0.1:3000');
// Add a connect listener
socket.on('connect', function (data) {
    console.log('Connected!');
    if(socket!==undefined){
        socket.on('data', function(data){
            console.log(data);        
        });

    }

});

socket.on('disconnect',function(socket){
    console.log('disconnected!');
})

/*socket.on('change', function (socket) {
    //console.log('CHANGES', socket.change);
    console.log('ITEM : ', socket.item.SYSTEM_ID, " - ", socket.item.BUS_ID);
});

socket.on('data', function (data) {
    console.log('data', data);
});
socket.on('event', function (socket) {
    console.log('event ', socket);
});
socket.on('error', function (socket) {
    console.error('error ', socket);
});
setTimeout(() => {
    let sendData = {
        room: "026",
        busList: ["73139", "73078"]
    }
    // socket.emit('leave', sendData);
}, 15000);*/