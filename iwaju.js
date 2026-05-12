const SUBSCRIPTION_ENDPOINT = 'https://iwaju-backend.onrender.com/api/subscribe';

function validateEmail(value) {
  const suspicious = /[<>"'`\(\)\{\}\[\];]/;
  if (!value || value.trim() === '') {
    return { valid: false, type: 'empty' };
  }
  if (suspicious.test(value)) {
    return { valid: false, type: 'injection' };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value.trim())) {
    return { valid: false, type: 'invalid' };
  }
  return { valid: true };
}

function getErrorMessage(type) {
  const messages = {
    empty: 'Veuillez entrer une adresse e-mail.',
    injection: '⚠ Contenu suspect détecté. Seul un e-mail valide est accepté.',
    invalid: 'Format d\'adresse e-mail invalide. Exemple: prenom@domaine.com'
  };
  return messages[type] || 'Erreur lors de la soumission.';
}

function clearStatus(error, success, input) {
  if (error) {
    error.textContent = '';
    error.style.display = 'none';
  }
  if (success) {
    success.textContent = '';
    success.style.display = 'none';
  }
  if (input) {
    input.style.outline = '';
    input.setAttribute('aria-invalid', 'false');
  }
}

function showError(error, message, input) {
  if (!error) return;
  error.textContent = message;
  error.style.display = 'block';
  if (input) {
    input.setAttribute('aria-invalid', 'true');
    input.style.outline = '2px solid #D85A30';
  }
}

function showSuccess(success, row, message) {
  if (!success || !row) return;
  row.style.display = 'none';
  success.textContent = message;
  success.style.display = 'block';
  success.style.padding = '1.25rem';
  success.style.background = '#E1F5EE';
  success.style.borderRadius = '14px';
  success.style.color = '#085041';
  success.style.fontSize = '0.9rem';
  success.style.fontWeight = '500';
  success.style.lineHeight = '1.6';
}

async function sendSubscription(email) {
  if (!SUBSCRIPTION_ENDPOINT) {
    return { success: true };
  }

  const response = await fetch(SUBSCRIPTION_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.message || 'Impossible d\'enregistrer l\'adresse.');
  }

  return response.json();
}

async function handleSubscriptionForm(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const input = form.querySelector('input[type="email"]');
  const row = form.querySelector('.form-row');
  const error = document.getElementById(form.id === 'subscription-form-1' ? 'form-error-1' : 'form-error-2');
  const success = document.getElementById(form.id === 'subscription-form-1' ? 'form-success-1' : 'form-success-2');

  clearStatus(error, success, input);

  const validation = validateEmail(input.value);
  if (!validation.valid) {
    showError(error, getErrorMessage(validation.type), input);
    input.focus();
    return;
  }

  try {
    await sendSubscription(input.value.trim());
    showSuccess(success, row, '✓ Tu es sur la liste. On te contacte dès le lancement — et ton cours offert t\'attend.');
  } catch (sendError) {
    showError(error, sendError.message || 'Une erreur est survenue. Réessaye plus tard.', input);
  }
}

function initSubscriptionForms() {
  document.querySelectorAll('.email-form').forEach((form) => {
    form.addEventListener('submit', handleSubscriptionForm);
    const input = form.querySelector('input[type="email"]');
    if (input) {
      const error = document.getElementById(form.id === 'subscription-form-1' ? 'form-error-1' : 'form-error-2');
      input.addEventListener('input', () => clearStatus(error, null, input));
    }
  });
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
initSubscriptionForms();