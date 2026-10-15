const { connectDb } = require("../connection");

let GetCapabilities = async (req, res) => {
  try {
    let db = await connectDb();
    let collection = db.collection("capabilities");
    let capabilities = await collection.find({ status: "Active" }).toArray();
    return res.status(200).send({success: true, capabilities});
  } catch (e) {
    return res.status(500).send({success: false, message: "Internal Server Error"});
  }
};

module.exports = { GetCapabilities };