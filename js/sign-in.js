axios.defaults.baseURL = 'http://localhost:7015';
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

  const mainContainer = document.getElementById('main-container');

  mainContainer.innerHTML += `
  <div class="text-center alert alert-${type} alert-dismissible fade show" role="alert" id="alert">
    <strong>Incorrect username or password.<strong/>
    <button
      type="button"
      class="btn-close"
      data-bs-dismiss="alert"
      aria-label="Close"
    ></button>
  </div>
  `;

  for (const timeout of alertsTimeOuts) {
    clearTimeout(timeout);
  }

  alertsTimeOuts.push(
    setTimeout(() => {
      closeAlert('alert');
    }, '4000'),
  );
}

async function login(event) {
  const emailOrusername = document.getElementById('email-or-username');
  const password = document.getElementById('password');
  const payload = {
    username: emailOrusername.value,
    password: password.value,
  };

  const response = await axios.post('/auth/login', payload);

  if (response.status === 401) {
    emailOrusername.classList.add('is-invalid');
    password.classList.add('is-invalid');
    showAlert('danger');

    return;
  }

  sessionStorage.setItem('access_token', response.data.access_token);
  window.location.href = '/index.html';
}

function enterKeyPress(event) {
  if (event.key === 'Enter') {
    document.getElementById('login-btn').click();
  }
}
