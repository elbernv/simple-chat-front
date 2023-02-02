axios.defaults.baseURL = config.apiUrl;
axios.defaults.validateStatus = function (status) {
  return status >= 200 && status < 600;
};

const selectPicture = (event) => {
  const fileInput = document.getElementById('picture-input');
  fileInput.click();
};

const updatePicture = async (event) => {
  const fileInput = event.target;
  const picture = fileInput.files[0];
  const formData = new FormData();

  formData.append('picture', picture, picture.name);

  const response = await axios.post('me/customer/picture', formData, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('access_token')}`,
    },
  });

  if (response.status === 401) {
    await refreshSession();
    updateMyProfile();
  }

  document.getElementById('my-picture').src = response.data.url;
  document.getElementById('user-image').src = response.data.url;

  showAlert('success', 'Image updated', 'my-profile-picture-modal');

  return;
};

const deletePicture = async (event) => {
  const response = await axios.delete('me/customer/picture', {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('access_token')}`,
    },
  });

  if (response.status === 401) {
    await refreshSession();
    deletePicture();
  }

  document.getElementById('my-picture').src = response.data.url;
  document.getElementById('user-image').src = response.data.url;

  showAlert('success', 'Image deleted', 'my-profile-picture-modal');
};

const myProfilePictureMain = () => {
  const fileInput = document.getElementById('picture-input');

  fileInput.addEventListener('change', (event) => {
    updatePicture(event);
  });
};

myProfilePictureMain();
