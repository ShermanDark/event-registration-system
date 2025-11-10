function generateId() {
  const timestamp = Date.now().toString(36);
  const randomPart = crypto.getRandomValues(new Uint32Array(1))[0].toString(36);
  return (timestamp + randomPart).slice(0, 12);
}

function validateEmail(email) {
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(email.trim());
}

function validatePassword(password) {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=]).{8,}$/;
  return regex.test(password);
}

function validateName(name) {
  const regex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;
  return regex.test(name.trim()) && name.trim().length >= 3;
}

window.generateId = generateId;
window.validateEmail = validateEmail;
window.validatePassword = validatePassword;
window.validateName = validateName;
