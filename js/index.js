axios.defaults.baseURL = 'http://192.168.1.109:7015';
axios.defaults.validateStatus = function (status) {
  return status >= 200 && status < 600;
};

const signOut = async () => {
  try {
    const headers = {
      Authorization: `Bearer ${localStorage.getItem('access_token')}`,
    };
    const response = await axios.delete('/auth/logout', { headers });
  } catch (error) {
    console.log(error);
  } finally {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    window.location.href = '/sign-in.html';
  }
};

const refreshSession = async () => {
  const accessToken = localStorage.getItem('access_token');
  const refreshToken = localStorage.getItem('refresh_token');

  const response = await axios.post('/auth/refresh', {
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  if (response.status !== 200) {
    window.location.href = '/sign-in.html';
  }

  localStorage.setItem('access_token', response.data.access_token);
  localStorage.setItem('refresh_token', response.data.refresh_token);

  setTimeout(async () => {
    await refreshSession();
  }, response.data.expirationInSeconds * 1000);

  return;
};

const validateSession = async () => {
  const headers = {
    Authorization: `Bearer ${localStorage.getItem('access_token')}`,
  };
  const response = await axios.get('/auth/validate', { headers });

  if (response.status === 401) {
    return await refreshSession();
  } else if (response.status === 200) {
    setTimeout(async () => {
      await refreshSession();
    }, response.data.expirationInSeconds * 1000);

    return;
  }

  return;
};

const configureDropDownMenu = async () => {
  const dropDownMenuElement = document.getElementById('a');
  const dropDownMenu = new bootstrap.Dropdown(dropDownMenuElement, {
    autoClose: true,
  });
};

const getMyInfo = async () => {
  const response = await axios.get('/me/customer', {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('access_token')}`,
    },
  });

  if (response.status === 401) {
    await refreshSession();
    getMyInfo();

    return;
  }

  return response.data;
};

const loadMyBasicInfo = async () => {
  const myInfo = await getMyInfo();

  document.getElementById('user-image').src = myInfo.imgUrl;
  document.getElementById('user-name').innerText = myInfo.name;
  document.getElementById(
    'online-span-user',
  ).innerText = `${myInfo.name} is online`;

  return;
};

const main = async () => {
  await validateSession();
  const mainContainer = document.getElementById('main-container');

  mainContainer.addEventListener('click', configureDropDownMenu);

  await loadMyBasicInfo();
};

main();
