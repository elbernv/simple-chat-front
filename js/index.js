const accessToken = sessionStorage.getItem('access_token');
axios.defaults.baseURL = 'http://localhost:7015';
axios.defaults.validateStatus = function (status) {
  return status >= 200 && status < 600;
};
axios.defaults.headers = {
  Authorization: `Bearer ${accessToken}`,
};

const signOut = async () => {
  const response = await axios.delete('/auth/logout');
  sessionStorage.removeItem('access_token');

  window.location.href = '/sign-in.html';
};
