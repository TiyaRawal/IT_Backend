const { connectDb } = require("../connection");

const GetBlogs = async (req, res) => {
  try {
    const db = await connectDb();
    const blogs = await db.collection("blogs").find({ status: "Active" }).sort({ createdAt: -1 }).toArray();
    return res.status(200).json({success: true, blogs});
  } catch (error) {
    return res.status(500).json({success: false, message: "Failed to fetch blog articles"});
  }
};

module.exports = { GetBlogs };