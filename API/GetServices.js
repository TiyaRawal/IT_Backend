const { connectDb } = require("../connection");

let GetServices = async (req, res) => {
  try {
    let db = await connectDb();
    let collection = db.collection("services");
    let service_data = await collection.find({ status: "Active" }).toArray();
    if (!service_data) {
      return res.status(404).send({success: false, message: "Services Not Found"});
    } else {
      return res.status(200).send({ success: true, services: service_data});
    }
  } catch (e) {
    return res.status(500).send({sucess: false, message: "Internal Server Error"});
  }
};

module.exports = { GetServices };