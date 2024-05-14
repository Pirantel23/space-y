

export class Client {
  constructor() {
    this.username = null;
  }

  async getUser() {
    const response = await fetch("/api/user", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    this.username = data.username;
    return this.username;
  }

  async loginUser(username) {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username }),
    });
    const data = await response.json();
    this.username = username;
    return this.username;
  }

  async logoutUser() {
    const response = await fetch("/api/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    this.username = null;
  }

  // Добавляем middleware для разбора JSON-тела запроса
  handleJSON() {
    return express.json();
  }
}
