const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 3000;

//  middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.icyvogv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
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
    await client.connect();
    // database and collection
    const jobsCollection = client.db("Jop_portal").collection("jobs");
    const applicationCollectin = client
      .db("Jop_portal")
      .collection("applayList");

    app.get("/applications/job/:job_id", async(req,res)=>{
      const job_id= req.params.job_id;
      console.log(job_id)
      const  query = {jobId: job_id}
      const result = await applicationCollectin.find(query).toArray();
      res.send(result)
    });
    //  application applay api
    app.post("/applications", async (req, res) => {
      const application = req.body;
      const result = await applicationCollectin.insertOne(application);
      res.send(result);
    });

    // applicationList api
    app.get("/applications", async (req, res) => {
      const email = req.query.email;
      const query = { applicant: email };
      const result = await applicationCollectin.find(query).toArray();
      // bad way to aggregate data
      for (const application of result) {
        const jobId = application.jobId;
        const jobQuery = { _id: new ObjectId(jobId) };
        const job = await jobsCollection.findOne(jobQuery);
        application.company = job.company;
        application.title = job.title;
        application.company_logo = job.company_logo;
        application.jobType = job.jobType;
        application.status = job.status;
      }
      res.send(result);
    });
    //  jobs get api
    app.get("/jobs", async (req, res) => {
      const email = req.query.email;
      const query = {};
      if (email) {
        query.hr_email = email;
      }
      const cursor = jobsCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });
    //  jobs api specefiq
    app.get("/jobs/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await jobsCollection.findOne(query);
      res.send(result);
    });
    //  job post api
    app.post("/jobs", async (req, res) => {
      const jobsPost = req.body;
      const result = await jobsCollection.insertOne(jobsPost);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Server is Rouning");
});

app.listen(port, () => {
  console.log(`Server is rouning this port:${port}`);
});
