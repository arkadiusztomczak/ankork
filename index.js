const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://arkadiusz4083:9l4gLF8bQ0w2yyU6@cluster0.hk6lsbb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const app = express();
const port = 3000;

const upload = multer({ dest: 'uploads/' });

const client = new MongoClient(uri);

async function searchMovies(vector) {
  try {
    await client.connect();
    const database = client.db('sample_mflix');
    const collection = database.collection('embedded_movies');

    const pipeline = [
      {
        $vectorSearch: {
          index: "vector_index",
          path: "plot_embedding",
          queryVector: vector,
          numCandidates: 200,
          limit: 10
        }
      },
      {
        $project: {
          title: 1,
          plot: 1,
          score: { $meta: "vectorSearchScore" }
        }
      }
    ];

    const results = await collection.aggregate(pipeline).toArray();
    return results;
  } finally {
    await client.close();
  }
}

async function getOldestMovies(limit) {
  try {
    await client.connect();
    const database = client.db('sample_mflix');
    const collection = database.collection('embedded_movies');

    const query = { year: { $lt: 1950 } };
    const projection = { title: 1, plot: 1, year: 1 };

    const results = await collection.find(query).project(projection).limit(limit).toArray();
    return results;
  } finally {
    await client.close();
  }
}

app.get('/oldest/:count', async (req, res) => {
  const count = parseInt(req.params.count, 10);

  if (isNaN(count) || count <= 0) {
    res.status(400).send('Invalid count parameter');
    return;
  }

    const results = await getOldestMovies(count);
    res.json(results);

});

app.post('/upload', upload.single('file'), (req, res) => {

    const filePath = path.join(__dirname, req.file.path);

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      return res.status(500).send('Error reading file.');
    }

    let vector;

    try {
      vector = JSON.parse(data);
      if (!Array.isArray(vector) || vector.length === 0) {
        throw new Error('Invalid vector format');
      }
    } catch (parseError) {
      return res.status(400).send('Invalid vector format');
    }

    searchMovies(vector).then(results => {
      fs.unlink(filePath);
      res.json(results);
      
    }).catch(err => {
      console.error('Error during search:', err);
      res.status(500).send('Error during search.');
    });
  });
});


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
