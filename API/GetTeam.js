const { connectDb } = require("../connection");

const GetTeam = async (req, res) => {
  try {
    const db = await connectDb();
    const collection = db.collection("team");
    const team_data = await collection.find({ status: "Active" }).toArray();
    return res.status(200).send({success: true, team: team_data});
  } catch (e) {
    return res.status(500).send({success: false, message: "Internal Server Error"});
  }
};

module.exports = { GetTeam };
