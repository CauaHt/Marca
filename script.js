/* Personalização principal: altere apenas estes valores para configurar o projeto. */
const SITE_CONFIG = { whatsappNumber: '5500000000000', brand: 'Cauã Henrique' };

const whatsappMessage = (text) => `https://wa.me/${SITE_CONFIG.whatsappNumber}?text=${encodeURIComponent(text)}`;
const trackEvent = (name, params = {}) => {
  // Ponto de integração para GA4, GTM ou Meta Pixel. IDs não são inseridos por padrão.
  if (typeof window.gtag === 'function') window.gtag('event', name, params);
  document.dispatchEvent(new CustomEvent('site:event', { detail: { name, params } }));
};

const header = document.querySelector('.site-header');
const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.primary-nav');
menuToggle?.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(open));
});
nav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  nav.classList.remove('open');
  menuToggle?.setAttribute('aria-expanded', 'false');
}));
window.addEventListener('scroll', () => header?.classList.toggle('scrolled', window.scrollY > 15), { passive: true });

document.querySelectorAll('[data-whatsapp]').forEach((link) => {
  link.href = whatsappMessage('Olá! Encontrei seu site e gostaria de solicitar um orçamento para meu projeto.');
  link.addEventListener('click', () => trackEvent(link.dataset.event || 'click_whatsapp'));
});
document.querySelectorAll('[data-plan]').forEach((link) => link.addEventListener('click', () => {
  trackEvent('select_plan', { plan: link.dataset.plan });
  link.href = whatsappMessage(`Olá! Vi seu site e gostaria de saber mais sobre o plano ${link.dataset.plan}.`);
}));
document.querySelectorAll('[data-event]').forEach((element) => element.addEventListener('click', () => trackEvent(element.dataset.event)));

const currentYear = document.querySelector('#current-year');
if (currentYear) currentYear.textContent = new Date().getFullYear();
const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
  if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
}), { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));

document.querySelector('#budget-form')?.addEventListener('submit', (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const feedback = form.querySelector('.form-feedback');
  if (!form.checkValidity()) {
    form.querySelector(':invalid')?.focus();
    feedback.textContent = 'Confira os campos obrigatórios antes de continuar.';
    feedback.style.color = '#ff8f87';
    return;
  }
  const data = new FormData(form);
  const message = [
    'Olá! Encontrei seu site e gostaria de solicitar um orçamento.',
    '', `Nome: ${data.get('name')}`, `Empresa: ${data.get('company') || 'Não informado'}`,
    `WhatsApp: ${data.get('phone')}`, `Tipo de projeto: ${data.get('project')}`,
    `Mensagem: ${data.get('message') || 'Não informado'}`
  ].join('\n');
  trackEvent('submit_lead', { project: data.get('project') });
  feedback.textContent = 'Mensagem preparada. Abrindo o WhatsApp…';
  feedback.style.color = '#a8e063';
  window.open(whatsappMessage(message), '_blank', 'noopener');
});

document.querySelector('#projetos')?.addEventListener('mouseenter', () => trackEvent('view_portfolio'), { once: true });