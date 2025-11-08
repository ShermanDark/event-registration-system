document.addEventListener("DOMContentLoaded", () => {
  // Mostrar eventos inscritos en eventos.html
  function renderizarEventosInscritos() {
    const container = document.getElementById("mis-eventos");
    if (!container) return;
    container.innerHTML = "";
    const cliente = Cliente.getActual();
    if (!cliente) {
      container.innerHTML =
        '<p style="color:#ccc">Inicia sesión para ver tus eventos inscritos.</p>';
      return;
    }
    const eventos = Evento.getAll().filter((ev) =>
      cliente.eventosInscritos.includes(ev.id)
    );
    if (eventos.length === 0) {
      container.innerHTML =
        '<p style="color:#ccc">No estás inscrito en ningún evento.</p>';
      return;
    }
    eventos.forEach((ev) => {
      let imgSrc = "";
      if (ev.nombre.includes("JavaScript")) imgSrc = "img/javascript.webp";
      else if (ev.nombre.includes("Python")) imgSrc = "img/python.webp";
      else if (ev.nombre.includes("Power BI")) imgSrc = "img/powerbi.webp";
      else if (ev.nombre.includes("SQL")) imgSrc = "img/sql.webp";
      else if (ev.nombre.includes("POO")) imgSrc = "img/poo.webp";
      else if (ev.nombre.includes("Excel")) imgSrc = "img/excel.webp";
      else imgSrc = "img/javascript.webp";

      const card = document.createElement("article");
      card.className = "card";
      card.innerHTML = `
        <img src="${imgSrc}" alt="${ev.nombre}" />
        <h3>${ev.nombre}</h3>
        <p>${ev.descripcion()}</p>
        <button class="btn-detalles" data-id="${
          ev.id
        }" style="margin-bottom:1rem;background:#222;color:#00b37e;border:1px solid #00b37e;">Ver detalles</button>
        <button class="btn-cancelar" data-id="${
          ev.id
        }" style="background:#b30000;color:#fff;margin-bottom:1rem;">Cancelar inscripción</button>
      `;
      // Ver detalles
      const btnDetalles = card.querySelector(".btn-detalles");
      btnDetalles.addEventListener("click", () => {
        mostrarModalDetalles(ev);
      });
      // Cancelar inscripción
      const btnCancelar = card.querySelector(".btn-cancelar");
      btnCancelar.addEventListener("click", () => {
        cliente.cancelarInscripcion(ev.id);
        renderizarEventosInscritos();
      });
      container.appendChild(card);
    });
  }

  // Renderizar eventos inscritos solo si estamos en eventos.html
  if (document.getElementById("mis-eventos")) {
    renderizarEventosInscritos();
  }
  // Referencias globales a los modales
  const modalRegistro = document.getElementById("modal-registro");
  const modalLogin = document.getElementById("modal-login");

  // Navbar dinámica
  function actualizarNavbar() {
    const navLinks = document.querySelector(".nav-links");
    const cliente = Cliente.getActual();
    navLinks.innerHTML = "";
    if (cliente) {
      navLinks.innerHTML += `<li><a href="pages/eventos.html" id="mis-eventos-link">Mis Eventos</a></li>`;
      navLinks.innerHTML += `<li class="bienvenido-item">Bienvenido, <span style="color:#00b37e">${cliente.nombre}</span></li>`;
      navLinks.innerHTML += `<li><a href="#" id="cerrar-sesion-link">Cerrar sesión</a></li>`;
    } else {
      navLinks.innerHTML += `<li><a href="#" id="modal-registro-link">Registro</a></li>`;
      navLinks.innerHTML += `<li class="login-item"><a href="#" id="modal-login-link">Iniciar sesión</a></li>`;
    }
    // Reasignar listeners cada vez que se actualiza el menú
    registrarEventosNavbar();
    loginEventosNavbar();
    cerrarSesionEvento();
  }

  // Modal Registro
  function registrarEventosNavbar() {
    const registroLink = document.getElementById("modal-registro-link");
    const modalRegistro = document.getElementById("modal-registro");
    const closeRegistro = document.getElementById("close-modal-registro");
    if (registroLink) {
      registroLink.addEventListener("click", (e) => {
        e.preventDefault();
        modalRegistro.style.display = "block";
      });
    }
    if (closeRegistro) {
      closeRegistro.addEventListener("click", () => {
        modalRegistro.style.display = "none";
      });
    }
    window.addEventListener("click", (e) => {
      if (e.target === modalRegistro) modalRegistro.style.display = "none";
    });
  }

  // Modal Login
  function loginEventosNavbar() {
    const loginLink = document.getElementById("modal-login-link");
    const modalLogin = document.getElementById("modal-login");
    const closeLogin = document.getElementById("close-modal-login");
    if (loginLink) {
      loginLink.addEventListener("click", (e) => {
        e.preventDefault();
        modalLogin.style.display = "block";
      });
    }
    if (closeLogin) {
      closeLogin.addEventListener("click", () => {
        modalLogin.style.display = "none";
      });
    }
    window.addEventListener("click", (e) => {
      if (e.target === modalLogin) modalLogin.style.display = "none";
    });
  }

  // Cerrar sesión
  function cerrarSesionEvento() {
    const cerrarSesionLink = document.getElementById("cerrar-sesion-link");
    if (cerrarSesionLink) {
      cerrarSesionLink.addEventListener("click", (e) => {
        e.preventDefault();
        GestorEventos.cerrarSesion();
        actualizarNavbar();
        registrarEventosNavbar();
        loginEventosNavbar();
      });
    }
  }

  // Registro
  const formRegistro = document.getElementById("form-registro");
  formRegistro.addEventListener("submit", (e) => {
    e.preventDefault();
    const nombre = formRegistro.nombre.value.trim();
    const email = formRegistro.email.value.trim();
    const password = formRegistro.password.value;
    const confirm = formRegistro["confirm-password"].value;
    if (nombre.length < 3) return alert("Nombre inválido");
    if (!/^\S+@\S+\.\S+$/.test(email)) return alert("Email inválido");
    if (password.length < 8) return alert("Contraseña mínima 8 caracteres");
    if (password !== confirm) return alert("Las contraseñas no coinciden");
    try {
      GestorEventos.registrarCliente(nombre, email, password);
      GestorEventos.iniciarSesion(email, password); // Inicia sesión automáticamente
      formRegistro.reset();
      modalRegistro.style.display = "none";
      actualizarNavbar();
      registrarEventosNavbar();
      loginEventosNavbar();
      cerrarSesionEvento();
      alert(`Bienvenido, ${nombre}!`);
    } catch (err) {
      alert(err.message);
    }
  });

  // Login
  const formLogin = document.getElementById("form-login");
  formLogin.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = formLogin["login-email"].value.trim();
    const password = formLogin["login-password"].value;
    try {
      GestorEventos.iniciarSesion(email, password);
      formLogin.reset();
      modalLogin.style.display = "none";
      const cliente = Cliente.getActual();
      actualizarNavbar();
      alert(`Bienvenido, ${cliente.nombre}!`);
    } catch (err) {
      alert(err.message);
    }
  });

  // Inicialización navbar
  actualizarNavbar();
});

// app.js
// Sistema de inscripción a eventos con POO avanzada y localStorage

// =====================
// Clase Cliente
// =====================
class Cliente {
  #id;
  #nombre;
  #email;
  #password;
  #eventosInscritos;

  constructor(id, nombre, email, password, eventosInscritos = []) {
    this.#id = id;
    this.#nombre = nombre;
    this.#email = email;
    this.#password = password;
    this.#eventosInscritos = eventosInscritos;
  }

  // Getters y setters
  get id() {
    return this.#id;
  }
  get nombre() {
    return this.#nombre;
  }
  get email() {
    return this.#email;
  }
  get eventosInscritos() {
    return [...this.#eventosInscritos];
  }

  set nombre(n) {
    this.#nombre = n;
  }
  set password(p) {
    this.#password = p;
  }

  // Métodos de persistencia
  static getAll() {
    const arr = JSON.parse(localStorage.getItem("clientes")) || [];
    return arr.map(
      (obj) =>
        new Cliente(
          obj.id,
          obj.nombre,
          obj.email,
          obj.password,
          obj.eventosInscritos
        )
    );
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
      id: this.#id,
      nombre: this.#nombre,
      email: this.#email,
      password: this.#password,
      eventosInscritos: this.#eventosInscritos,
    };
  }

  static findByEmail(email) {
    return Cliente.getAll().find((c) => c.email === email);
  }

  static login(email, password) {
    const cliente = Cliente.findByEmail(email);
    if (cliente && cliente.#password === password) {
      localStorage.setItem("clienteActual", JSON.stringify(cliente.toJSON()));
      return cliente;
    }
    return null;
  }

  static logout() {
    localStorage.removeItem("clienteActual");
  }

  static getActual() {
    const obj = JSON.parse(localStorage.getItem("clienteActual"));
    if (!obj) return null;
    return new Cliente(
      obj.id,
      obj.nombre,
      obj.email,
      obj.password,
      obj.eventosInscritos
    );
  }

  inscribirEvento(eventoId) {
    if (!this.#eventosInscritos.includes(eventoId)) {
      this.#eventosInscritos.push(eventoId);
      this.save();
      localStorage.setItem("clienteActual", JSON.stringify(this.toJSON()));
      return true;
    }
    return false;
  }

  cancelarInscripcion(eventoId) {
    this.#eventosInscritos = this.#eventosInscritos.filter(
      (id) => id !== eventoId
    );
    this.save();
    localStorage.setItem("clienteActual", JSON.stringify(this.toJSON()));
  }
}

// =====================
// Clase base Evento
// =====================
class Evento {
  #id;
  #nombre;
  #fecha;
  #ubicacion;
  #categoria;
  #estadoInscripcion;

  constructor(
    id,
    nombre,
    fecha,
    ubicacion,
    categoria,
    estadoInscripcion = false
  ) {
    this.#id = id;
    this.#nombre = nombre;
    this.#fecha = fecha;
    this.#ubicacion = ubicacion;
    this.#categoria = categoria;
    this.#estadoInscripcion = estadoInscripcion;
  }

  // Getters y setters
  get id() {
    return this.#id;
  }
  get nombre() {
    return this.#nombre;
  }
  get fecha() {
    return this.#fecha;
  }
  get ubicacion() {
    return this.#ubicacion;
  }
  get categoria() {
    return this.#categoria;
  }
  get estadoInscripcion() {
    return this.#estadoInscripcion;
  }
  set estadoInscripcion(val) {
    this.#estadoInscripcion = val;
  }

  // Polimorfismo: método sobrescribible
  descripcion() {
    return `${this.#nombre} - ${this.#fecha} - ${this.#ubicacion} - ${
      this.#categoria
    }`;
  }

  static getAll() {
    const arr = JSON.parse(localStorage.getItem("eventos")) || [];
    return arr.map((obj) => {
      if (obj.tipo === "online") {
        return new EventoOnline(
          obj.id,
          obj.nombre,
          obj.fecha,
          obj.ubicacion,
          obj.categoria,
          obj.estadoInscripcion,
          obj.link
        );
      } else if (obj.tipo === "presencial") {
        return new EventoPresencial(
          obj.id,
          obj.nombre,
          obj.fecha,
          obj.ubicacion,
          obj.categoria,
          obj.estadoInscripcion,
          obj.sala
        );
      } else {
        return new Evento(
          obj.id,
          obj.nombre,
          obj.fecha,
          obj.ubicacion,
          obj.categoria,
          obj.estadoInscripcion
        );
      }
    });
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

  toJSON() {
    return {
      id: this.#id,
      nombre: this.#nombre,
      fecha: this.#fecha,
      ubicacion: this.#ubicacion,
      categoria: this.#categoria,
      estadoInscripcion: this.#estadoInscripcion,
    };
  }

  static findById(id) {
    return Evento.getAll().find((e) => e.id === id);
  }
}

// =====================
// Herencia y polimorfismo
// =====================
class EventoOnline extends Evento {
  #link;
  constructor(
    id,
    nombre,
    fecha,
    ubicacion,
    categoria,
    estadoInscripcion = false,
    link = ""
  ) {
    super(id, nombre, fecha, ubicacion, categoria, estadoInscripcion);
    this.#link = link;
  }
  get link() {
    return this.#link;
  }
  set link(l) {
    this.#link = l;
  }
  descripcion() {
    return super.descripcion() + ` (Online: ${this.#link})`;
  }
  toJSON() {
    return { ...super.toJSON(), tipo: "online", link: this.#link };
  }
}

class EventoPresencial extends Evento {
  #sala;
  constructor(
    id,
    nombre,
    fecha,
    ubicacion,
    categoria,
    estadoInscripcion = false,
    sala = ""
  ) {
    super(id, nombre, fecha, ubicacion, categoria, estadoInscripcion);
    this.#sala = sala;
  }
  get sala() {
    return this.#sala;
  }
  set sala(s) {
    this.#sala = s;
  }
  descripcion() {
    return super.descripcion() + ` (Presencial: Sala ${this.#sala})`;
  }
  toJSON() {
    return { ...super.toJSON(), tipo: "presencial", sala: this.#sala };
  }
}

// =====================
// Gestor de eventos
// =====================
class GestorEventos {
  static registrarCliente(nombre, email, password) {
    if (Cliente.findByEmail(email)) {
      throw new Error("El email ya está registrado");
    }
    const id =
      Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
    const cliente = new Cliente(id, nombre, email, password);
    cliente.save();
    return cliente;
  }

  static iniciarSesion(email, password) {
    const cliente = Cliente.login(email, password);
    if (!cliente) throw new Error("Email o contraseña incorrectos");
    return cliente;
  }

  static cerrarSesion() {
    Cliente.logout();
  }

  static inscribirAEvento(eventoId) {
    const cliente = Cliente.getActual();
    if (!cliente) throw new Error("Debes iniciar sesión para inscribirte");
    cliente.inscribirEvento(eventoId);
  }

  static cancelarInscripcion(eventoId) {
    const cliente = Cliente.getActual();
    if (!cliente) throw new Error("Debes iniciar sesión");
    cliente.cancelarInscripcion(eventoId);
  }

  static listarEventos() {
    return Evento.getAll();
  }
}
// =====================
// EVENTOS PREDETERMINADOS Y RENDER DINÁMICO
// =====================
function inicializarEventosPredeterminados() {
  if (!localStorage.getItem("eventos") || Evento.getAll().length === 0) {
    const eventos = [
      new EventoOnline(
        "ev1",
        "Bootcamp JavaScript",
        "2025-11-20",
        "Online",
        "Programación",
        false,
        "https://meet.com/js"
      ),
      new EventoOnline(
        "ev2",
        "Bootcamp Python",
        "2025-11-22",
        "Online",
        "Programación",
        false,
        "https://meet.com/python"
      ),
      new EventoPresencial(
        "ev3",
        "Bootcamp Power BI",
        "2025-11-25",
        "CDMX",
        "Datos",
        false,
        "Sala 1"
      ),
      new EventoPresencial(
        "ev4",
        "Bootcamp SQL",
        "2025-11-28",
        "CDMX",
        "Datos",
        false,
        "Sala 2"
      ),
      new EventoOnline(
        "ev5",
        "Bootcamp POO",
        "2025-12-01",
        "Online",
        "Programación",
        false,
        "https://meet.com/poo"
      ),
      new EventoPresencial(
        "ev6",
        "Bootcamp Excel Avanzado",
        "2025-12-05",
        "CDMX",
        "Datos",
        false,
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
  container.innerHTML = "";
  const eventos = Evento.getAll();
  const cliente = Cliente.getActual();
  eventos.forEach((ev) => {
    // Imagen por nombre
    let imgSrc = "";
    if (ev.nombre.includes("JavaScript")) imgSrc = "img/javascript.webp";
    else if (ev.nombre.includes("Python")) imgSrc = "img/python.webp";
    else if (ev.nombre.includes("Power BI")) imgSrc = "img/powerbi.webp";
    else if (ev.nombre.includes("SQL")) imgSrc = "img/sql.webp";
    else if (ev.nombre.includes("POO")) imgSrc = "img/poo.webp";
    else if (ev.nombre.includes("Excel")) imgSrc = "img/excel.webp";
    else imgSrc = "img/javascript.webp";

    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `
      <img src="${imgSrc}" alt="${ev.nombre}" />
      <h3>${ev.nombre}</h3>
      <p>${ev.descripcion()}</p>
      <button class="btn-ticket" data-id="${ev.id}">
        ${
          cliente && cliente.eventosInscritos.includes(ev.id)
            ? "Inscrito"
            : "Obtener Ticket"
        }
      </button>
      <button class="btn-ticket btn-detalles" data-id="${
        ev.id
      }" style="margin-bottom:1rem;background:#222;color:#00b37e;border:1px solid #00b37e;">Ver detalles</button>
    `;
    // Inscripción
    const btn = card.querySelector(".btn-ticket");
    btn.addEventListener("click", () => {
      const usuario = Cliente.getActual();
      if (!usuario) {
        alert("Debes iniciar sesión para inscribirte");
        return;
      }
      if (usuario.eventosInscritos.includes(ev.id)) {
        usuario.cancelarInscripcion(ev.id);
        btn.textContent = "Obtener Ticket";
      } else {
        usuario.inscribirEvento(ev.id);
        btn.textContent = "Inscrito";
      }
    });
    // Ver detalles
    const btnDetalles = card.querySelector(".btn-detalles");
    btnDetalles.addEventListener("click", () => {
      mostrarModalDetalles(ev);
    });
    container.appendChild(card);
  });
}

// Modal para detalles de evento
function mostrarModalDetalles(evento) {
  let modal = document.getElementById("modal-detalles");
  if (!modal) {
    // Obtener imagen según nombre
    let imgSrc = "";
    if (evento.nombre.includes("JavaScript")) imgSrc = "img/javascript.webp";
    else if (evento.nombre.includes("Python")) imgSrc = "img/python.webp";
    else if (evento.nombre.includes("Power BI")) imgSrc = "img/powerbi.webp";
    else if (evento.nombre.includes("SQL")) imgSrc = "img/sql.webp";
    else if (evento.nombre.includes("POO")) imgSrc = "img/poo.webp";
    else if (evento.nombre.includes("Excel")) imgSrc = "img/excel.webp";
    else imgSrc = "img/javascript.webp";

    modal = document.createElement("div");
    modal.id = "modal-detalles";
    modal.className = "modal";
    modal.innerHTML = `
      <div class="modal-content modal-detalles-content">
        <span class="close-modal" id="close-modal-detalles">&times;</span>
        <img src="${imgSrc}" alt="${
      evento.nombre
    }" style="width:100%;max-height:220px;object-fit:cover;border-radius:12px;margin-bottom:1.2rem;" />
        <h2>${evento.nombre}</h2>
        <p><strong>Fecha:</strong> ${evento.fecha}</p>
        <p><strong>Ubicación:</strong> ${evento.ubicacion}</p>
        <p><strong>Categoría:</strong> ${evento.categoria}</p>
        <p><strong>Tipo:</strong> ${
          evento instanceof EventoOnline
            ? "Online"
            : evento instanceof EventoPresencial
            ? "Presencial"
            : "General"
        }</p>
        ${
          evento instanceof EventoOnline
            ? `<p><strong>Enlace:</strong> <a href='${evento.link}' target='_blank'>${evento.link}</a></p>`
            : ""
        }
        ${
          evento instanceof EventoPresencial
            ? `<p><strong>Sala:</strong> ${evento.sala}</p>`
            : ""
        }
        <p style="margin-top:1.5rem;color:#aaa;">${evento.descripcion()}</p>
      </div>
    `;
    document.body.appendChild(modal);
    // Estilos extra para el modal de detalles (más grande)
    if (!document.getElementById("modal-detalles-style")) {
      const styleDetalles = document.createElement("style");
      styleDetalles.id = "modal-detalles-style";
      styleDetalles.innerHTML = `
        .modal-detalles-content {
          max-width: 540px !important;
          min-width: 340px;
          padding: 2.5rem 2.5rem 2rem 2.5rem !important;
        }
      `;
      document.head.appendChild(styleDetalles);
    }
  } else {
    // Actualizar imagen si el modal ya existe
    let imgSrc = "";
    if (evento.nombre.includes("JavaScript")) imgSrc = "img/javascript.webp";
    else if (evento.nombre.includes("Python")) imgSrc = "img/python.webp";
    else if (evento.nombre.includes("Power BI")) imgSrc = "img/powerbi.webp";
    else if (evento.nombre.includes("SQL")) imgSrc = "img/sql.webp";
    else if (evento.nombre.includes("POO")) imgSrc = "img/poo.webp";
    else if (evento.nombre.includes("Excel")) imgSrc = "img/excel.webp";
    else imgSrc = "img/javascript.webp";
    const img = modal.querySelector("img");
    if (img) {
      img.src = imgSrc;
      img.alt = evento.nombre;
    }
    modal.querySelector("h2").textContent = evento.nombre;
    modal.querySelector(
      "p:nth-of-type(1)"
    ).innerHTML = `<strong>Fecha:</strong> ${evento.fecha}`;
    modal.querySelector(
      "p:nth-of-type(2)"
    ).innerHTML = `<strong>Ubicación:</strong> ${evento.ubicacion}`;
    modal.querySelector(
      "p:nth-of-type(3)"
    ).innerHTML = `<strong>Categoría:</strong> ${evento.categoria}`;
    modal.querySelector(
      "p:nth-of-type(4)"
    ).innerHTML = `<strong>Tipo:</strong> ${
      evento instanceof EventoOnline
        ? "Online"
        : evento instanceof EventoPresencial
        ? "Presencial"
        : "General"
    }`;
    if (evento instanceof EventoOnline) {
      if (!modal.querySelector(".enlace-evento")) {
        const p = document.createElement("p");
        p.className = "enlace-evento";
        p.innerHTML = `<strong>Enlace:</strong> <a href='${evento.link}' target='_blank'>${evento.link}</a>`;
        modal.querySelector(".modal-content").appendChild(p);
      }
    } else {
      const p = modal.querySelector(".enlace-evento");
      if (p) p.remove();
    }
    if (evento instanceof EventoPresencial) {
      if (!modal.querySelector(".sala-evento")) {
        const p = document.createElement("p");
        p.className = "sala-evento";
        p.innerHTML = `<strong>Sala:</strong> ${evento.sala}`;
        modal.querySelector(".modal-content").appendChild(p);
      }
    } else {
      const p = modal.querySelector(".sala-evento");
      if (p) p.remove();
    }
    modal.querySelector(".modal-content p:last-child").textContent =
      evento.descripcion();
  }
  modal.style.display = "flex";
  // Cerrar modal
  const closeBtn = document.getElementById("close-modal-detalles");
  closeBtn.onclick = () => {
    modal.style.display = "none";
  };
  window.onclick = function (e) {
    if (e.target === modal) modal.style.display = "none";
  };
}

document.addEventListener("DOMContentLoaded", () => {
  inicializarEventosPredeterminados();
  renderizarEventos();
  // ...existing code...
});
