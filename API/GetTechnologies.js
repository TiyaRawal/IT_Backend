const { connectDb } = require("../connection");

const GetTechnologies = async (req, res) => {
  try {
    const db = await connectDb();
    const technologies = await db.collection("technologies").find({ status: "Active" }).toArray();
    return res.status(200).send({success: true, technologies: technologies});
  } catch (error) {
    return res.status(500).send({success: false, message: "Internal Server Error"});
  }
};

module.exports = { GetTechnologies };