
var busData ={
    "bus_id": "26007",
    "date_time": "2022-06-28 13:05:54",
    "event": 0,
    "sub_event": 0,
    "event_description": null,
    "lat": 37.070895,
    "lon": 37.379948999999996,
    "speed": 6,
    "svcount": 16,
    "bearing": 16.32,
    "status": "2",
    "odometer": 44761541,
    "car_no": "G08",
    "edge_code": "G08",
    "route_color": "FF2B0A",
    "sam_id": "05157568",
    "direction": "0",
    "display_route_code": "T1",
    "personel_name": "YUSUF CAN ",
    "personel_last_name": "CİHAN",
    "driver_code": "04793",
    "c1": "26008",
    "c2": "26017"
  }
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://yusuf:1234@cluster0.1lo5ouf.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
client.db("test").createCollection(
  busData['bus_id'],{
    timeseries:{
      timeField:"date-time",
      metaField:"busData"
    }
  }
)
client.connect(err => {
  console.log('connected');
  const collection = client.db("test").collection(busData['bus_id']);
  for(var i=1;i<=50000;i++){
    var date = new Date();
    let lat= between(30,35,0);
    let lon= between(30,35,0);
    let speed= between(10,15,0);
    collection.insertOne({
    "busData":{
    "bus_id": "26007",
    "event": 0,
    "sub_event": 0,
    "event_description": null,
    "lat": lat,
    "lon": lon,
    "speed": speed,
    "svcount": 16,
    "bearing": 16.32,
    "status": "2",
    "odometer": 44761541,
    "car_no": "G08",
    "edge_code": "G08",
    "route_color": "FF2B0A",
    "sam_id": "05157568",
    "direction": "0",
    "display_route_code": "T1",
    "personel_name": "YUSUF CAN ",
    "personel_last_name": "CİHAN",
    "driver_code": "04793",
    "c1": "26008",
    "c2": "26017"
    },
    "date-time":date
    })
  }
  
});
function between(min, max, decimals) {
    const str = (Math.random() * (max - min) + min).toFixed(decimals);
  
    return parseFloat(str);
  }
