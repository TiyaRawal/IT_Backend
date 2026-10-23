const { connectDb } = require("../connection");

const GetReviews = async (req, res) => {
  try {
    const db = await connectDb();
    const reviews = await db.collection("reviews").find({ status: "Active" }).toArray();
    return res.status(200).send({success: true, reviews: reviews});
  } catch (error) {
    return res.status(500).send({success: false, message: "Internal Server Error"});
  }
};

module.exports = { GetReviews };