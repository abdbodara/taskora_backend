const express = require("express");
const cors = require("cors");
const mainRouter = require("./routes/indexRotes");
require("dotenv").config();

const app = express();
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

app.use("/api", mainRouter);

module.exports = app;
