import { ObjectId } from "mongodb";

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
  try {
    await db.collection(`transactions_${user.userid}`).insertOne({
      date: req.body.date,
      value: req.body.value,
      description: req.body.description,
      type: req.body.type
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
