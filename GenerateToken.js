require("dotenv").config();

const http = require("http");
const { google } = require("googleapis");

const PORT = 3000;
const REDIRECT_URI = `http://localhost:${PORT}/oauth2callback`;

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  REDIRECT_URI,
);

async function main() {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    throw new Error("Google Client ID or Client Secret is missing.");
  }

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: ["https://www.googleapis.com/auth/gmail.send"],
  });

  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, REDIRECT_URI);

    if (url.pathname !== "/oauth2callback") {
      res.writeHead(404);
      return res.end("Not found");
    }

    const code = url.searchParams.get("code");
    const error = url.searchParams.get("error");

    if (error || !code) {
      res.writeHead(400);
      res.end(
        "Google authorization was not completed. You can close this tab.",
      );
      server.close();
      return;
    }

    try {
      const { tokens } = await oauth2Client.getToken(code);

      if (!tokens.refresh_token) {
        throw new Error(
          "No refresh token returned. Revoke the app's access in your Google Account and run this script again.",
        );
      }

      console.log("\nYour refresh token (keep it secret):\n");
      console.log(tokens.refresh_token);

      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(
        "<h2>Gmail authorization successful!</h2><p>You can close this tab and return to your terminal.</p>",
      );

      server.close();
    } catch (err) {
      console.error("Token generation failed:", err.message);
      res.writeHead(500);
      res.end("Token generation failed. Check your terminal.");
      server.close();
    }
  });

  server.listen(PORT, "localhost", () => {
    console.log("Open this URL in your browser:\n");
    console.log(authUrl);
    console.log("\nWaiting for Google authorization...");
  });
}

main().catch(console.error);