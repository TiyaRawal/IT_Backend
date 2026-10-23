const { ObjectId } = require("mongodb");
const { connectDb } = require("../connection");

const GetBlogDetail = async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({success: false, message: "Invalid blog ID"});
    }
    
    const db = await connectDb();
    const blog = await db.collection("blogs").findOne({_id: new ObjectId(id), status: "Active"});
    if (!blog) {
      return res.status(404).json({success: false, message: "Blog article not found"});
    }
    return res.status(200).json({success: true, blog});
  } catch (error) {
    return res.status(500).json({success: false, message: "Failed to fetch blog article"});
  }
};

module.exports = { GetBlogDetail };