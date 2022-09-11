import express from "express";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import cors from "cors";
import signUp from "./controllers/usersController.js";
import login from "./controllers/sessionsController.js";
import { postTransactions, getTransactions, deleteTransactions, updateTransactions } from "./controllers/transactionsController.js";

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
app.get("/transactions", verificaToken, getTransactions);
app.post("/transactions", verificaToken, postTransactions);
app.delete("/transactions/:id", verificaToken, deleteTransactions);
app.put("/transactions/:id", verificaToken, updateTransactions);

app.listen(5000, () => {
  console.log("Server is listening on port 5000.");
});

async function verificaToken(req, res, next) {
  const authorization = req.headers.authorization;

  const token = authorization?.replace("Bearer ", "");

	if (!token) {
    return res.sendStatus(401);
	}

  const session = await db.collection("sessions").findOne({ token });
  if (!session) {
    return res.sendStatus(401);
  }

	const user = await db.collection("users").findOne({ 
		_id: session.userid 
	});
	if (!user) {
	  return res.sendStatus(401);
	}

	res.locals.user = session;
  res.locals.transaction = req.body;

  next();
}
