const { ObjectId } = require("mongodb");
const { connectDb } = require("../connection");

const GetServiceDetails = async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).send({success: false, message: "Invalid Service ID"});
    }
    const db = await connectDb();
    const service = await db.collection("services").findOne({_id: ObjectId.createFromHexString(id), status: "Active"});
    if (!service) {
      return res.status(404).send({success: false, message: "Service Not Found"});
    }
    return res.status(200).send({success: true, service});
  } catch (error) {
    return res.status(500).send({success: false, message: "Internal Server Error"});
  }
};

module.exports = { GetServiceDetails };