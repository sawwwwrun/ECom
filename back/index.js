const express = require("express");
const { Client } = require("@elastic/elasticsearch");
const mysql = require("mysql2");
const compromise = require("compromise");
const cors = require("cors");
const fs = require('fs')
const app = express();
app.use(express.json());
app.use(cors());

const client = new Client({
  node: `http://${process.env.ELASTICSEARCH_HOST? process.env.ELASTICSEARCH_HOST : "localhost" }:9200`,
  // auth: {
  //       username: "elastic",
  //       password: "tjsXLOv-+VGPhJVk35+b"
  //   },
  //   ssl: {
  //     rejectUnauthorized: false // Set to false if using self-signed certificate
  // }
// Update Elasticsearch node to match the service name in docker-compose.yml
});

// MySQL database connection configuration
const connection = mysql.createConnection({
  host: process.env.MYSQL_HOST || "localhost", // Update MySQL host to match the service name in docker-compose.yml
  user: process.env.MYSQL_USER || "saran", // Update MySQL user
  password: process.env.MYSQL_PASSWORD || "Saran@2002", // Update MySQL password
  database: process.env.MYSQL_DATABASE||"local_db", // Update MySQL database name
});

// Connect to MySQL
connection.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL: " + err.stack);
    return;
  }
  console.log("Connected to MySQL as id " + connection.threadId);
});

// Define a route to fetch data from the first table
app.get("/Category", (req, res) => {
  connection.query("SELECT * FROM Category", (err, rows) => {
    if (err) {
      console.error("Error executing MySQL query: " + err.stack);
      res.status(500).send("Error fetching data from MySQL");
      return;
    }
    res.json(rows);
  });
});


app.get("/search", async (req, res) => {
  let { query } = req.query;
  let rng = 'lte';
  let discountPrice;
  discountPrice = query.match(/\d+/);
  discountPrice = discountPrice ? parseInt(discountPrice[0]) : null;
  if(query.includes('under') || (query.includes('below')) || (query.includes('less than')) || (query.includes('lesser than'))){
    rng = 'lte';
  }

  function GTELTE(srch) {
    if(srch.includes('under') || srch.includes('below') || srch.includes('lesser than') || srch.includes('less than')){
      return {
        range: {
          discountPrice: {
            lte: discountPrice
          }
        }
      }
    }else{
      return {
        range: {
          discountPrice: {
            gte: discountPrice
          }
        }
      }
    }
  }

  try {
    const body = await client.search({
      index: "products_index",
      body: {
        query: {
          bool: {
            must: [
              {
                bool: {
                  should: [
                    {
                      multi_match: {
                        query: query,
                        fields: ["name^2", "brand^3","catName"],
                        //type: "cross_fields" 
                      },
                    },
                  ],
                },
              },
            ],
            filter: [GTELTE(query)]
          },
        },
      },
    });
        console.log(body?.hits?.hits);
        res.json(body?.hits?.hits);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message ? error.message : "Es error" });
  }
});


app.get("/Products/:id?", (req, res) => {
  const { id } = req.params;
  const query = "SELECT * FROM Products" + (id ? " WHERE CatID = " + id : "");
  connection.query(query, (err, rows) => {
    if (err) {
      console.error("Error executing MySQL query: " + err.stack);
      res.status(500).send("Error fetching data from MySQL");
    }
    res.json(rows);
  });
});

const PORT = 5000; // Update the port to match the exposed port in docker-compose.yml for the backend service
app.listen(PORT, () => {
  console.log("Server is running on http://localhost:" + PORT);
});
