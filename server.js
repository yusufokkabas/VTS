
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
MongoConnection = function () {
    initConnection()
};

const initConnection = async () => {
    await connectToMongo().catch(err => console.log(err));
    http.listen(3000, () => console.log('listening on *:3000'));
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
    })
})
app.get("/get-sample-bus", async (req, res) => {
    client.db(mongoDbName).collection("26008").find({date_time:{$gt:new Date('2022-07-05T11:55:03.240+00:00')}}).limit(1000).toArray(function (err, result) {
        if (err) throw(err);
        res.send(result);
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

