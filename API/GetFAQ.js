const { connectDb } = require("../connection");

let GetFAQ = async (req, res) => {
  try {
    let db = await connectDb();
    let collection = db.collection("faqs");
    let faq_data = await collection.find({ status: "Active" }).toArray();
    if (!faq_data) {
      return res.status(404).send({success: false, message: "FAQ Not Found"});
    } else {
      return res.status(200).send({success: true, faq: faq_data});
    }
  } catch (e) {
    return res.status(500).send({sucess: false, message: "Internal Server Error"});
  }
};

module.exports = { GetFAQ };