require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { connectDb } = require("./connection");
const { GetFAQ } = require("./API/GetFAQ");
const { GetServices } = require("./API/GetServices");
const { GetCareers } = require("./API/GetCareers");
const { GetTeam } = require("./API/GetTeam");
const { GetProjects } = require("./API/GetProjects");
const { GetReviews } = require("./API/GetReviews");
const { GetTechnologies } = require("./API/GetTechnologies");
const { GetCapabilities } = require("./API/GetCapabilities");
const { GetCapabilityDetails } = require("./API/GetCapabilitiesDetail");
const { GetServiceDetails } = require("./API/GetServiceDetails");
const { PostContact } = require("./API/PostContact");
const { GetContacts } = require("./API/GetContact");
const { PostApplication } = require("./API/PostApplication");
const app = express();
const port = process.env.PORT || 8000;


app.use(express.json());

app.use(
    cors({
        origin: [
            "http://localhost:5173",
            "http://localhost:5174",
            "https://it-frontend-m4y1.onrender.com"
        ],
        credentials: true
    })
);


app.get("/", (req, res) => {
    return res.status(200).send({success: true, message: "Welcome to IT Company Backend"});
});


app.get("/faqs", GetFAQ);
app.get("/services", GetServices);
app.get("/careers", GetCareers);
app.get("/team", GetTeam);
app.get("/projects", GetProjects);
app.get("/reviews", GetReviews);
app.get("/technologies", GetTechnologies);
app.get("/capabilities", GetCapabilities);
app.get("/capabilities/:id", GetCapabilityDetails);
app.get("/services/:id", GetServiceDetails);
app.post("/contact", PostContact);
app.get("/contact", GetContacts);
app.post("/apply", PostApplication);
 
connectDb()

app.listen(port, () => {
    console.log(`SERVER STARTED ON PORT ${port}`);
});