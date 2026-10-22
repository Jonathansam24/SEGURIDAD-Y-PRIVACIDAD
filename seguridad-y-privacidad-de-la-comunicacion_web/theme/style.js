/* Estilo "privacidad-hacker":
   1) Menú hamburguesa: convierte #siteNav en un botón de 3 rayas que
      abre y cierra el panel con las páginas.
   2) Título: lluvia de código estilo Matrix detrás del texto, el título
      se "descifra" al cargar y cada 10 segundos cambia a un color al
      azar de la paleta neón (y se vuelve a descifrar).
   3) Vídeos: cada vídeo incrustado se enmarca como una ventana de
      terminal (barra superior, puntos e indicador de señal).
   Si este archivo no se carga, el CSS ya trae respaldos para todo. */
(function () {
  'use strict';

  /* ---------- 1) MENÚ HAMBURGUESA ---------- */
  function initMenu() {
    var nav = document.getElementById('siteNav');
    if (!nav || nav.querySelector('.hk-burger') || !nav.querySelector('ul')) return;

    nav.classList.add('hk-js');

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'hk-burger';
    btn.setAttribute('aria-label', 'Abrir o cerrar el menú');
    btn.setAttribute('aria-expanded', 'false');

    var bars = document.createElement('span');
    bars.className = 'hk-bars';
    bars.setAttribute('aria-hidden', 'true');

    var label = document.createElement('span');
    label.className = 'hk-label';
    label.textContent = 'Menú';

    btn.appendChild(bars);
    btn.appendChild(label);

    var current = nav.querySelector('a.active, li.active > a');
    if (current) {
      var cur = document.createElement('span');
      cur.className = 'hk-current';
      cur.textContent = current.textContent.trim();
      btn.appendChild(cur);
    }

    nav.insertBefore(btn, nav.firstChild);

    function setOpen(open) {
      nav.classList.toggle('hk-open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      setOpen(!nav.classList.contains('hk-open'));
    });
    document.addEventListener('click', function (e) {
      if (!nav.contains(e.target)) setOpen(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('hk-open')) {
        setOpen(false);
        btn.focus();
      }
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest && e.target.closest('a')) setOpen(false);
    });
  }

  /* ---------- 2) TÍTULO: LLUVIA DE CÓDIGO + DESCIFRADO + COLOR ---------- */
  var INTERVALO = 10000; /* milisegundos entre cambios de color */
  var PALETA = [
    ['#00ff9c', 'rgba(0, 255, 156, .55)'],    /* verde matrix */
    ['#22d3ee', 'rgba(34, 211, 238, .55)'],   /* cian */
    ['#ffb703', 'rgba(255, 183, 3, .50)'],    /* ámbar */
    ['#ff3b5c', 'rgba(255, 59, 92, .50)'],    /* rojo alerta */
    ['#b794ff', 'rgba(183, 148, 255, .50)']   /* violeta */
  ];
  var GLIFOS = '01ABCDEF793$#%&@<>/\\{}[]*+=アイウエオカキクケコサシスセソ';
  var colorActual = PALETA[0][0];
  var decifradores = [];

  /* lluvia estilo Matrix dibujada en un <canvas> dentro del título */
  function lluvia(el) {
    var cv = document.createElement('canvas');
    cv.className = 'hk-rain';
    cv.setAttribute('aria-hidden', 'true');
    var ctx = cv.getContext && cv.getContext('2d');
    if (!ctx) return false;
    el.insertBefore(cv, el.firstChild);

    var TAM = 14, gotas = [], w = 0, h = 0, ultimo = 0, activo = true;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);

    function medir() {
      var r = el.getBoundingClientRect();
      w = r.width; h = r.height;
      cv.width = Math.max(1, Math.round(w * dpr));
      cv.height = Math.max(1, Math.round(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.ceil(w / TAM);
      gotas = [];
      for (var i = 0; i < n; i++) gotas[i] = -Math.random() * (h / TAM) * 1.5;
    }

    function cuadro(t) {
      if (!activo) return;
      requestAnimationFrame(cuadro);
      if (t - ultimo < 55) return;
      ultimo = t;
      /* desvanece lo anterior sin tapar el fondo del banner */
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0, 0, 0, .14)';
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'source-over';
      ctx.font = TAM + 'px monospace';
      ctx.fillStyle = colorActual;
      for (var i = 0; i < gotas.length; i++) {
        var ch = GLIFOS.charAt(Math.floor(Math.random() * GLIFOS.length));
        var y = gotas[i] * TAM;
        ctx.fillText(ch, i * TAM, y);
        if (y > h && Math.random() > 0.975) gotas[i] = 0;
        gotas[i]++;
      }
    }

    function reanudar() {
      if (document.hidden) { activo = false; return; }
      if (!activo) { activo = true; requestAnimationFrame(cuadro); }
    }

    medir();
    window.addEventListener('resize', medir);
    document.addEventListener('visibilitychange', reanudar);
    requestAnimationFrame(cuadro);
    return true;
  }

  /* el título se escribe como si lo descifraran: de símbolos al texto real */
  function prepararTexto(el) {
    if (el.children.length) return null;
    var texto = el.textContent.replace(/\s+/g, ' ').trim();
    if (!texto) return null;
    el.setAttribute('aria-label', texto);
    el.textContent = '';
    var t = document.createElement('span');
    t.className = 'hk-t';
    t.setAttribute('aria-hidden', 'true');
    t.textContent = texto;
    var c = document.createElement('span');
    c.className = 'hk-cursor';
    c.setAttribute('aria-hidden', 'true');
    /* un solo contenedor para que el cursor siga al texto aunque haya 2 líneas */
    var w = document.createElement('span');
    w.className = 'hk-w';
    w.appendChild(t);
    w.appendChild(document.createTextNode('\u2060')); /* une el cursor a la última palabra */
    w.appendChild(c);
    el.appendChild(w);
    return { nodo: t, texto: texto, timer: null };
  }

  function descifrar(d) {
    var SIMB = '01#$%&@!?<>/\\[]{}*+=ABCDEF';
    var pasos = 20, n = 0;
    clearInterval(d.timer);
    d.timer = setInterval(function () {
      var fijas = Math.floor(d.texto.length * n / pasos), out = '';
      for (var i = 0; i < d.texto.length; i++) {
        var c = d.texto.charAt(i);
        out += (i < fijas || c === ' ') ? c : SIMB.charAt(Math.floor(Math.random() * SIMB.length));
      }
      d.nodo.textContent = out;
      if (++n > pasos) { clearInterval(d.timer); d.nodo.textContent = d.texto; }
    }, 45);
  }

  function initTitle() {
    var titulos = document.querySelectorAll('.page-title, .package-title');
    if (!titulos.length) return;
    /* solo en la página exportada / vista previa, nunca en el editor */
    if (!document.querySelector('.exe-web-site, .exe-single-page')) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var root = document.documentElement;
    root.classList.add('hk-rand');

    for (var k = 0; k < titulos.length; k++) {
      var d = prepararTexto(titulos[k]);
      if (lluvia(titulos[k])) root.classList.add('hk-rain-on');
      if (d) { decifradores.push(d); descifrar(d); }
    }

    var ultimo = -1;
    function cambiar(primera) {
      var i;
      do { i = Math.floor(Math.random() * PALETA.length); } while (i === ultimo && PALETA.length > 1);
      ultimo = i;
      colorActual = PALETA[i][0];
      root.style.setProperty('--hk-title-color', PALETA[i][0]);
      root.style.setProperty('--hk-title-glow', PALETA[i][1]);
      if (!primera) for (var j = 0; j < decifradores.length; j++) descifrar(decifradores[j]);
    }

    cambiar(true);
    setInterval(function () { cambiar(false); }, INTERVALO);
  }

  /* ---------- 3) MARCO PARA LOS VÍDEOS ---------- */
  var RE_VIDEO = /youtube|youtu\.be|vimeo|dailymotion|peertube|ted\.com|archive\.org|\.mp4|\.webm|\.ogv/i;

  function initVideos() {
    /* solo en la página exportada / vista previa, nunca en el editor */
    if (!document.querySelector('.exe-web-site, .exe-single-page')) return;
    var lista = document.querySelectorAll('.box iframe, .box video');
    for (var i = 0; i < lista.length; i++) {
      var el = lista[i];
      if (el.closest('.hk-video')) continue;
      if (el.tagName === 'IFRAME') {
        var src = el.getAttribute('src') || el.getAttribute('data-src') || '';
        if (!RE_VIDEO.test(src)) continue;
      }
      /* si el vídeo está colocado en absoluto (caja con proporción fija),
         no se mueve: se queda con el marco de respaldo del CSS */
      if (window.getComputedStyle(el).position === 'absolute') continue;
      var padre = el.parentNode;
      if (!padre) continue;

      var wrap = document.createElement('div');
      wrap.className = 'hk-video';

      var bar = document.createElement('div');
      bar.className = 'hk-video-bar';
      bar.setAttribute('aria-hidden', 'true');
      var dots = document.createElement('span');
      dots.className = 'hk-video-dots';
      var name = document.createElement('span');
      name.className = 'hk-video-name';
      name.textContent = '\u25B6 reproducir_video.mp4';
      var live = document.createElement('span');
      live.className = 'hk-video-live';
      live.textContent = 'conectado';
      bar.appendChild(dots);
      bar.appendChild(name);
      bar.appendChild(live);

      padre.insertBefore(wrap, el);
      wrap.appendChild(bar);
      wrap.appendChild(el);
      el.classList.add('hk-in');
    }
  }

  function init() { initMenu(); initTitle(); initVideos(); }
  window.addEventListener('load', initVideos);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
