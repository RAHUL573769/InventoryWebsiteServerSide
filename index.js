const express = require("express");
const jsonwebtoken = require("jsonwebtoken");
const cors = require("cors");
const app = express();
app.use(express.json());
app.use(cors());
const port = process.env.PORT || 5000;
require("dotenv").config();

const {
  MongoClient,
  ServerApiVersion,
  ObjectId,
  ObjectID,
} = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.v5ddd.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    const inventorycollection = client
      .db("inventorydatabase")
      .collection("inventory");

    app.get("/inventory", async (req, res) => {
      const query = {};
      const cursor = inventorycollection.find(query);
      const information = await cursor.toArray();
      res.send(information);
    });

    //-------------------------------------------- start of restocking;
    app.put("/inventory/:id", async (req, res) => {
      const id = req.params.id;
      const updatedUser = req.body;

      const filter = {
        _id: ObjectId(id),
      };
      const options = {
        upsert: true,
      };
      const updateDoc = {
        $set: {
          Quantity: updatedUser.finalValue,
        },
      };
      // (updateDoc);
      const result = await inventorycollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });
    //-------------------------------------------- end of restocking;

    // --------------------start of jwt authorization
    app.post("/login", async (req, res) => {
      const user = req.body;
      const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1d",
      });

      res.send({ accessToken });
    });
    //------------------------------------ end of jwt authorization

    app.get("/inventory/:id", async (req, res) => {
      const id = req.params.id;
      id;
      const query = {
        _id: ObjectId(id),
      };
      const result = await inventorycollection.findOne(query);
      res.send(result);
    });
    app.post("/inventory", async (req, res) => {
      const newInventory = req.body;
      const result = await inventorycollection.insertOne(newInventory);
      res.send(result);
    });

    //-------------------------start of delete-----------------------------
    app.delete("/inventory/:id", async (req, res) => {
      const id = req.params.id;
      id;
      const query = {
        _id: ObjectId(id),
      };
      const result = await inventorycollection.deleteOne(query);
      res.send(result);
    });

    //--------------end of delete----------------------
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(port, () => {
  console.log("Code is Fine");
});
