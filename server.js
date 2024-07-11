const express = require("express");
const bodyParser = require("body-parser");
const { Client } = require("@elastic/elasticsearch");
const morgan = require("morgan");
const cors = require("cors");

const app = express();
const port = 3001;

const client = new Client({ node: "http://localhost:9200" });

app.use(cors());
app.use(bodyParser.json());
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.send("Elasticsearch with Node.js and React");
});

app.post("/index", async (req, res) => {
  const { index, id, body } = req.body;
  try {
    const response = await client.index({
      index,
      id,
      body,
    });

    // Log the Elasticsearch response for debugging purposes
    console.log("Elasticsearch Response:", response);

    // Extract relevant information from the Elasticsearch response
    const { _index, _id, result, _version } = response.body;

    // Construct a simplified response to return to the client
    const responseData = {
      index: _index,
      id: _id,
      result,
      version: _version,
    };

    // Send the simplified response back to the client
    res.json(responseData);
  } catch (error) {
    console.error("Error indexing document:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET endpoint to perform Elasticsearch search
app.get("/search", async (req, res) => {
  const { index, q } = req.query;
  try {
    const response = await client.search({
      index,
      q,
    });

    // Extract hits from the Elasticsearch response and send them to the client
    res.json(response.body.hits.hits);
  } catch (error) {
    console.error("Error searching documents:", error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
