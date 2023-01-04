axios.defaults.baseURL = 'http://localhost:7015';
axios.defaults.validateStatus = function (status) {
  return status >= 200 && status < 600;
};

const getMyinfo = async (event = null) => {
  const response = await axios.get('/me', {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('access_token')}`,
    },
  });
  console.log(response);

  if (response.status === 401) {
    const refreshedSession = await refreshSession();
    getMyinfo();

    return;
  }

  document.getElementById('first-name').value = response.data.name;
  document.getElementById('last-name').value = response.data.lastName;
  document.getElementById('email').value = response.data.session.email;
};
