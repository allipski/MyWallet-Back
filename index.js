import express from "express";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import cors from "cors";
import signUp from "./controllers/usersController.js";
import login from "./controllers/sessionsController.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const mongoClient = new MongoClient(process.env.MONGO_URI);

mongoClient.connect(() => {
  global.db = mongoClient.db("mywallet");
});

app.post("/cadastro", signUp);

app.post("/login", login);

app.listen(5000, () => {
  console.log("Server is listening on port 5000.");
});
