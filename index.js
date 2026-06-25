const express = require("express");
const app = express();
const dotenv = require("dotenv");
const cors = require("cors");
dotenv.config();
const PORT = process.env.PORT;

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

app.use(cors());
app.use(express.json());

const uri = process.env.DATABASE_NAME;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    //await client.connect();
    // Send a ping to confirm a successful connection
    //await client.db("admin").command({ ping: 1 });

    const db = client.db("Assignment-10");
    const lawyersCollection = db.collection("lawyers");
    const usersCollection = db.collection("user");
    const lawyerApplicationCollection = db.collection("applications");

    //User Related Api
    app.get("/api/user/:id", async (req, res) => {
      const { id } = req.params;
      const query = { _id: new ObjectId(id) };
      const result = await usersCollection.findOne(query);
      res.send(result);
    });
    app.patch("/api/user/:id", async (req, res) => {
      const { id } = req.params;
      console.log(id);
      const updateData = req.body;
      const result = await usersCollection.updateOne(
        { _id: new ObjectId(id) },
        {
          $set: updateData,
        },
      );
      res.send(result);
    });
    app.get("/api/user", async (req, res) => {
      const id = req.body;
      //const _id = { _id: new ObjectId(id) };
      const result = await usersCollection.find(id).toArray();
      res.send(result);
    });

    app.get("/api/lawyer", async (req, res) => {
      const search = req.query.search;
      const specialization = req.query.specialization;
      const location = req.query.location;
      const query = {};
      if (search) {
        query.name = {
          $regex: search,
          $options: "i",
        };
      }
      if (specialization) {
        query.specialization = { $in: specialization.split(",") };
      }
      if (location) {
        query.location = location;
      }
      const result = await lawyersCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/api/single-lawyer/:id", async (req, res) => {
      const { id } = req.params;
      const query = { _id: new ObjectId(id) };
      const result = await lawyersCollection.findOne(query);
      res.send(result);
    });

    app.patch("/api/lawyer/:id", async (req, res) => {
      const { id } = req.params;

      const updateData = req.body;
      const result = await lawyersCollection.updateOne(
        { _id: new ObjectId(id) },
        {
          $set: updateData,
        },
      );
      res.send(result);
    });
    app.get("/api/lawyer/:email", async (req, res) => {
      const { email } = req.params;
      console.log(email);
      const result = await lawyersCollection.findOne({ email: email });
      res.send(result);
    });

    app.post("/api/lawyer", async (req, res) => {
      const data = req.body;

      const result = await lawyersCollection.insertOne({
        ...data,
        status: "pending",
      });
      res.send(result);
    });

    //Application related api
    app.post("/api/application", async (req, res) => {
      const application = req.body;
      const result = await lawyerApplicationCollection.insertOne(application);
      res.send(result);
    });

    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!",
    );
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Server is running");
});
app.listen(PORT, (req, res) => {
  console.log(`Server running on port ${PORT}`);
});
