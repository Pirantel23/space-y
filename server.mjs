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

const fetchFromSpaceXAPI = async (endpoint) => {
  try {
    const response = await fetch(`https://api.spacexdata.com/v3/${endpoint}`);
    if (!response.ok) {
      throw new Error("Failed to fetch data from SpaceX API");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching data from SpaceX API:", error);
    throw error;
  }
};

app.get("/about", async (req, res) => {
  try {
    res.json(await fetchFromSpaceXAPI("info"));
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch company information" });
  }
});

app.get("/history", async (req, res) => {
  try {
    res.json(await fetchFromSpaceXAPI("history"));
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch history events" });
  }
});

// Маршрут для получения информации о всех ракетах
app.get("/rockets", async (req, res) => {
  try {
    res.json(await fetchFromSpaceXAPI("rockets"));
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch rockets information" });
  }
});

// Маршрут для получения информации о машине в космосе
app.get("/roadster", async (req, res) => {
  try {
    res.json(await fetchFromSpaceXAPI("roadster"));
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch Roadster information" });
  }
});

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
    res.cookie("username", username, {
      httpOnly: true,
      secure: true,
      sameSite: "strict"
    });
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

app.get("/*", (req, res) => {
  res.sendFile(path.join(rootDir, "spa/build/index.html"));
  if (!req.cookies.username && req.path !== "/login") {
    res.redirect("/login");
  }
});

const options = {
  key: fs.readFileSync("certs/server.key"),
  cert: fs.readFileSync("certs/server.cert"),
};

class MarsStorage {
  #items = [];
  #id = 0;

  constructor() {
  }

  send(item) {
    this.#items.push({
      ...item,
      id: this.#id++,
    });
  }

  cancel(id) {
    this.#items.splice(this.#items.indexOf(this.#items.find(item => item.id === id)), 1);
  }

  getDispatchedThings() {
    return this.#items.slice();
  }
}

const marsStorage = new MarsStorage();

app.get("api/list", (req, res) => {
  console.log(marsStorage.getDispatchedThings());
  res.json({
    items: marsStorage.getDispatchedThings(),
  });
});

app.post("api/send", express.json(), (req, res) => {
  marsStorage.send(req.body.item);
  res.json({
    items: marsStorage.getDispatchedThings(),
  });
});

app.post("api/cancel", express.json(), (req, res) => {
  marsStorage.cancel(req.body.id);
  res.json({
    items: marsStorage.getDispatchedThings(),
  });
});

https.createServer(options, app).listen(port, () => {
  console.log(`App listening on port ${port} over HTTPS`);
});