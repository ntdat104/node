const express = require("express");
const helmet = require("helmet");
const xss = require("xss-clean");
const compression = require("compression");
const cors = require("cors");
const mongoose = require("mongoose");

// Routes
const authRoute = require("./routes/auth");

// constants
const ENV = require("./constants/env");

const app = express();

// configs
const corsConfig = require("./configs/cors");

// set security HTTP headers
app.use(helmet());

// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// sanitize request data
app.use(xss());

// gzip compression
app.use(compression());

// enable cors
app.use(cors(corsConfig));
app.options("*", cors());

// app
app.get("/", (_, res) => {
  return res.redirect("/api/auth");
});

app.use("/api/auth", authRoute);

mongoose
  .connect(ENV.MONGODB_URL)
  .then(() => {
    console.log("Connected to DB 🍕");
    app.listen(ENV.PORT, () => console.log(`Server is running at: http://localhost:${ENV.PORT} 🍔`));
  })
  .catch((error) => {
    console.log("error", error);
  });
