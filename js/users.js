axios.defaults.baseURL = config.apiUrl;
axios.defaults.validateStatus = function (status) {
  return status >= 200 && status < 600;
};

var activeUsers = [];

const getUsers = async () => {
  const response = await axios.get('customers', {
    params: { limit: 100 },
    headers: {
      Authorization: `Bearer ${localStorage.getItem('access_token')}`,
    },
  });

  if (response.status === 401) {
    await refreshSession();
    getUsers();
  }

  return response.data;
};

const listUsers = async () => {
  const users = await getUsers();
  const uiElement = document.getElementById('contacts');

  for (const user of users.data) {
    const li = document.createElement('li');
    li.classList.add('user-list');
    li.innerHTML = `
    <li id='user-${user.id}' onclick="openChat(${user.id})">
      <div class="d-flex bd-highlight">
        <div class="img_cont">
          <img
            src="${user.imgUrl}"
            class="rounded-circle user_img"
          />
          <span class="online_icon offline"></span>
        </div>
        <div class="user_info">
          <span>${user.name}</span>
          <p>${user.name} is offline</p>
        </div>
      </div>
    </li>`;

    uiElement.appendChild(li);
  }
};

const markActiveUsers = (activeUsersId) => {
  activeUsers = activeUsersId;
  for (const id of activeUsersId) {
    const li = document.getElementById(`user-${id}`);
    const onlineIcon = li.getElementsByTagName('span')[0];
    const onlineDescription = li.getElementsByTagName('p')[0];
    onlineIcon.classList.remove('offline');
    onlineDescription.innerText = onlineDescription.innerText.replace(
      'offline',
      'online',
    );

    if (
      id === parseInt(document.getElementById('chat-with-user-id').innerText)
    ) {
      document.getElementById('chat-with-status').classList.remove('offline');
    }
  }
};

const markUserAsOffline = (userId) => {
  const li = document.getElementById(`user-${userId}`);
  const onlineIcon = li.getElementsByTagName('span')[0];
  const onlineDescription = li.getElementsByTagName('p')[0];
  onlineIcon.classList.add('offline');
  onlineDescription.innerText = onlineDescription.innerText.replace(
    'online',
    'offline',
  );

  activeUsers = activeUsers.filter((id) => id !== parseInt(userId));

  if (
    userId === parseInt(document.getElementById('chat-with-user-id').innerText)
  ) {
    document.getElementById('chat-with-status').classList.add('offline');
  }
};

var socket = io(config.socketUrl, {
  query: { token: `${localStorage.getItem('access_token')}` },
});

socket.on('active-users', markActiveUsers);
socket.on('mark-user-as-offline', markUserAsOffline);

const usersMain = async () => {
  await listUsers();
};

document.addEventListener(
  'DOMContentLoaded',
  function () {
    usersMain();
  },
  false,
);
