
const { resolve } = require('path');
//var createSubscriber = require("pg-listen")
//const subscriber = createSubscriber({connectionString :"postgres://tsdbadmin:okkabas.1034@e23sfu01y8.nnk9fee4f8.tsdb.cloud.timescale.com:37930/tsdb"});
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var latestBusData = {}
const{Client}=require("pg");
//var PG = require('pg');
const client =new Client({
    user: 'tsdbadmin',
    host: 'e23sfu01y8.nnk9fee4f8.tsdb.cloud.timescale.com',
    database: 'tsdb',
    password: 'okkabas.1034',
    port: "37930"
    //table:'rides'
});
const connectionString = `postgres://${config.user}:${config.password}:@${config.host}:${config.port}/${config.database}`;
const pgClient = new PG.Client(connectionString);
DBConnection = function () {
    initConnection()
};
const initConnection = async () => {
    //createWatcher();
    //console.log(Object.keys(latestRateData).length);
    pgClient.connect();
    http.listen(3000, () => console.log('listening on *:3000'));
    pgClient.query(listen_Query);
    pgClient.on('notification',async(data)=>{
        //const payload = JSON.parse(data.payload);
        console.log('row updated!!',data.payload);

    })    
      
}
const select_Query = 'SELECT rides.bus_id,rides.date_time,rides.lat,rides.lon FROM rides';
const update_Query ='UPDATE rides SET rides.lat=$1,rides.lon=$2 WHERE rides.bus_id=$3';
const listen_Query ='LISTEN newsaleevent';
const createListener = () => {
    io.on('connection', async (socket) => {
        console.log('a user connected', socket.id)
        //const cookie = socket.handshake.headers.cookie;
        //let token = cookie.split(';').find(c => c.trim().startsWith('access_token=')).split('=')[1];
        //let { username } = jwt.decode(token);
        //const system_id = socket.handshake.query["networkid"];

        //let permissionFilter = await getPermissionByUser(username, system_id)
        let data = []

        //if (!system_id || !busList[system_id]) return socket.emit("error", "Make sure if you have valid networkid in query string")

        //let busses = Object.keys(busList[system_id]) // get all valid busses
        
        busses.forEach(bus => {
            let tempData = latestBusData[busList[system_id][bus]]

            let conditionCompCode = permissionFilter.hasOwnProperty("comp_code") && permissionFilter.comp_code != null ? permissionFilter.comp_code.includes(tempData.COMP_CODE + "") : true
            let conditionRouteCode = permissionFilter.hasOwnProperty("route_code") && permissionFilter.route_code != null ? permissionFilter.route_code.includes(tempData.ROUTE_CODE) : true
            let conditionBusId = permissionFilter.hasOwnProperty("bus_id") && permissionFilter.bus_id != null ? permissionFilter.bus_id.includes(tempData.BUS_ID) : true

            if (conditionCompCode && conditionRouteCode && conditionBusId) {
                socket.join(bus + "_" + system_id)
                data.push(tempData)
            }
        })
        socket.emit("data", { data })

        // currently we are not using this
        socket.on('create', function (data) {

            let retVal = []
            data.busList.forEach(bus => {
                socket.join(bus + "_" + data.room) // join room with bus and network id
                retVal.push(latestBusData[busList[bus + "_" + data.room]])
            });
            socket.emit("event", { data: retVal }); //return the latest datas by bus information
            console.log(socket.rooms);
        });

        socket.on("leave", (data) => {
            console.log(socket.rooms);
            data.busList.forEach(bus => socket.leave(bus + "_" + data.room));
            socket.emit("event", { message: "User left from " + data.busList })
        })
    });
}
const createWatcher = () => {
    try {
        let collection = client.db(mongoDbName).collection(mongoCollectionName)

        const changeStream = collection.watch();

        changeStream.on('change', (change) => {
            sendChanges(change);
        })
        changeStream.on('error', (change) => {
            console.log("error", change);
        })
    } catch (error) {
        console.log("error", error);
    }
}
const sendChanges = (change) => {
    if ("update" == change.operationType) {
        let id = change.documentKey._id.toString();
        let fields = change.updateDescription.updatedFields;
        if (latestBusData[id]) {
            latestBusData[id] = { ...latestBusData[id], ...fields } // update the device information
            let { bus_id } = latestBusData[id];
            io.emit("change", { change, item: latestBusData[id] });
        }
    } else if (["replace", "insert"].includes(change.operationType)) {
        let { bus_id, _id: id } = change.fullDocument;
        latestBusData[id.toString()] = change.fullDocument; // create or replace a new device with id
        io.to(bus_id).emit("change", { change, item: latestBusData[id.toString()] });
    }
    else if (change.operationType == "delete") {
        let { bus_id, _id: id } = change.documentKey
        delete latestBusData[id.toString()]
        io.to(bus_id).emit("change", change);

    }
}

app.get("/test", async (req, res) => {
    pgClient.query(select_Query,function(err,result){
        if(err) throw(err);
        res.send(result);
        console.log("query completed sucessfully");
    })

})
app.get("/t", async (req, res) => {
    let arr = await getLatestBusData();
    res.send(arr);
})

const getLatestBusData = async () =>
    new Promise(async (resolve, reject) => {
        pgClient.query(select_Query,function(err,result){
            if(err) throw(err);
            resolve(result)
            console.log('Latest bus data send');
        })
    })
    const setArrayToObject = (array) => {
        let object = {}
        array.forEach(element => {
            object[element._id.toString()] = element
        });
        return object;
    }
    const setDataToObject = (data) => {
        let object = {}
            object[data._id.toString()] = data
        return object;
    }

async function changeRandomBusData(data){
        data['lat']= between(30,35,5);
        data['lon']= between(30,35,5);
    pool.query(update_Query,[data['lat'],data['lon'],data['bus_id']],function(err,result){
        if (err) throw(err);
        console.log(result);

    })
};
function between(min, max, decimals) {
    const str = (Math.random() * (max - min) + min).toFixed(decimals);
  
    return parseFloat(str);
  }
DBConnection();
/*setInterval(async ()=>{
latestBusData = await getLatestBusData().catch(err => console.error(err));
latestBusData=latestBusData[0];
if(latestBusData!==undefined) await changeRandomBusData(latestBusData);
//latestBusData =setDataToObject(latestBusData);
},5000)*/

