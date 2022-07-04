
        //client.js
        var io = require('socket.io-client');
        var socket = io.connect('http://127.0.0.1:3000');
        // Add a connect listener
        socket.on('connect', function (data) {
            console.log('Connected!');   
        });
        
        
        
        socket.on('change', function (socket) {
            //console.log('CHANGES', socket.change);
            console.log('ITEM : ', socket.item.bus_id , socket.item.lon , socket.item.lat);
        })
        
        socket.on('data', function (data) {
            console.log('data', data);
        });
        socket.on('event', function (socket) {
            console.log('event ', socket);
        });
        socket.on('error', function (socket) {
            console.error('error ', socket);
        });
        /*setTimeout(() => {
            let sendData = {
                room: "026",
                busList: ["73139", "73078"]
            }
            // socket.emit('leave', sendData);
        }, 15000);*/

