
const { MongoClient } = require('mongodb');
mongo = require('mongodb').MongoClient;
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
let latestRateData = {}
let mongoCollectionName = 'baseTRY';
let mongoDbName = 'exchRate';
let client = new MongoClient("mongodb://127.0.0.1:27017?directConnection=true&replicaSet=jump-set", { useNewUrlParser: true });
MongoConnection = function () {
    initConnection()
};

const initConnection = async () => {
    await connectToMongo().catch(err => console.log(err));
    //latestRateData = await getLatestRateData().catch(err => console.error(err));
    console.log(Object.keys(latestRateData).length);
    http.listen(3000, () => console.log('listening on *:3000'));
}

/*app.get("/mongo", async (req, res) => {
    let data = await getLatestRateData().catch(err => console.error(err));
    res.send(data)
})
const getLatestRateData = async () =>
    new Promise(async (resolve, reject) => {
        await client.db(mongoDbName).collection(mongoCollectionName).find({"base":"TRY"}).toArray(function (err, result) {
            if (err) reject(err);
            resolve(result);
        })
    })*/

const db = client.db('exchRate');
const coll = db.collection('baseTRY');
var XMLHttpRequest = require('xhr2');
  var requestURL = 'https://api.exchangerate.host/latest?symbols=USD,EUR,GBP&base=TRY';
  var request = new XMLHttpRequest();

async function updateCollections(){
  request.open('GET', requestURL);
  request.responseType = 'json';
  request.send();

  request.onload =  function() {
  var response = request.response;
  delete response['motd'];
  response['rates']['EUR']= between(18,20,5).toString();
  response['rates']['USD']= between(16,18,5).toString();
  response['rates']['GBP']= between(20,21,5).toString();
  var updateResult =coll.updateOne(
    {"base":"TRY"},
    {$set:response},
    {"upsert":true},
    function(err, res) {
      if (err) throw err;
      console.log("1 document updated");
    }   
  );  
};
return updateResult;
/*coll.findOne(function(err, result){
    if(err){
        throw err;
    }
    io.emit('data', {result});
});*/
}
const connectToMongo = async () =>
    new Promise(async (resolve, reject) => {
        await client.connect(function (err, cli) {
            if (err) reject(err);
            resolve(cli);
        })
    })
process.on('uncaughtException', (err, origin) => {
    console.error(`Caught exception: ${err}\n` +
        `Exception origin: ${origin}`
    );
});
function between(min, max, decimals) {
    const str = (Math.random() * (max - min) + min).toFixed(decimals);
  
    return parseFloat(str);
  }
MongoConnection();
setInterval(async ()=>{
   let latestRateData = await updateCollections()
},10000)

io.on('connection',function(socket){
    console.log('connected to server');
});
