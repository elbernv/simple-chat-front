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

function showAlert(type, message) {
  if (document.getElementById('alert')) return;

  const mainContainer = document.getElementById('my-profile-modal');

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
  <strong>${message}<strong/>
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

const getMyinfo = async (event = null) => {
  const response = await axios.get('/me/customer', {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('access_token')}`,
    },
  });

  if (response.status === 401) {
    const refreshedSession = await refreshSession();
    getMyinfo();

    return;
  }

  document.getElementById('first-name').value = response.data.name;
  document.getElementById('last-name').value = response.data.lastName;
  document.getElementById('email').value = response.data.session.email;
  document.getElementById('password').value = response.data.session.password;
  document.getElementById('my-picture').src = response.data.imgUrl;
};

const showFieldsWithErrors = (messages) => {
  const name = document.getElementById('first-name');
  const lastName = document.getElementById('last-name');
  const password = document.getElementById('password');

  for (const message of messages) {
    if (message.includes('name')) {
      document.getElementById('name-invalid-feedback').innerText = message;
      name.classList.add('is-invalid');
      continue;
    }

    if (message.includes('lastName')) {
      document.getElementById('last-name-invalid-feedback').innerText = message;
      lastName.classList.add('is-invalid');
      continue;
    }

    if (message.includes('password')) {
      document.getElementById('password-invalid-feedback').innerText = message;
      password.classList.add('is-invalid');
      continue;
    }
  }
};

const updateMyProfile = async (event = null) => {
  const name = document.getElementById('first-name');
  const lastName = document.getElementById('last-name');
  const password = document.getElementById('password');

  name.classList.remove('is-invalid');
  lastName.classList.remove('is-invalid');
  password.classList.remove('is-invalid');

  const payload = {
    name: name.value,
    lastName: lastName.value,
    password: password.value,
  };

  const response = await axios.patch('me/customer', payload, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('access_token')}`,
    },
  });

  if (response.status === 400) {
    showFieldsWithErrors(response.data.message);
    showAlert('danger', 'Error in some fields');
    return;
  }

  if (response.status === 401) {
    const refreshedSession = await refreshSession();
    updateMyProfile();
  }

  showAlert('success', 'Profile successfully updated');

  return;
};

const enterKeyPress = (event) => {
  if (event.key !== 'Enter') {
    return;
  }

  if (event.target.id === 'first-name') {
    document.getElementById('last-name').focus();
  } else if (event.target.id === 'last-name') {
    document.getElementById('password').focus();
  } else {
    document.getElementById('update-me-button').click();
  }
};
