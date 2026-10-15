const { connectDb } = require("../connection");

let GetCareers = async (req, res) => {
  try {
    let db = await connectDb();
    let collection = db.collection("careers");
    let career_data = await collection.find({ status: "Active" }).toArray();

    if (!career_data) {
      return res.status(404).send({success: false, message: "Careers Not Found"});
    } else {
      return res.status(200).send({success: true, careers: career_data});
    }
  } catch (e) {
    return res.status(500).send({success: false, message: "Internal Server Error"});
  }
};

module.exports = { GetCareers };