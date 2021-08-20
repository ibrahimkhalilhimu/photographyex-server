const express = require('express')
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser')
const cors = require('cors')
const fs = require('fs-extra')
const fileUpload = require('express-fileupload');
const ObjectId = require('mongodb').ObjectId
require('dotenv').config()



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.huwqv.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;



const app = express()
app.use(bodyParser.json());
app.use(cors())
app.use(express.static('services'))
app.use(fileUpload())



const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const ServiceCollection = client.db("photographyex").collection("services");
  const orderCollection = client.db("photographyex").collection("order");
  const adminCollection = client.db("photographyex").collection("admin");

  app.post('/addServices',(req,res)=>{
    const newCourse = req.body
    ServiceCollection.insertOne(newCourse)
    .then(result=>{
      res.send(result.insertedCount>0)
    })
  })

  app.get('/services',(req,res) => {
    ServiceCollection.find({})
    .toArray((err,documents)=>{
      res.send(documents);
    })
  })

  app.get('/service/:id', (req, res) => {
    const id = ObjectId(req.params.id)
    console.log(id);
    ServiceCollection.find({ _id: id })
    .toArray( (err, documents) => {
        res.send(documents[0]);
    })
})

app.post('/addOrder',(req,res)=>{
    const orders = req.body;
    orderCollection.insertOne(orders)
    .then(result=>{
      res.send(result.insertedCount>0)
    })
  })

  app.get('/orders',(req,res)=>{
    orderCollection.find({email: req.query.email})
    .toArray((err,documents)=>{
      res.send(documents)
    })
  })

  app.post('/makeAdmin',(req, res)=>{
    const admin = req.body;
    console.log(admin);
    adminCollection.insertOne(admin)
    .then((result)=>{
      console.log(result.insertCount > 0);
      res.send(result.insertCount > 0);
    })
  })

  app.post('/isAdmin', (req, res) => {
    const email = req.body.email
    adminCollection.find({email:email})
    .toArray( (err, admin) => {
        res.send(admin.length>0);
    })
  })

  app.get('/order', (req, res) => {
    orderCollection.find({})
    .toArray( (err, documents) => {
        res.send(documents);
    })
  })

  app.delete('/deleteOrder/:id',(req,res)=>{
    orderCollection.deleteOne({_id:ObjectId(req.params.id)})
    .then((result)=>{
      console.log(result.deletedCount > 0);
       res.send(result.deletedCount > 0);
    })
    
  })


  app.patch('/statusUpdate/:id', (req, res) => {
    console.log(req.body);
    console.log(req.params.id);
    orderCollection.updateOne(
      { _id: ObjectId(req.params.id) },
      {
        $set: { OrderStatus
          :req.body.status }
      }
    )
      .then(result => {
        console.log(result);
        res.send(result.modifiedCount > 0)
      })
      .catch(err => console.log(err))


  })

  app.delete('/deleteService/:id',(req,res)=>{
    ServiceCollection.deleteOne({_id:ObjectId(req.params.id)})
    .then((result)=>{
      console.log(result.deletedCount > 0);
       res.send(result.deletedCount > 0);
    })
    
  })


});




const port = 5000
app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port)