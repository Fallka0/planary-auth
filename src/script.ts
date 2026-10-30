// Progressive enhancement only: show/hide password, a busy state on submit and the art drift.
// Every page works without it.
export const SCRIPT = String.raw`
function auWire(root, demo) {
  if (!root) return;
  // Show / hide password
  Array.prototype.forEach.call(root.querySelectorAll('[data-eye]'), function (btn) {
    btn.addEventListener('click', function () {
      var input = btn.parentNode.querySelector('input');
      var show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      btn.textContent = show ? 'Hide' : 'Show';
      btn.setAttribute('aria-pressed', show ? 'true' : 'false');
      input.focus();
    });
  });
  // One submit only: busy state on the submit button
  Array.prototype.forEach.call(root.querySelectorAll('form[data-busy]'), function (form) {
    form.addEventListener('submit', function (e) {
      var btn = form.querySelector('[type="submit"]');
      if (btn.classList.contains('is-busy')) { e.preventDefault(); return; }
      var label = btn.querySelector('.go-t');
      var idle = label.textContent;
      btn.dataset.idle = idle;
      btn.classList.add('is-busy');
      btn.setAttribute('aria-disabled', 'true');
      label.textContent = form.getAttribute('data-busy');
      if (demo) {
        e.preventDefault();
        setTimeout(function () { btn.classList.remove('is-busy'); btn.removeAttribute('aria-disabled'); label.textContent = idle; }, 1800);
      }
    });
  });
  // Pointer drift on the art card (2D only, no tilt)
  var art = root.querySelector('.au-art');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (art && !reduce && window.matchMedia('(hover: hover)').matches) {
    var raf = 0, ev = null;
    art.addEventListener('pointermove', function (e) {
      ev = e;
      if (raf) return;
      raf = requestAnimationFrame(function () {
        raf = 0;
        var r = art.getBoundingClientRect();
        art.style.setProperty('--px', (((ev.clientX - r.left) / r.width - 0.5) * 16).toFixed(1) + 'px');
        art.style.setProperty('--py', (((ev.clientY - r.top) / r.height - 0.5) * 12).toFixed(1) + 'px');
      });
    });
    art.addEventListener('pointerleave', function () { art.style.setProperty('--px', '0px'); art.style.setProperty('--py', '0px'); });
  }
}

// bfcache: a back-navigation must not show a spinning button
window.addEventListener('pageshow', function (e) {
  if (!e.persisted) return;
  Array.prototype.forEach.call(document.querySelectorAll('.btn.is-busy'), function (b) {
    b.classList.remove('is-busy'); b.removeAttribute('aria-disabled');
    var f = b.closest('form'), l = b.querySelector('.go-t');
    if (f && l && b.dataset.idle) l.textContent = b.dataset.idle;
  });
});

auWire(document.querySelector('.pl'), false);
`;

/** Content hash for cache-busting the script URL whenever it changes. */
export const SCRIPT_VERSION = (() => {
  let h = 5381;
  for (let i = 0; i < SCRIPT.length; i++) h = ((h << 5) + h + SCRIPT.charCodeAt(i)) >>> 0;
  return h.toString(36);
})();
