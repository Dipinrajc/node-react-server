const https = require('https');
const fs = require('fs');
const path = require('path');
var MongoClient = require('mongodb').MongoClient;

var express = require('express');
var app = express();

const hostname = '127.0.0.1';
const port = 5000;

//const mongoHost = 'mongodb://aniq-mongodb:27018/aniq';
const cosmosHost = "mongodb://animongo:eTDJLkDMz0UhctTrjYNbj51R8H7JjsTOyKH1SLu9Z1MrWEMNcmWlqZxiKd6hjeZaFeaSz6PkO2i4PhZtbC3Rmw%3D%3D@animongo.documents.azure.com:10255/?ssl=true";
const mongoHost = 'mongodb://localhost:27017/aniq';

var certsPath = path.join(__dirname, 'certs', 'server');
options = {
  key: fs.readFileSync(path.join(certsPath, 'my-server.key.pem'))
  , cert: fs.readFileSync(path.join(certsPath, 'my-server.crt.pem'))
  , requestCert: false
  , rejectUnauthorized: true
};

const httpServer = https.createServer(options, app);

httpServer.listen(port, hostname, () => {
  console.log(`Server running at https://${hostname}:${port}/`);
});

app.get('/', function (res) {
  res.send('hello');
});

app.get('/v1/user/save', function (req, res) {
  query = req.query;
  user = { 'username': query.username, 'password': query.password };
  insert(res, user, query.callback);
});

app.get('/v1/user/login', function (req, res) {
  query = req.query;
  user = { 'username': query.username, 'password': query.password };
  login(res, user, query.callback);
});

app.get('/v1/user/update', function (req, res) {
  query = req.query;
  user = { 'username': query.username, 'password': query.password };
  update(res, user, query.callback);
});

function sendResponse(content, contentType, res) {
  res.writeHead(200, { 'Content-Type': contentType });
  res.write(content);
  res.end();
}

function insert(res, user, callback) {
  MongoClient.connect(mongoHost, { useNewUrlParser: true }, function (err, client) {
    if (err) throw err;
    const db = client.db('aniq');
    findByUsername(db, user.username).then((result) => {
      if (null != result) {
        content = { 'success': false, 'message': `There is already a user with username ${user.username}` };
      } else {
        db.collection('users').insertOne(user);
        content = { 'success': true, 'message': `Successfully inserted a user with username ${user.username}` };
      }
      client.close();
      dataToSent = callback + "(" + JSON.stringify(content) + ")";
      sendResponse(dataToSent, 'application/json', res);
    });
  });
}

function login(res, user, callback) {
  MongoClient.connect(mongoHost, { useNewUrlParser: true }, function (err, client) {
    if (err) throw err;
    const db = client.db('aniq');
    findByUsernameAndPassword(db, user.username, user.password).then((result) => {
      client.close();
      if (null != result) {
        content = { 'success': true, 'message': `Successfully logged in` };
      } else {
        content = { 'success': false, 'message': `Invalid credentails` };
      }
      dataToSent = callback + "(" + JSON.stringify(content) + ")";
      sendResponse(dataToSent, 'application/json', res);
    });
  });
}


function update(res, user, callback) {
  MongoClient.connect(mongoHost, { useNewUrlParser: true }, function (err, client) {
    if (err) throw err;
    const db = client.db('aniq');
    const collection = db.collection('users');
    collection.findAndModify({ "username": user.username }, [], { $set: { "password": user.password } }, { upsert: false, new: true }, function (err, result) {
      client.close();
      if (err || null == result || null == result.value) {
        content = { 'success': false, 'message': `There is no user with username ${user.username}` };
      } else {
        content = { 'success': true, 'message': `Successfully updated user with username ${user.username}` };
      }
      dataToSent = callback + "(" + JSON.stringify(content) + ")";
      sendResponse(dataToSent, 'application/json', res);
    });
  });
}

const findByUsername = (db, username) => {
  return new Promise(function (resolve, reject) {
    const collection = db.collection('users');
    collection.findOne({ "username": username }, function (err, result) {
      if (err) reject(err);
      resolve(result);
    });
  });
}

const findByUsernameAndPassword = (db, username, password) => {
  return new Promise(function (resolve, reject) {
    const collection = db.collection('users');
    collection.findOne({ "username": username, "password": password }, function (err, result) {
      if (err) reject(err);
      resolve(result);
    });
  });
}
