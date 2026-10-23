require("dotenv").config();
const { MongoClient } = require("mongodb");
const url = process.env.MONGODB_URL;

const connectDb = async () => {  const client = await MongoClient.connect(url);
  const db = client.db("ITWebsite");
  console.log("DATABASE CONNECTED");
  return db;
};

module.exports = { connectDb };