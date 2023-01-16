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

function showAlert(type, message, mainContainerId = 'my-profile-modal') {
  if (document.getElementById('alert')) return;

  const mainContainer = document.getElementById(mainContainerId);

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

const loadMyinfo = async (event = null) => {
  const myInfo = await getMyInfo();

  document.getElementById('first-name').value = myInfo.name;
  document.getElementById('last-name').value = myInfo.lastName;
  document.getElementById('email').value = myInfo.session.email;
  document.getElementById('my-picture').src = myInfo.imgUrl;
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
    ...(password.value && { password: password.value }),
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

  document.getElementById('user-name').innerText = response.data.name;
  document.getElementById(
    'online-span-user',
  ).innerText = `${response.data.name} is online`;
  password.value = '';

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
