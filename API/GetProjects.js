const { connectDb } = require("../connection");

const GetProjects = async (req, res) => {
  try {
    const db = await connectDb();
    const collection = db.collection("projects");
    const project_data = await collection.find({ status: "Active" }).toArray();
    return res.status(200).send({success: true, projects: project_data});
  } catch (e) {
    return res.status(500).send({success: false, message: "Internal Server Error"});
  }
};

module.exports = { GetProjects };