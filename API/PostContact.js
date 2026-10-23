const { connectDb } = require("../connection");
const { google } = require("googleapis");

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
);

oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

const gmail = google.gmail({
  version: "v1",
  auth: oauth2Client,
});

const escapeHtml = (value = "") => {
  const entities = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };

  return String(value).replace(/[&<>"']/g, (char) => entities[char]);
};

const encodeSubject = (subject) =>
  `=?UTF-8?B?${Buffer.from(subject, "utf8").toString("base64")}?=`;

const encodeEmail = ({ from, to, subject, text, html }) => {
  const boundary = `boundary_${Date.now()}`;

  const message = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${encodeSubject(subject)}`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    "",
    `--${boundary}`,
    'Content-Type: text/plain; charset="UTF-8"',
    "Content-Transfer-Encoding: base64",
    "",
    Buffer.from(text, "utf8").toString("base64"),
    `--${boundary}`,
    'Content-Type: text/html; charset="UTF-8"',
    "Content-Transfer-Encoding: base64",
    "",
    Buffer.from(html, "utf8").toString("base64"),
    `--${boundary}--`,
  ].join("\r\n");

  return Buffer.from(message)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
};

const PostContact = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body || {};

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof subject !== "string" ||
      typeof message !== "string" ||
      (phone != null && typeof phone !== "string")
    ) {
      return res.status(400).send({
        success: false,
        message: "Please provide valid contact details.",
      });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = (phone || "").trim();
    const cleanSubject = subject.trim();
    const cleanMessage = message.trim();

    if (!cleanName || !cleanEmail || !cleanSubject || !cleanMessage) {
      return res.status(400).send({
        success: false,
        message: "Please fill in all required fields.",
      });
    }

    if (
      cleanName.length > 100 ||
      cleanEmail.length > 254 ||
      cleanPhone.length > 30 ||
      cleanSubject.length > 200 ||
      cleanMessage.length > 5000
    ) {
      return res.status(400).send({
        success: false,
        message: "One or more fields exceed the allowed length.",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).send({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    const db = await connectDb();
    const collection = db.collection("ContactInquiries");

    const contactData = {
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      subject: cleanSubject,
      message: cleanMessage,
      status: "New",
      emailSent: false,
      createdAt: new Date(),
    };

    const result = await collection.insertOne(contactData);
    let emailSent = false;

    try {
      if (
        !process.env.GOOGLE_CLIENT_ID ||
        !process.env.GOOGLE_CLIENT_SECRET ||
        !process.env.GOOGLE_REFRESH_TOKEN ||
        !process.env.EMAIL_USER
      ) {
        throw new Error(
          "Required Gmail API environment variables are missing.",
        );
      }

      const from = process.env.EMAIL_USER.trim();

      const text = `Hello ${cleanName},

Thank you for contacting IT Company.
Your response has been recorded successfully.
Our team will get in touch with you soon.

Subject: ${cleanSubject}

Regards,
IT Company Team`;

      const html = `
        <div style="font-family: Arial, sans-serif; line-height: 1.7; color: #333; max-width: 600px; margin: auto;">
          <h2 style="color: #337AB7;">Thank You for Contacting Us!</h2>
          <p>Hello ${escapeHtml(cleanName)},</p>
          <p>Your response has been recorded successfully.
          Our team will review your inquiry and get in touch with you soon.</p>
          <p><strong>Subject:</strong> ${escapeHtml(cleanSubject)}</p>
          <p>Regards,<br /><strong>IT Company Team</strong></p>
        </div>`;

      const raw = encodeEmail({
        from,
        to: cleanEmail,
        subject: "Thank You for Contacting IT Company",
        text,
        html,
      });

      const emailResult = await gmail.users.messages.send({
        userId: "me",
        requestBody: { raw },
      });

      emailSent = Boolean(emailResult.data.id);
    } catch (emailError) {
      console.error(
        "Gmail API email sending failed:",
        emailError.response?.data || emailError.message,
      );
    }

    await collection.updateOne(
      { _id: result.insertedId },
      { $set: { emailSent } },
    );

    return res.status(201).send({
      success: true,
      emailSent,
      message: emailSent
        ? "Your response has been recorded successfully. Our team will get in touch with you soon. A confirmation email has been sent."
        : "Your response has been recorded successfully, but the confirmation email could not be sent. Please check your email configuration.",
      contactId: result.insertedId,
    });
  } catch (e) {
    console.error("Contact submission failed:", e.message);

    return res.status(500).send({
      success: false,
      message: "Unable to submit your message right now. Please try again.",
    });
  }
};

module.exports = { PostContact };