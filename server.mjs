import * as path from "path";
import fs from "fs";
import express from "express";
import https from "https";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import fetch from "node-fetch";

const rootDir = process.cwd();
const port = 3000;
const app = express();

app.use(express.static(path.join(rootDir, "spa/build")));
app.use(cookieParser());

app.get("/client.mjs", (_, res) => {
  res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
  res.sendFile(path.join(rootDir, "client.mjs"), {
    maxAge: -1,
    cacheControl: false,
  });
});

app.post("/api/login", express.json(), (req, res) => {
  const { username } = req.body;
  if (!username) {
    res.status(400).json({ error: "Username is required" });
  } else {
    res.cookie("username", username);
    res.json({ username });
  }
});

app.post("/api/logout", (req, res) => {
  res.clearCookie("username");
  res.json({ message: "User logged out successfully" });
});

app.get("/api/user", (req, res) => {
  const username = req.cookies.username;
  res.json({ username });
});

app.get("/*", (_, res) => {
  res.sendFile(path.join(rootDir, "spa/build/index.html"));
});


const options = {
  key: fs.readFileSync("certs/server.key"),
  cert: fs.readFileSync("certs/server.cert"),
};

https.createServer(options, app).listen(port, () => {
  console.log(`App listening on port ${port} over HTTPS`);
});