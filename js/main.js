document.addEventListener("DOMContentLoaded", () => {
  AuthManager.updateNav();

  const registerForm = document.getElementById("register-form");
  if (registerForm) {
    registerForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = registerForm.name.value.trim();
      const email = registerForm.email.value.trim();
      const password = registerForm.password.value;
      const confirm = registerForm["confirm-password"].value;

      if (!validateName(name)) return alert("Nombre inválido");
      if (!validateEmail(email)) return alert("Email inválido");
      if (!validatePassword(password))
        return alert("Contraseña mínima 8 caracteres");
      if (password !== confirm) return alert("Las contraseñas no coinciden");
      if (User.findByEmail(email)) return alert("Usuario ya registrado");

      const user = new User(generateId(), name, email, password);
      user.save();
      alert("Registro exitoso!");
      registerForm.reset();
      location.href = "login.html";
    });
  }

  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = loginForm.email.value.trim();
      const password = loginForm.password.value;
      const user = User.login(email, password);
      if (user) {
        alert(`Bienvenido ${user.name}`);
        location.href = "eventos.html";
      } else {
        alert("Email o contraseña incorrecta");
      }
    });
  }

  // Página eventos
  const eventsContainer = document.getElementById("mis-eventos");
  const currentUser = User.getCurrent();
  if (eventsContainer) {
    Event.getAll().forEach((ev) => {
      const eventObj = new Event(ev.id, ev.title, ev.description, ev.image);
      const card = eventObj.displayCard(currentUser);
      const btn = card.querySelector("button");
      btn.addEventListener("click", () => {
        if (!currentUser) return (location.href = "login.html");
        if (currentUser.events.includes(ev.id)) {
          currentUser.removeEvent(ev.id);
          btn.textContent = "Obtener Ticket";
        } else {
          currentUser.inscribeEvent(ev.id);
          btn.textContent = "Inscrito";
        }
      });
      eventsContainer.appendChild(card);
    });
  }
});
