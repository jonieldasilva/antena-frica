const slides = document.querySelectorAll('.slide');
const dotsEl = document.getElementById('dots');
let cur = 0;

// Build dots
slides.forEach((_,i) => {
  const d = document.createElement('div');
  d.className = 'dot' + (i===0?' active':'');
  d.onclick = () => goTo(i);
  dotsEl.appendChild(d);
});

function goTo(n) {
  slides[cur].classList.remove('active');
  dotsEl.children[cur].classList.remove('active');
  cur = (n + slides.length) % slides.length;
  slides[cur].classList.add('active');
  dotsEl.children[cur].classList.add('active');
}

function go(dir) { goTo(cur + dir); }

document.addEventListener('keydown', e => {
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') go(1);
  if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp') go(-1);
});

// Touch swipe
let tx = 0;
document.addEventListener('touchstart', e => tx = e.touches[0].clientX);
document.addEventListener('touchend',   e => {
  const dx = e.changedTouches[0].clientX - tx;
  if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
});

// Custom cursor
const cursor = document.getElementById('cursor');
const ring   = document.getElementById('cursorRing');
document.addEventListener('mousemove', e => {
  cursor.style.left = e.clientX + 'px';
  cursor.style.top  = e.clientY + 'px';
  setTimeout(() => {
    ring.style.left = e.clientX + 'px';
    ring.style.top  = e.clientY + 'px';
  }, 80);
});