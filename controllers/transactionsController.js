import { ObjectId } from "mongodb";
import joi from "joi";

export async function getTransactions(req, res) {
  const user = res.locals.user;

  try {
    const transactions = await db
      .collection(`transactions_${user.userid}`)
      .find()
      .toArray();
    return res.send(transactions);
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
}

export async function postTransactions(req, res) {
  const user = res.locals.user;
  const { date: date, value: value, description: description, type: type } = req.body

  const createSchema = joi.object({
    value: joi.number().required(),
    description: joi.string().required(),
  });

  const validation = createSchema.validate(
    { value: value, description: description },
    { abortEarly: true }
  );

  if (validation.error) {
    return res.sendStatus(422);
  }

  try {
    await db.collection(`transactions_${user.userid}`).insertOne({
      date: date,
      value: value,
      description: description,
      type: type
    });
    return res.sendStatus(201);
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
}

export async function deleteTransactions(req, res) {
  const user = res.locals.user;
  const { id } = req.params;
  const toDelete = { _id: new ObjectId(id) }

  try {
    await db.collection(`transactions_${user.userid}`).deleteOne(toDelete)
    return res.sendStatus(200);
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
}

export async function updateTransactions(req, res) {
  const user = res.locals.user;
  const { id } = req.params;
  const toUpdate = { _id: new ObjectId(id) }
  
  const { value: value, description: description } = req.body

  const updateSchema = joi.object({
    value: joi.number().required(),
    description: joi.string().required(),
  });

  const validation = updateSchema.validate(
    { value: value, description: description },
    { abortEarly: true }
  );

  if (validation.error) {
    return res.sendStatus(422);
  }

  try {
    const transaction = await db.collection(`transactions_${user.userid}`).findOne({ _id: new ObjectId(id) })
		if (!transaction) {
			res.sendStatus(404);
		}
    await db.collection(`transactions_${user.userid}`).updateOne(toUpdate, { $set:{"value": req.body.value, "description": req.body.description} });
    return res.sendStatus(200);
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
}
