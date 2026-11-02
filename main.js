// ── Section tab switching (about / projects / work / contact) ────────────
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('.section');
const sectionOrder = ['about', 'projects', 'work', 'contact'];

let currentIndex = 0;

function showSection(id) {
  sections.forEach(s => s.classList.add('hidden'));
  navLinks.forEach(l => l.classList.remove('active'));

  const target = document.getElementById(id);
  if (target) target.classList.remove('hidden');

  const activeLink = document.querySelector(`.nav-link[href="#${id}"]`);
  if (activeLink) activeLink.classList.add('active');

  currentIndex = sectionOrder.indexOf(id);
}

navLinks.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const id = link.getAttribute('href').replace('#', '');
    showSection(id);
  });
});

// ── Arrow navigation (← ✦ →) ─────────────────────────────────────────────
document.getElementById('prev-btn').addEventListener('click', () => {
  const prev = (currentIndex - 1 + sectionOrder.length) % sectionOrder.length;
  showSection(sectionOrder[prev]);
});

document.getElementById('next-btn').addEventListener('click', () => {
  const next = (currentIndex + 1) % sectionOrder.length;
  showSection(sectionOrder[next]);
});

// ── Keyboard arrow navigation ─────────────────────────────────────────────
document.addEventListener('keydown', e => {
  if (e.key === 'ArrowRight') document.getElementById('next-btn').click();
  if (e.key === 'ArrowLeft')  document.getElementById('prev-btn').click();
});

// ── Start on about ────────────────────────────────────────────────────────
showSection('about');
