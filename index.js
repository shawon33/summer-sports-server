const express = require("express");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000;
const cors = require("cors");

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("sports info is ready");
});

const uri = `mongodb+srv://${process.env.SC_NAME}:${process.env.SC_PASS}@cluster0.qkjph1d.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const instructorsCollection = client
      .db("summer-camph")
      .collection("Instructor");
    const classCollection = client.db("summer-camph").collection("class");
    const extraCollection = client
      .db("summer-camph")
      .collection("extrasection");

      // user collection
    const usersCollection = client.db("summer-camph").collection("users");

    // sports Collection
    const sportsCollection = client.db("summer-camph").collection("sports");

    // JWT
    app.post('/jwt',async(req,res)=>{
      const user = req.body;
      const token = jwt.sign(user,process.env.ACCESS_TOKEN,{expiresIn : '2h'})
      res.send({token})
    })

    // user api
    app.get('/users',async(req,res)=>{
      const cursor = usersCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });


    app.post("/users", async (req, res) => {
      const user = req.body;
      const query = { email: user.email }
      const existedUser = await usersCollection.findOne(query);
      if (existedUser) {
        return res.send({ message: 'user already exists' })
      }
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    app.patch('/users/admin/:id',async (req,res)=>{
      const id = req.params.id;
      const filter =  {_id : new ObjectId(id)}
      const updateDoc = {
        $set:{
          role :'admin'
        }
      }
      const result = await usersCollection.updateOne(filter,updateDoc);
      res.send(result)
    })
    // app.delete()

    // write here for servier

    // class api
    app.get("/class", async (req, res) => {
      const cursor = classCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // instructor api
    app.get("/Instructor", async (req, res) => {
      const cursor = instructorsCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // extra-section api

    app.get("/extrasection", async (req, res) => {
      const cursor = extraCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // class with post and email
    app.get("/sports", async (req, res) => {
      const email = req.query.email;
      if (!email) {
        res.send([]);
      }
      const query = { email: email };
      const result = await sportsCollection.find(query).toArray();
      res.send(result);
    });

    app.post("/sports", async (req, res) => {
      const sports = req.body;
      console.log(sports);
      const result = await sportsCollection.insertOne(sports);
      res.send(result);
    });

    app.delete("/sports/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await sportsCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, (req, res) => {
  console.log(`sports info is running  port : ${port}`);
});
