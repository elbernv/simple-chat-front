axios.defaults.baseURL = 'http://192.168.1.109:7015';
axios.defaults.validateStatus = function (status) {
  return status >= 200 && status < 600;
};

const alertsTimeOuts = [];

function closeAlert(alertId) {
  const bsAlert = new bootstrap.Alert(`#${alertId}`);

  if (!bsAlert) return;

  bsAlert.close();
}

function showAlert(type) {
  if (document.getElementById('alert')) return;

  const mainContainer = document.getElementById('signup-form');

  const newDiv = document.createElement('div');

  newDiv.classList.add(
    'text-center',
    'alert',
    `alert-${type}`,
    'alert-dismissible',
    'fade',
    'show',
  );

  newDiv.setAttribute('role', 'alert');
  newDiv.setAttribute('id', 'alert');

  newDiv.innerHTML = `
  <strong>error in some fields.<strong/>
  <button
    type="button"
    class="btn-close"
    data-bs-dismiss="alert"
    aria-label="Close"
  ></button>
  `;

  mainContainer.appendChild(newDiv);

  for (const timeout of alertsTimeOuts) {
    clearTimeout(timeout);
  }

  alertsTimeOuts.push(
    setTimeout(() => {
      closeAlert('alert');
    }, '4000'),
  );
}

const validatePassword = () => {
  const password = document.getElementById('password');

  if (!password.value || password.value.length < 8) {
    password.classList.add('is-invalid');
    return false;
  }

  password.classList.remove('is-invalid');
  password.classList.add('is-valid');

  return true;
};

const validateConfirmPassword = (event = null) => {
  const password = document.getElementById('password');
  const confirmPassword = document.getElementById('confirm-password');

  if (validatePassword() && password.value === confirmPassword.value) {
    confirmPassword.classList.remove('is-invalid');
    confirmPassword.classList.add('is-valid');

    return true;
  } else {
    confirmPassword.classList.remove('is-valid');
    confirmPassword.classList.add('is-invalid');

    return false;
  }
};

const clearConfirmPassword = (event) => {
  const confirmPassword = document.getElementById('confirm-password');

  confirmPassword.value = '';
  confirmPassword.classList.remove('is-valid');
  confirmPassword.classList.add('is-invalid');
};

const showFieldsWithErrors = (messages) => {
  const name = document.getElementById('name');
  const email = document.getElementById('email');

  for (const message of messages) {
    if (message.includes('name')) {
      document.getElementById('name-invalid-feedback').innerText = message;
      name.classList.add('is-invalid');
      continue;
    }
    if (message.includes('email')) {
      document.getElementById('email-invalid-feedback').innerText = message;
      email.classList.add('is-invalid');
      continue;
    }
  }
};

const signUp = async (event) => {
  event.preventDefault();

  if (!validateConfirmPassword()) {
    showAlert('danger');
    return;
  }

  const name = document.getElementById('name');
  const email = document.getElementById('email');
  const password = document.getElementById('password');

  const payload = {
    name: name.value,
    email: email.value,
    password: password.value,
  };

  const response = await axios.post('/customers', payload);

  if (response.status === 400) {
    showFieldsWithErrors(response.data.message);
    showAlert('danger');
    return;
  }

  localStorage.setItem('access_token', response.data.access_token);
  localStorage.setItem('refresh_token', response.data.refresh_token);
  window.location.href = '/index.html';
};

const enterKeyPress = (event) => {
  if (event.key === 'Enter') {
    document.getElementById('login-btn').click();
  }
};
