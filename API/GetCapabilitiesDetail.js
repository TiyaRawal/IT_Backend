const { ObjectId } = require("mongodb");
const { connectDb } = require("../connection");

let GetCapabilityDetails = async (req, res) => {
  try {
    let { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).send({success: false, message: "Invalid Capability ID"});
    }

    let db = await connectDb();
    let collection = db.collection("capabilities");
    let capabilitydetails = await collection.findOne({_id: ObjectId.createFromHexString(id), status: "Active"});

    if (!capabilitydetails) {
      return res.status(404).send({success: false, message: "Capability Not Found"});
    } else {
      return res.status(200).send({success: true, capability: capabilitydetails});
    }
  } catch (e) {
    return res.status(500).send({success: false, message: "Internal Server Error"});
  }
};

module.exports = { GetCapabilityDetails };