
        //client.js
        var io = require('socket.io-client');
        var socket = io.connect('http://127.0.0.1:3000');
        // Add a connect listener
        socket.on('connect', function (data) {
            console.log('Connected!');
            let nid="004"
            socket.emit("dataGetter",nid);
            socket.on("sendAlteredData",(err,data)=>{
                if(err)throw(err);
                console.log(data);

            });  
        });
        
        
        socket.on('change', function (socket) {
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
