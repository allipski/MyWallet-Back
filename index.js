import express from "express";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import joi from "joi";
import cors from "cors";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const mongoClient = new MongoClient(process.env.MONGO_URI);
let db;

mongoClient.connect(() => {
  db = mongoClient.db("mywallet");
});

app.post("/cadastro", async (req, res) => {
  const {
    name: name,
    email: email,
    password: password,
    confirma: confirma,
  } = req.body;

  const cadastroSchema = joi.object({
    name: joi.string().required(),
    email: joi.string().email().required(),
    password: joi.string().required(),
    confirma: joi.string().valid(password).required(),
  });

  const validation = cadastroSchema.validate(
    { name: name, email: email, password: password, confirma: confirma },
    { abortEarly: true }
  );

  const validarEmail = await db.collection("users").findOne({ email: email });
 
  if (validation.error || validarEmail) {
    return res.sendStatus(422);
  }
  try {
    await db.collection("users").insertOne({
      name: name,
      email: email,
      password: password,
      confirma: confirma,
    });
    return res.sendStatus(201);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

app.listen(5000, () => {
  console.log("Server is listening on port 5000.");
});
