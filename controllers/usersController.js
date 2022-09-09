import joi from "joi";
import bcrypt from "bcrypt";

export default async function signUp(req, res) {
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
  
    const passwordHash = bcrypt.hashSync(password, 10);
  
    try {
      await db.collection("users").insertOne({
        name: name,
        email: email,
        password: passwordHash,
      });
      return res.sendStatus(201);
    } catch (error) {
      console.error(error);
      return res.sendStatus(500);
    }
  };