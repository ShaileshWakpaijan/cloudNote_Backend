const connectToMongo = require("./db");
const cors = require("cors");
const { config } = require("dotenv");

const express = require("express");
const app = express();

config({
  path: "./config.env",
});
connectToMongo();

app.use(
  cors({
    origin: [process.env.FRONTEND_URL],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());

// Available routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/notes", require("./routes/notes"));

app.listen(process.env.PORT, () => {
  console.log(`Example app listening`);
});
