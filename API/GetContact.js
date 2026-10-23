const { connectDb } = require("../connection");

const GetContacts = async (req, res) => {
  try {
    const db = await connectDb();
    const collection = db.collection("ContactInquiries");
    const contact_data = await collection.find({}).sort({ createdAt: -1 }).toArray();
    return res.status(200).send({success: true, contacts: contact_data});
  } catch (e) {
    return res.status(500).send({success: false, message: "Internal Server Error"});
  }
};

module.exports = { GetContacts };