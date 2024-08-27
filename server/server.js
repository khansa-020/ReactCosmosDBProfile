// server.js
const express = require('express');
const { CosmosClient } = require('@azure/cosmos');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Cosmos Client
const client = new CosmosClient(process.env.COSMOS_DB_CONNECTION_STRING);

async function connectToDatabase() {
  try {
    // Test connection by reading a list of databases
    const response = await client.databases.readAll().fetchAll();

    if (response && response.databases) {
      console.log('Connected to Cosmos DB successfully. Available databases:', response.databases.map(db => db.id));
    } else {
      console.error('Connected to Cosmos DB, but no databases were found.');
    }
  } catch (error) {
    console.error('Error connecting to Cosmos DB:', error.message);
    process.exit(1); // Exit the application if the connection fails
  }
}

connectToDatabase();

const database = client.database('SampleDB');
const container = database.container('SampleCollection');

// API route to fetch user data by ID
app.get('/api/user/:id', async (req, res) => {
  const userId = req.params.id;
  try {
    const { resource: user } = await container.item(userId, userId).read();
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json(user);
  } catch (err) {
    console.error('Error fetching user:', err.message);
    res.status(500).json({ error: 'An error occurred while fetching the user' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
