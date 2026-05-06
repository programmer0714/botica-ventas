// auth.js — Módulo de autenticación para Botica Nova Salud

const AUTH_KEY = 'nova_salud_session';

/**
 * Verifica si hay sesión activa. Si no, redirige a login.html
 */
function checkAuth() {
  const session = getSession();
  if (!session || !session.loggedIn) {
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

/**
 * Obtiene la sesión almacenada
 */
function getSession() {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Inicia sesión y guarda en localStorage
 */
function login(username, password) {
  // Credenciales fijas (en producción vendría de API)
  if (username === 'admin' && password === '123456') {
    const session = {
      loggedIn: true,
      usuario: username,
      nombre: 'Administrador',
      cargo: 'Vendedor',
      loginAt: new Date().toISOString()
    };
    localStorage.setItem(AUTH_KEY, JSON.stringify(session));
    return { success: true };
  }
  return { success: false, message: 'Usuario o contraseña incorrectos.' };
}

/**
 * Cierra sesión y redirige a login.html
 */
function logout() {
  localStorage.removeItem(AUTH_KEY);
  window.location.href = 'login.html';
}

/**
 * Renderiza el nombre del usuario en el topbar si existe el elemento
 */
function renderUserInfo() {
  const session = getSession();
  if (!session) return;

  const nameEl = document.getElementById('user-name');
  const roleEl = document.getElementById('user-role');
  const avatarEl = document.getElementById('user-avatar');

  if (nameEl) nameEl.textContent = session.nombre || session.usuario;
  if (roleEl) roleEl.textContent = session.cargo || 'Usuario';
  if (avatarEl) avatarEl.textContent = (session.nombre || session.usuario).charAt(0).toUpperCase();
}
