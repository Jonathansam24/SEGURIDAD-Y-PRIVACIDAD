/* Estilo "seguridad-digital":
   1) Menú hamburguesa: convierte #siteNav en un botón de 3 rayas que
      abre y cierra el panel con las páginas.
   2) Color del título: cada 10 segundos el título del banner cambia a
      un color al azar de una paleta suave que combina con el estilo.
   Si este archivo no se carga, el CSS ya trae respaldos para ambas cosas. */
(function () {
  /* ---------- 1) MENÚ HAMBURGUESA ---------- */
  function initMenu() {
    var nav = document.getElementById('siteNav');
    if (!nav || nav.querySelector('.sd-burger') || !nav.querySelector('ul')) return;

    nav.classList.add('sd-js');

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'sd-burger';
    btn.setAttribute('aria-label', 'Abrir o cerrar el menú');
    btn.setAttribute('aria-expanded', 'false');

    var bars = document.createElement('span');
    bars.className = 'sd-bars';
    bars.setAttribute('aria-hidden', 'true');

    var label = document.createElement('span');
    label.className = 'sd-label';
    label.textContent = 'Menú';

    btn.appendChild(bars);
    btn.appendChild(label);

    var current = nav.querySelector('a.active, li.active > a');
    if (current) {
      var cur = document.createElement('span');
      cur.className = 'sd-current';
      cur.textContent = current.textContent.trim();
      btn.appendChild(cur);
    }

    nav.insertBefore(btn, nav.firstChild);

    function setOpen(open) {
      nav.classList.toggle('sd-open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      setOpen(!nav.classList.contains('sd-open'));
    });
    document.addEventListener('click', function (e) {
      if (!nav.contains(e.target)) setOpen(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('sd-open')) {
        setOpen(false);
        btn.focus();
      }
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest && e.target.closest('a')) setOpen(false);
    });
  }

  /* ---------- 2) COLOR ALEATORIO DEL TÍTULO CADA 10 s ---------- */
  var INTERVALO = 10000; /* milisegundos */
  var PALETA = [
    ['#a6f2e8', 'rgba(79, 209, 197, .45)'],   /* turquesa */
    ['#9fd8ff', 'rgba(90, 170, 255, .45)'],   /* celeste */
    ['#c5b8ff', 'rgba(150, 130, 255, .45)'],  /* lavanda */
    ['#b8f5c8', 'rgba(110, 220, 150, .45)'],  /* menta */
    ['#ffe9a6', 'rgba(255, 200, 90, .45)'],   /* amarillo suave */
    ['#ffc2d4', 'rgba(255, 130, 170, .45)'],  /* rosa suave */
    ['#ffd2b0', 'rgba(255, 160, 100, .45)'],  /* durazno */
    ['#e6f0ff', 'rgba(160, 190, 255, .45)']   /* blanco azulado */
  ];

  function initTitleColor() {
    if (!document.querySelector('.page-title, .package-title')) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var root = document.documentElement;
    root.classList.add('sd-rand');
    var last = -1;

    function cambiar() {
      var i;
      do { i = Math.floor(Math.random() * PALETA.length); } while (i === last && PALETA.length > 1);
      last = i;
      root.style.setProperty('--sd-title-color', PALETA[i][0]);
      root.style.setProperty('--sd-title-glow', PALETA[i][1]);
    }

    cambiar();
    setInterval(cambiar, INTERVALO);
  }

  function init() { initMenu(); initTitleColor(); }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
