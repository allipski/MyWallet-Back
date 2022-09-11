import joi from "joi";
import { v4 as uuid } from "uuid";
import bcrypt from "bcrypt";

export default async function login(req, res) {
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

    if (user && passwordIsValid && !jaLogou) {
      const token = uuid();
      const person = {
        userid: user._id,
        name: user.name,
        email: user.email,
        token: token,
      };
      await db.collection("sessions").insertOne(person);
      return res.status(200).send({
        name: user.name,
        email: user.email,
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
