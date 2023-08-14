const express = require("express");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;
const cors = require("cors");

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("sports info is ready");
});

app.listen(port, (req, res) => {
  console.log(`sports info is running  port : ${port}`);
});
