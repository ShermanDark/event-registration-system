// Maneja usuarios
class User {
  constructor(id, name, email, password, events = []) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.password = password;
    this.events = events;
  }

  static getAll() {
    return JSON.parse(localStorage.getItem("users")) || [];
  }

  save() {
    const users = User.getAll();
    const index = users.findIndex((u) => u.id === this.id);
    if (index !== -1) users[index] = this;
    else users.push(this);
    localStorage.setItem("users", JSON.stringify(users));
  }

  static findByEmail(email) {
    const users = User.getAll();
    return users.find((u) => u.email === email);
  }

  static login(email, password) {
    const user = User.findByEmail(email);
    if (user && user.password === password) {
      localStorage.setItem("currentUser", JSON.stringify(user));
      return user;
    }
    return null;
  }

  static logout() {
    localStorage.removeItem("currentUser");
  }

  static getCurrent() {
    return JSON.parse(localStorage.getItem("currentUser"));
  }

  inscribeEvent(eventId) {
    if (!this.events.includes(eventId)) {
      this.events.push(eventId);
      this.save();
      localStorage.setItem("currentUser", JSON.stringify(this));
      return true;
    }
    return false;
  }

  removeEvent(eventId) {
    this.events = this.events.filter((id) => id !== eventId);
    this.save();
    localStorage.setItem("currentUser", JSON.stringify(this));
  }
}

// Maneja eventos
class Event {
  constructor(id, title, description, image) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.image = image;
  }

  static getAll() {
    return JSON.parse(localStorage.getItem("events")) || [];
  }

  displayCard(user) {
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `
            <img src="${this.image}" alt="${this.title}" />
            <h3>${this.title}</h3>
            <p>${this.description}</p>
            <button class="btn-ticket" data-id="${this.id}">
                ${
                  user && user.events.includes(this.id)
                    ? "Inscrito"
                    : "Obtener Ticket"
                }
            </button>
        `;
    return card;
  }
}

// Maneja sesión y navbar dinámico
class AuthManager {
  static updateNav() {
    const loginLink = document.getElementById("login-link");
    const currentUser = User.getCurrent();
    if (loginLink) {
      if (currentUser) {
        loginLink.textContent = "Cerrar sesión";
        loginLink.href = "#";
        loginLink.addEventListener("click", (e) => {
          e.preventDefault();
          User.logout();
          location.reload();
        });
      } else {
        loginLink.textContent = "Iniciar sesión";
        loginLink.href = "login.html";
      }
    }
  }
}
