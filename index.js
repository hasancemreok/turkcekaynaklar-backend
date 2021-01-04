var express = require("express");
var bodyParser = require("body-parser");
var cors = require('cors');
const admin = require('firebase-admin')
const serviceAccount = require('./serviceAccount.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
var db = admin.firestore();

var app = express();
var allowedDomains = ['https://turkcekaynaklar.netlify.app', 'http://localhost:3000'];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
 
    if (allowedDomains.indexOf(origin) === -1) {
      var msg = "Siteniz ${origin} üzerinden bu API'ye erişminiz yoktur.";
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}));

app.use(bodyParser.json())

app.get('/api/topics', async (req, res) => {
  const topics = db.collection('topics');
  const data = await topics.orderBy('title', 'asc').get();

  res.status(200).json(data.docs.map(d => d.data()));
});

app.get('/api/topics/:id', async (req, res) => {
  const topics = db.collection('topics');
  const data = 
    await topics
      .where('name', '==', req.params.id)
      .get();

  res.status(200).json(data.docs.map(d => d.data()));
});

app.get('/api/topics/:id/resources', async (req, res) => {
  const resources = db.collection('resources');
  const data = await resources.where('topicId', '==', req.params.id).get();

  res.status(200).json(data.docs.map(d => d.data()));
});


app.get('/api/authors', async (req, res) => {
  const authors = db.collection('authors');
  const data = await authors.get();

  res.status(200).json(data.docs.map(d => d.data()));
});

app.get('/api/authors/:id', async (req, res) => {
  const authors = db.collection('authors');
  const data = 
    await authors
      .where('uniqueName', '==', req.params.id)
      .get();

  res.status(200).json(data.docs.map(d => d.data()));
});

app.get('/api/authors/:id/resources', async (req, res) => {
  const resources = db.collection('resources');
  const data = await resources.where('authorId', '==', req.params.id).get();

  res.status(200).json(data.docs.map(d => d.data()));
});


app.get('/api/resources', async (req, res) => {
  const resources = db.collection('resources');
  const data = await resources.get();

  res.status(200).json(data.docs.map(d => d.data()));
});

function handleError(res, reason, message, code) {
  console.log("ERROR: " + reason);
  res.status(code || 500).json({"error": message});
}

var server = app.listen(process.env.PORT || 8080, function () {
  var port = server.address().port;
  console.log("App now running on port", port);
});