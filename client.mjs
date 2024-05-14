

export class Client {
  constructor() {
    this.username = null;
  }

  async getUser() {
    return this.username;
  }

  async loginUser(username) {
    this.username = username;
    return this.username;
  }

  async logoutUser() {
    this.username = null;
  }

  // Добавляем middleware для разбора JSON-тела запроса
  handleJSON() {
    return express.json();
  }

  // Метод для инициализации маршрутов API
  initRoutes(app) {
    // Маршрут для получения информации о пользователе
    app.get("/api/user", async (req, res) => {
      try {
        const user = await this.getUser();
        res.json({ username: user });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Маршрут для логина пользователя
    app.post("/api/login", this.handleJSON(), async (req, res) => {
      try {
        const { username } = req.body;
        const loggedInUser = await this.loginUser(username);
        res.json({ username: loggedInUser });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Маршрут для логаута пользователя
    app.post("/api/logout", async (req, res) => {
      try {
        await this.logoutUser();
        res.json({ message: "User logged out successfully" });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
  }
}
