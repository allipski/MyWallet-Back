import joi from "joi";
import { v4 as uuid } from "uuid";
import bcrypt from "bcrypt";
import { ObjectId } from "mongodb";

export async function login(req, res) {
  const { email, password } = req.body;

  const loginSchema = joi.object({
    email: joi.string().email().required(),
    password: joi.string().required(),
  });

  const validation = loginSchema.validate(
    { email: email, password: password },
    { abortEarly: true }
  );

  if (validation.error) {
    return res.sendStatus(422);
  }

  try {
    const user = await db.collection("users").findOne({ email });
    const jaLogou = await db.collection("sessions").findOne({ email });
    const passwordIsValid = bcrypt.compareSync(password, user.password);

    if (user && passwordIsValid && jaLogou) {
      return res.status(200).send({
        _id: user.userid,
        name: user.name,
        email: user.email,
        token: jaLogou.token,
      });
    }

    if (user && passwordIsValid && !jaLogou) {
      const token = uuid();
      const person = {
        userid: user._id,
        name: user.name,
        email: user.email,
        token: token,
      };
      await db.collection("sessions").insertOne(person);
      const resposta = await db
        .collection("sessions")
        .findOne({ userid: user._id });
      return res.status(200).send({
        _id: resposta._id,
        name: resposta.name,
        email: resposta.email,
        token: token,
      });
    } else {
      return res
        .status(404)
        .send(
          "User not found or user already logged in. Check your info and try again."
        );
    }
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
}

export async function logout(req, res) {

const {id} = req.params
const toDelete = { _id: new ObjectId(id) }
console.log(toDelete)

  try {
    const session = await db.collection("sessions").findOne(toDelete);
    console.log(session)
    if (!session) {
      return res
        .status(404)
        .send(
          "Session not found or user already logged out."
        );
      };

      const sessioon = await db.collection("sessions").deleteOne(toDelete);
      console.log(sessioon)
      return res.sendStatus(200);
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
}
