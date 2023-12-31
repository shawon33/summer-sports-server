const express = require("express");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const jwt = require("jsonwebtoken");
const stripe = require("stripe")(process.env.PAYMENT_SECRET_KEY);
const port = process.env.PORT || 5000;
const cors = require("cors");

app.use(cors());
app.use(express.json());

const verifyJWt = (req, res, next) => {
  const authorized = req.headers.authorization;
  if (!authorized) {
    return res
      .status(401)
      .send({ error: true, message: "unauthorized access" });
  }
  const token = authorized.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN, (error, decoded) => {
    if (error) {
      return res
        .status(401)
        .send({ error: true, message: "unauthorized access to" });
    }
    req.decoded = decoded;
    next();
  });
};

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
const dbConnect = async () => {
  try {
    client.connect();
    console.log("Travel Database Connected!");
  } catch (error) {
    console.log(error.name, error.message);
  }
};
dbConnect();

const instructorsCollection = client
  .db("summer-camph")
  .collection("Instructor");

const classCollection = client.db("summer-camph").collection("class");

const extraCollection = client.db("summer-camph").collection("extrasection");

// user collection
const usersCollection = client.db("summer-camph").collection("users");

// sports Collection
const sportsCollection = client.db("summer-camph").collection("sports");

// payment collection
const paymentCollection = client.db("summer-camph").collection("payment");
// enrollClass Collection
const enrollCollection = client.db("summer-camph").collection("enrollClass");

// JWT
app.post("/jwt", async (req, res) => {
  const user = req.body;
  const token = jwt.sign(user, process.env.ACCESS_TOKEN, {
    expiresIn: "1h",
  });
  res.send({ token });
});

// mongodb verifyJWT /  || user?.role!== 'instructor'
const verifyAdmin = async (req, res, next) => {
  const email = req.decoded.email;
  const query = { email: email };
  const user = await usersCollection.findOne(query);
  if (user?.role !== "admin") {
    return res.status(403).send({ error: true, message: "forbidden message" });
  }
  next();
};
// Instructor verify
// const verifyInstructor = async (req, res, next) => {
//   console.log(req);
//   const email = req.decoded.email;
//   const query = { email: email };
//   const user = await usersCollection.findOne(query);
//   if (user?.role !== "instructor") {
//     return res
//       .status(403)
//       .send({ error: true, message: "forbidden message" });
//   }
//   next();
// };

// user api
app.get("/users", verifyJWt, verifyAdmin, async (req, res) => {
  const result = await usersCollection.find().toArray();
  res.send(result);
});

app.post("/users", async (req, res) => {
  const user = req.body;
  const query = { email: user.email };
  const existedUser = await usersCollection.findOne(query);
  if (existedUser) {
    return res.send({ message: "user already exists" });
  }
  const result = await usersCollection.insertOne(user);
  res.send(result);
});

app.get("/users/admin/:email", verifyJWt, async (req, res) => {
  const email = req.params.email;
  if (req.decoded.email !== email) {
    res.send({ admin: false });
  }
  const query = { email: email };
  const user = await usersCollection.findOne(query);
  const result = { admin: user?.role === "admin" };
  res.send(result);
});

app.get("/users/instructor/:email", verifyJWt, async (req, res) => {
  const email = req.params.email;
  if (req.decoded.email !== email) {
    res.send({ instructor: false });
  }
  const query = { email: email };
  const user = await usersCollection.findOne(query);
  const result = { instructor: user?.role === "instructor" };
  res.send(result);
});

app.patch("/users/admin/:id", async (req, res) => {
  const id = req.params.id;
  const filter = { _id: new ObjectId(id) };
  const updateDoc = {
    $set: {
      role: "admin",
    },
  };
  const result = await usersCollection.updateOne(filter, updateDoc);
  res.send(result);
});

app.patch("/users/instructor/:id", async (req, res) => {
  const id = req.params.id;
  const filter = { _id: new ObjectId(id) };
  const updateDoc = {
    $set: {
      role: "instructor",
    },
  };
  const result = await usersCollection.updateOne(filter, updateDoc);
  res.send(result);
});
// app.delete()

// write here for servier

// class api
app.get("/class", async (req, res) => {
  const cursor = classCollection.find();
  const result = await cursor.toArray();
  res.send(result);
});

app.post("/class", async (req, res) => {
  const infoClass = req.body;
  const result = await classCollection.insertOne(infoClass);
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
app.get("/sports", verifyJWt, async (req, res) => {
  const email = req.query.email;
  // console.log(email);
  if (!email) {
    res.send([]);
  }
  const decodedEmail = req.decoded.email;
  if (email !== decodedEmail) {
    return res.status(401).send({ error: true, message: "Faltoo people" });
  }
  const query = { email: email };
  const result = await sportsCollection.find(query).toArray();
  // console.log(result);
  res.send(result);
});

app.post("/sports", async (req, res) => {
  const sports = req.body;
  // console.log(sports);
  const result = await sportsCollection.insertOne(sports);
  res.send(result);
});

app.delete("/sports/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await sportsCollection.deleteOne(query);
  res.send(result);
});

// payment

app.post("/create-payment-intent", verifyJWt, async (req, res) => {
  const { price } = req.body;
  const amount = price * 100;
  // console.log(price, amount);
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount,
    currency: "usd",
    payment_method_types: ["card"],
  });
  res.send({
    clientSecret: paymentIntent.client_secret,
  });
});

// payment api

app.get("/payment", verifyJWt, async (req, res) => {
  const email = req.query.email;
  // console.log(email);
  if (!email) {
    res.send([]);
  }
  const decodedEmail = req.decoded.email;
  if (email !== decodedEmail) {
    return res.status(401).send({ error: true, message: "Faltoo people" });
  }
  const query = { email: email };
  const result = await paymentCollection.find(query).toArray();
  // console.log(result);
  res.send(result);
});

app.post("/payments", verifyJWt, async (req, res) => {
  const payment = req.body;
  // console.log("sala",payment.paymentId);
  const result = await paymentCollection.insertOne(payment);
  const query = {
    _id: { $in: payment.paymentId.map((id) => new ObjectId(id)) },
  };
  console.log(query);
  const enrollClass = payment.item;
  const enroll = await enrollCollection.insertMany(enrollClass);
  const deleteResult = await sportsCollection.deleteMany(query);
  res.send({ result, deleteResult, enroll });
});
// enroll class get api

app.get("/enrollClass", verifyJWt, async (req, res) => {
  const email = req.query.email;
  if (!email) {
    res.send([]);
  }
  const decodedEmail = req.decoded.email;
  if (email !== decodedEmail) {
    return res.status(401).send({ error: true, message: "Faltoo people" });
  }
  const query = { email: email };
  const result = await enrollCollection.find(query).toArray();
  res.send(result);
});

app.listen(port, (req, res) => {
  console.log(`sports info is running  port : ${port}`);
});
