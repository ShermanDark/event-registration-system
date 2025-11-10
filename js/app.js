class Usuario {
  constructor(id, nombre, email) {
    this.id = id;
    this.nombre = nombre;
    this.email = email;
  }
  toJSON() {
    return { id: this.id, nombre: this.nombre, email: this.email };
  }
  saludo() {
    return `Bienvenido, ${this.nombre}`;
  }
}

class Cliente extends Usuario {
  #password;
  #eventosInscritos;
  constructor(id, nombre, email, password, eventosInscritos = []) {
    super(id, nombre, email);
    this.#password = password;
    this.#eventosInscritos = Array.isArray(eventosInscritos)
      ? eventosInscritos
      : [];
  }
  get eventosInscritos() {
    return [...this.#eventosInscritos];
  }
  save() {
    const clientes = Cliente.getAll();
    const idx = clientes.findIndex((c) => c.id === this.id);
    if (idx !== -1) clientes[idx] = this;
    else clientes.push(this);
    localStorage.setItem(
      "clientes",
      JSON.stringify(clientes.map((c) => c.toJSON()))
    );
  }
  toJSON() {
    return {
      ...super.toJSON(),
      password: this.#password,
      eventosInscritos: this.#eventosInscritos,
    };
  }
  static getAll() {
    const arr = JSON.parse(localStorage.getItem("clientes")) || [];
    return arr.map(
      (o) =>
        new Cliente(o.id, o.nombre, o.email, o.password, o.eventosInscritos)
    );
  }
  static findByEmail(email) {
    return Cliente.getAll().find((c) => c.email === email);
  }
  static login(email, password) {
    const c = Cliente.findByEmail(email);
    if (c && c.#password === password) {
      localStorage.setItem("clienteActual", JSON.stringify(c.toJSON()));
      return c;
    }
    throw new Error("Correo o contraseña incorrectos");
  }
  static logout() {
    localStorage.removeItem("clienteActual");
  }
  static getActual() {
    const obj = JSON.parse(localStorage.getItem("clienteActual"));
    return obj
      ? new Cliente(
          obj.id,
          obj.nombre,
          obj.email,
          obj.password,
          obj.eventosInscritos
        )
      : null;
  }
  inscribirEvento(eventoId) {
    if (!this.#eventosInscritos.includes(eventoId)) {
      this.#eventosInscritos.push(eventoId);
      this.save();
      localStorage.setItem("clienteActual", JSON.stringify(this.toJSON()));
    }
  }
  cancelarInscripcion(eventoId) {
    this.#eventosInscritos = this.#eventosInscritos.filter(
      (id) => id !== eventoId
    );
    this.save();
    localStorage.setItem("clienteActual", JSON.stringify(this.toJSON()));
  }
}

class Evento {
  constructor(id, nombre, fecha, ubicacion, categoria, tipo, detalle) {
    this.id = id;
    this.nombre = nombre;
    this.fecha = fecha;
    this.ubicacion = ubicacion;
    this.categoria = categoria;
    this.tipo = tipo;
    this.detalle = detalle;
  }
  descripcion() {
    return `${this.nombre} - ${this.fecha} - ${this.ubicacion}`;
  }
  toJSON() {
    return {
      id: this.id,
      nombre: this.nombre,
      fecha: this.fecha,
      ubicacion: this.ubicacion,
      categoria: this.categoria,
      tipo: this.tipo,
      detalle: this.detalle,
    };
  }
  static getAll() {
    const arr = JSON.parse(localStorage.getItem("eventos")) || [];
    return arr.map(
      (o) =>
        new Evento(
          o.id,
          o.nombre,
          o.fecha,
          o.ubicacion,
          o.categoria,
          o.tipo,
          o.detalle
        )
    );
  }
  save() {
    const eventos = Evento.getAll();
    const idx = eventos.findIndex((e) => e.id === this.id);
    if (idx !== -1) eventos[idx] = this;
    else eventos.push(this);
    localStorage.setItem(
      "eventos",
      JSON.stringify(eventos.map((e) => e.toJSON()))
    );
  }
}

class GestorEventos {
  static registrarCliente(nombre, email, password) {
    if (Cliente.findByEmail(email))
      throw new Error("El email ya está registrado.");
    const id = generateId();
    const c = new Cliente(id, nombre, email, password);
    c.save();
    localStorage.setItem("clienteActual", JSON.stringify(c.toJSON()));
    return c;
  }
  static cerrarSesion() {
    Cliente.logout();
  }
}

function getBasePath() {
  return window.location.pathname.includes("/pages/") ? "../" : "";
}

function inicializarEventosPredeterminados() {
  if (!localStorage.getItem("eventos")) {
    const eventos = [
      new Evento(
        "ev1",
        "Bootcamp JavaScript",
        "2025-11-20",
        "Online",
        "Programación",
        "online",
        "meet.com/js"
      ),
      new Evento(
        "ev2",
        "Bootcamp Python",
        "2025-11-22",
        "Online",
        "Programación",
        "online",
        "meet.com/python"
      ),
      new Evento(
        "ev3",
        "Bootcamp Power BI",
        "2025-11-25",
        "CDMX",
        "Datos",
        "presencial",
        "Sala 1"
      ),
      new Evento(
        "ev4",
        "Bootcamp SQL",
        "2025-11-28",
        "CDMX",
        "Datos",
        "presencial",
        "Sala 2"
      ),
      new Evento(
        "ev5",
        "Bootcamp POO",
        "2025-12-01",
        "Online",
        "Programación",
        "online",
        "meet.com/poo"
      ),
      new Evento(
        "ev6",
        "Bootcamp Excel Avanzado",
        "2025-12-05",
        "CDMX",
        "Datos",
        "presencial",
        "Sala 3"
      ),
    ];
    localStorage.setItem(
      "eventos",
      JSON.stringify(eventos.map((e) => e.toJSON()))
    );
  }
}

function renderizarEventos() {
  const container = document.getElementById("cards-container");
  if (!container) return;
  const cliente = Cliente.getActual();
  const eventos = Evento.getAll();
  const base = getBasePath();
  container.innerHTML = "";
  eventos.forEach((ev) => {
    const key = ev.nombre.toLowerCase().split(" ")[1] || "default";
    const imgSrc = `${base}img/${key}.webp`;
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `
      <img src="${imgSrc}" alt="${ev.nombre}">
      <h3>${ev.nombre}</h3>
      <p>${ev.descripcion()}</p>
      <button class="btn-ticket" data-id="${ev.id}">
        ${
          cliente && cliente.eventosInscritos.includes(ev.id)
            ? "Inscrito"
            : "Obtener Ticket"
        }
      </button>`;
    container.appendChild(card);
  });
}

function renderizarEventosInscritos() {
  const container = document.getElementById("mis-eventos");
  if (!container) return;

  const cliente = Cliente.getActual();

  if (!cliente) {
    container.innerHTML = `<p style="color:#ccc;">Inicia sesión para ver tus eventos inscritos.</p>`;
    return;
  }

  const eventos = Evento.getAll().filter((ev) =>
    cliente.eventosInscritos.includes(ev.id)
  );

  if (eventos.length === 0) {
    container.innerHTML = `<p style="color:#ccc;">No estás inscrito en ningún evento.</p>`;
    return;
  }

  const basePath = getBasePath();
  container.innerHTML = "";

  eventos.forEach((ev) => {
    const key = ev.nombre.toLowerCase().split(" ")[1] || "default";
    const imgSrc = `${basePath}img/${key}.webp`;

    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `
      <img src="${imgSrc}" alt="${ev.nombre}">
      <h3>${ev.nombre}</h3>
      <p>${ev.descripcion()}</p>
      <button class="btn-cancelar" data-id="${ev.id}" style="background:#b30000;">
        Cancelar inscripción
      </button>
    `;

    container.appendChild(card);

    const btnCancelar = card.querySelector(".btn-cancelar");
    btnCancelar.addEventListener("click", () => {
      cliente.cancelarInscripcion(ev.id);
      alert(`❌ Has cancelado tu inscripción en "${ev.nombre}".`);
      renderizarEventosInscritos();
    });
  });
}

function cerrarModales() {
  document
    .querySelectorAll(".modal")
    .forEach((m) => (m.style.display = "none"));
}

function inicializarFormularios() {
  const formRegistro = document.getElementById("form-registro");
  const formLogin = document.getElementById("form-login");

  if (formRegistro) {
    formRegistro.addEventListener("submit", (e) => {
      e.preventDefault();
      const nombre = formRegistro.nombre.value.trim();
      const email = formRegistro.email.value.trim();
      const password = formRegistro.password.value;
      const confirm = formRegistro["confirm-password"].value;
      if (!validateName(nombre))
        return alert(
          "⚠️ El nombre debe tener al menos 3 letras y no contener números."
        );
      if (!validateEmail(email))
        return alert("⚠️ Ingresa un correo electrónico válido.");
      if (!validatePassword(password))
        return alert(
          "⚠️ La contraseña debe tener al menos 8 caracteres, incluyendo una mayúscula, un número y un símbolo."
        );
      if (password !== confirm)
        return alert("⚠️ Las contraseñas no coinciden.");
      try {
        GestorEventos.registrarCliente(nombre, email, password);
        cerrarModales();
        actualizarNavbar();
        alert(`✅ Bienvenido, ${nombre}! Tu cuenta fue creada correctamente.`);
      } catch (err) {
        alert("❌ " + err.message);
      }
    });
  }

  if (formLogin) {
    formLogin.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = formLogin["login-email"].value.trim();
      const password = formLogin["login-password"].value;
      if (!validateEmail(email))
        return alert("⚠️ Ingresa un correo electrónico válido.");
      if (!password) return alert("⚠️ Ingresa tu contraseña.");
      try {
        Cliente.login(email, password);
        cerrarModales();
        actualizarNavbar();
        alert(`✅ Bienvenido, ${Cliente.getActual().nombre}!`);
      } catch {
        alert("❌ Usuario o contraseña incorrectos.");
      }
    });
  }
}

function instalarDelegados() {
  document.addEventListener("click", (e) => {
    const t = e.target;
    const nav = document.getElementById("nav-links");
    if (t.id === "menu-toggle") nav.classList.toggle("active");
    if (t.closest(".nav-links a")) nav.classList.remove("active");
    if (t.id === "modal-registro-link") {
      e.preventDefault();
      cerrarModales();
      document.getElementById("modal-registro").style.display = "flex";
    }
    if (t.id === "modal-login-link") {
      e.preventDefault();
      cerrarModales();
      document.getElementById("modal-login").style.display = "flex";
    }
    if (t.id === "close-modal-registro" || t.id === "close-modal-login") {
      const modal = t.closest(".modal");
      if (modal) modal.style.display = "none";
    }
    if (t.classList.contains("btn-ticket")) {
      const id = t.getAttribute("data-id");
      const user = Cliente.getActual();
      if (!user) {
        alert("⚠️ Debes iniciar sesión para obtener un ticket.");
        cerrarModales();
        document.getElementById("modal-login").style.display = "flex";
        return;
      }
      if (user.eventosInscritos.includes(id)) {
        user.cancelarInscripcion(id);
        t.textContent = "Obtener Ticket";
      } else {
        user.inscribirEvento(id);
        t.textContent = "Inscrito";
      }
    }
    if (t.id === "cerrar-sesion-link") {
      e.preventDefault();
      GestorEventos.cerrarSesion();
      alert("Sesión cerrada correctamente.");
      actualizarNavbar();
      window.location.href = `${getBasePath()}index.html`;
    }
  });
  window.addEventListener("click", (e) => {
    const mr = document.getElementById("modal-registro");
    const ml = document.getElementById("modal-login");
    if (e.target === mr) mr.style.display = "none";
    if (e.target === ml) ml.style.display = "none";
  });
}

function actualizarNavbar() {
  const navLinks = document.querySelector(".nav-links");
  if (!navLinks) return;
  const cliente = Cliente.getActual();
  const toPages = window.location.pathname.includes("/pages/") ? "" : "pages/";
  navLinks.innerHTML = cliente
    ? `
      <li><a href="${toPages}eventos.html">Mis Eventos</a></li>
      <li class="bienvenido-item">${cliente.saludo()}</li>
      <li><a href="#" id="cerrar-sesion-link">Cerrar sesión</a></li>`
    : `
      <li><a href="${toPages}eventos.html">Mis Eventos</a></li>
      <li><a href="#" id="modal-registro-link">Registro</a></li>
      <li class="login-item"><a href="#" id="modal-login-link">Iniciar sesión</a></li>`;
}

document.addEventListener("DOMContentLoaded", () => {
  inicializarEventosPredeterminados();
  actualizarNavbar();
  inicializarFormularios();
  instalarDelegados();
  if (document.getElementById("cards-container")) renderizarEventos();
  if (document.getElementById("mis-eventos")) renderizarEventosInscritos();
});