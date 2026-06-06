const express = require("express");
const { MongoClient } = require("mongodb");

const app = express();
const PORT = process.env.PORT || 3000;

const uri = process.env.MONGODB_URI;

app.get("/", async (req, res) => {
  let client;

  try {
    client = new MongoClient(uri);
    await client.connect();

    const db = client.db("trx_wingo");
    const collection = db.collection("gameresults");

    const totalData = await collection.countDocuments();

    const totalBig = await collection.countDocuments({
      outcome: "B"
    });

    const totalSmall = await collection.countDocuments({
      outcome: "S"
    });

    const latest = await collection.findOne(
      {},
      {
        sort: { createdAt: -1 }
      }
    );

    const results = await collection
      .find({})
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    res.json({
      status: true,
      total_data: totalData,
      total_big: totalBig,
      total_small: totalSmall,
      current_pattern: latest?.runningPattern || "No Pattern",
      server_time: new Date().toISOString(),
      results: results.map(item => ({
        issueNumber: item.issueNumber,
        number: item.number,
        color: item.color,
        outcome: item.outcome,
        runningPattern: item.runningPattern,
        createdAt: item.createdAt
      })),
      made_by: "@kal_mods"
    });

  } catch (err) {

    res.status(500).json({
      status: false,
      error: err.message
    });

  } finally {

    if (client) {
      await client.close();
    }

  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`API Running On Port ${PORT}`);
});
