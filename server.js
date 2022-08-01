
const { MongoClient, ServerApiVersion } = require('mongodb');
const { resolve } = require('path');
mongo = require('mongodb').MongoClient;
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var latestBusData = {}
let mongoCollectionName = "26007";
let mongoDbName = "test";
const uri = "mongodb+srv://yusuf:1234@cluster0.1lo5ouf.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
//let client = new MongoClient("mongodb://127.0.0.1:27017?directConnection=true&replicaSet=jump-set", { useNewUrlParser: true });
MongoConnection = function () {
    initConnection()
};

const initConnection = async () => {
    await connectToMongo().catch(err => console.log(err));
    //createWatcher();
    //console.log(Object.keys(latestRateData).length);
    http.listen(3000, () => console.log('listening on *:3000'));
}
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
    client.db(mongoDbName).collection(mongoCollectionName).find({"date-time":{$gt:new Date("2022-07-06T07:28:00.000+00:00"),$lt:new Date("2022-07-06T07:28:55.471+00:00")}}).limit(1000).toArray(function (err, result) {
        if (err) throw(err);
        res.send(result);
        //console.log(result);
    })
})
app.get("/t", async (req, res) => {
    client.db(mongoDbName).collection("26008").find({date_time:{$gt:new Date('2022-07-05T11:55:03.240+00:00')}}).limit(1000).toArray(function (err, result) {
        if (err) throw(err);
        res.send(result);
        //console.log(result);
    })
})
const getLatestBusData = async () =>
    new Promise(async (resolve, reject) => {
        client.db(mongoDbName).collection(mongoCollectionName).find().toArray(function (err, result) {
            if (err) reject(err);
            resolve(result);
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
        data['speed']= between(10,15,0);
    client.db(mongoDbName).collection(mongoCollectionName).updateOne(
    {"bus_id":data['bus_id']},
    {$set:data},
    {"upsert":true},
    function(err, res) {
      if (err) throw err;
    }   
  ); 
};

const connectToMongo = async () =>
    new Promise(async (resolve, reject) => {
        await client.connect(function (err, cli) {
            if (err) reject(err);
            console.log('connected');
            resolve(cli);
        })
    })
function between(min, max, decimals) {
    const str = (Math.random() * (max - min) + min).toFixed(decimals);
  
    return parseFloat(str);
  }
MongoConnection();
/*setInterval(async ()=>{
latestBusData = await getLatestBusData().catch(err => console.error(err));
latestBusData=latestBusData[0];
if(latestBusData!==undefined) await changeRandomBusData(latestBusData);
latestBusData =setDataToObject(latestBusData);
},5000)*/

