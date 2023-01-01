const accessToken = localStorage.getItem('access_token');
axios.defaults.baseURL = 'http://localhost:7015';
axios.defaults.validateStatus = function (status) {
  return status >= 200 && status < 600;
};
axios.defaults.headers = {
  Authorization: `Bearer ${accessToken}`,
};

const signOut = async () => {
  try {
    const response = await axios.delete('/auth/logout');
  } catch (error) {
    console.log(error);
  } finally {
    localStorage.removeItem('access_token');
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

  if (response.status === 401) {
    window.location.href = '/sign-in.html';
  } else if (response.status === 200) {
    localStorage.setItem('access_token', response.data.access_token);
    localStorage.setItem('refresh_token', response.data.refresh_token);

    setTimeout(async () => {
      await refreshSession();
    }, response.data.expirationInSeconds * 1000);
  }
};

const validateSession = async () => {
  const response = await axios.get('/auth/validate');

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

const main = async () => {
  validateSession();
};

main();
