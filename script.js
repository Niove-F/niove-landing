const bgColor = getComputedStyle(document.documentElement)
  .getPropertyValue('--bg') 
  .trim();

VANTA.BIRDS({
  el: "#vanta-bg",
  mouseControls: true,
  touchControls: true,
  gyroControls: false,
  minHeight: 200.00,
  minWidth: 200.00,
  backgroundColor: parseInt(bgColor.replace("#", ""), 16),
  color1: 0xe58d17,
  color2: 0xffdea7,
  birdSize: 1.20,
  backgroundAlpha: 1
});

// SONIDOS
const SOUNDS = {
  open:  new Audio('assets/open.mp3'),
  close: new Audio('assets/close.mp3'),
};

SOUNDS.open.volume  = 0.5;
SOUNDS.close.volume = 0.5;

function playSound(name) {
  const s = SOUNDS[name];
  if (!s) return;
  s.currentTime = 0; //rebobinar
  s.play().catch(() => {}); //catch evita errores si el navegador bloquea el audio
}

let muted = false;

function toggleMute() {
  muted = !muted;
  Object.values(SOUNDS).forEach(s => s.muted = muted);
  document.getElementById('mute-btn').textContent = muted ? '🔇' : '🔊';
}

// zTop lleva la cuenta del z-index más alto.
// Cada vez que una ventana recibe foco se le asigna ++zTop para que aparezca encima de las demás.

let zTop = 10;

// Mapa de id lógico → id del elemento HTML
const WINS = {
  about:    'win-about',
  tech:     'win-tech',
  projects: 'win-projects',
  hobbies:  'win-hobbies',
  contact:  'win-contact',
};

// Orden de los botones en la taskbar (mismo que en el HTML)
const TASKBAR_KEYS = ['about', 'tech', 'projects', 'hobbies', 'contact'];

/**
 * focusWin(key)
 * Trae una ventana al frente. Si estaba oculta, la vuelve a mostrar.
 *
 * Conceptos usados:
 * - z-index: https://developer.mozilla.org/es/docs/Web/CSS/z-index
 * - classList: https://developer.mozilla.org/es/docs/Web/API/Element/classList
 */
function focusWin(key) {
  const el = document.getElementById(WINS[key]);
  if (!el) return;

  if (el.style.display === 'none'){
    el.style.display = '';
    playSound('open');
  }

  el.style.zIndex = ++zTop;

  document.querySelectorAll('.win').forEach(w => w.classList.remove('active'));
  el.classList.add('active');

  updateTaskbar(key);
}

/**
 * closeWin(key)
 * Oculta una ventana sin eliminarla del DOM.
 * Se puede volver a abrir desde el ícono o la taskbar.
 */
function closeWin(key) {
  const el = document.getElementById(WINS[key]);
  if (el) el.style.display = 'none';
  playSound('close');
}

/**
 * updateTaskbar(activeKey)
 * Marca el botón correspondiente en la taskbar como activo.
 */
function updateTaskbar(activeKey) {
  document.querySelectorAll('.taskbar-item').forEach((btn, i) => {
    btn.classList.toggle('active', TASKBAR_KEYS[i] === activeKey);
  });
}

/* Al presionar el mouse sobre la titlebar, la ventana se puede
   mover libremente por la pantalla.

   1. onmousedown en la titlebar llama a startDrag()
   2. Se guarda la distancia entre el cursor y la esquina de la ventana
   3. mousemove actualiza la posición de la ventana en tiempo real
   4. mouseup detiene el arrastre eliminando los listeners

   Documentación:
   - MouseEvent (clientX, clientY): https://developer.mozilla.org/es/docs/Web/API/MouseEvent
   - addEventListener: https://developer.mozilla.org/es/docs/Web/API/EventTarget/addEventListener
*/
function startDrag(event, winId) {
  const el = document.getElementById(winId);

  // Traer la ventana al frente al empezar a arrastrar
  const key = Object.keys(WINS).find(k => WINS[k] === winId);
  if (key) focusWin(key);

  // Distancia del cursor a la esquina superior izquierda de la ventana
  const offsetX = event.clientX - el.offsetLeft;
  const offsetY = event.clientY - el.offsetTop;

  function onMouseMove(e) {
    el.style.left = (e.clientX - offsetX) + 'px';
    el.style.top  = (e.clientY - offsetY) + 'px';
  }

  function onMouseUp() {
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
  }

  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
}

/* FOCO al clickear en ventana */
document.querySelectorAll('.win').forEach(win => {
  win.addEventListener('mousedown', () => {
    const key = Object.keys(WINS).find(k => WINS[k] === win.id);
    if (key) focusWin(key);
  });
});

/* RELOJITOO

   Documentación:
   - Date: https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Date
   - setInterval: https://developer.mozilla.org/es/docs/Web/API/setInterval
*/
function updateClock() {
  const clockEl = document.getElementById('clock');
  if (clockEl) {
    clockEl.textContent = new Date().toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

updateClock();
setInterval(updateClock, 1000);

function closeAllWins() {
  Object.values(WINS).forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
    playSound('close');
}