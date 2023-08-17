const express = require("express");
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");
const app = express();
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
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const instructorsCollection = client.db("summer-camph").collection("Instructor");
    const classCollection = client.db("summer-camph").collection("class");
    const extraCollection = client.db("summer-camph").collection("extrasection");


    // write here for servier

    app.get("/class", async (req, res) => {
      const cursor = classCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/Instructor", async (req, res) => {
      const cursor = instructorsCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    app.get("/extrasection", async (req, res) => {
      const cursor = extraCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });




    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.listen(port, (req, res) => {
  console.log(`sports info is running  port : ${port}`);
});
