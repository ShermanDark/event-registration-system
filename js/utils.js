// Genera ID único
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

// Validaciones
function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

function validatePassword(password) {
  return password.length >= 8;
}

function validateName(name) {
  return /^[a-zA-Z\s]+$/.test(name) && name.length >= 3;
}
