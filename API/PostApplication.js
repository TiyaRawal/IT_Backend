const { connectDb } = require("../connection");
const MAX_RESUME_SIZE = 5 * 1024 * 1024;
const allowedTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];

const PostApplication = async (req, res) => {
  try {
    const {fullName, email, phone, experience, position, portfolio, coverLetter, resume} = req.body;
    if (!fullName || !email || !phone || !experience || !position || !resume?.data || !resume?.filename || !resume?.contentType) 
    {
      return res.status(400).json({success: false, message: "Please fill all required fields and upload your resume."});
    }

    if (!allowedTypes.includes(resume.contentType)) {
      return res.status(400).json({success: false, message: "Only PDF, DOC and DOCX resumes are allowed."});
    }
    const resumeBuffer = Buffer.from(resume.data, "base64");

    if (
      resumeBuffer.length > MAX_RESUME_SIZE || resumeBuffer.length === 0 || resumeBuffer.toString("base64") !== resume.data
    ) {
      return res.status(400).json({success: false, message: "Resume must be a valid file under 5 MB."});
    }

    const isPdf = resume.contentType === "application/pdf" && resumeBuffer.subarray(0, 5).toString() === "%PDF-";
    const isDoc = resume.contentType === "application/msword" && resumeBuffer.subarray(0, 8).toString("hex") === "d0cf11e0a1b11ae1";
    const isDocx = resume.contentType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" && resumeBuffer.subarray(0, 4).toString("hex") === "504b0304";

    if (!isPdf && !isDoc && !isDocx) {
      return res.status(400).json({success: false, message: "The uploaded file does not match its file type."});
    }
    const db = await connectDb();

    const application = {
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      experience,
      position: position.trim(),
      portfolio: portfolio || "",
      coverLetter: coverLetter || "",
      resume: {
        filename: resume.filename,
        contentType: resume.contentType,
        size: resumeBuffer.length,
        data: resume.data,
      },
      status: "Pending",
      createdAt: new Date(),
    };

    const result = await db.collection("JobApplications").insertOne(application);
    return res.status(201).json({success: true, message: "Your application has been submitted successfully!", applicationId: result.insertedId});
  } catch (error) {
    return res.status(500).json({success: false, message: "Unable to submit your application. Please try again."});
  }
};

module.exports = { PostApplication };
