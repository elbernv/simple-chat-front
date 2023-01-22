axios.defaults.baseURL = 'http://192.168.1.109:7015';
axios.defaults.validateStatus = function (status) {
  return status >= 200 && status < 600;
};

const getUserReceiverInfo = async (id) => {
  const response = await axios.get(`customers/${id}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('access_token')}`,
    },
  });

  if (response.status === 401) {
    await refreshSession();
    getUserReceiverInfo();

    return;
  }

  return response.data;
};

const getMessages = async (receiverId) => {
  const response = await axios.get(`chat/messages`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('access_token')}`,
    },
    params: {
      userReceiverId: receiverId,
    },
  });

  if (response.status === 401) {
    await refreshSession();
    getUserReceiverInfo();

    return;
  }

  return response.data;
};

const openChat = async (userId) => {
  const userReceiverInfo = await getUserReceiverInfo(userId);
  const messages = await getMessages(userId);
  const myInfo = await getMyInfo();
  const messagesContainer = document.getElementById('messages-container');

  messagesContainer.innerHTML = ``;

  if (activeUsers.includes(userId)) {
    document.getElementById('chat-with-status').classList.remove('offline');
  } else {
    document.getElementById('chat-with-status').classList.add('offline');
  }

  document.getElementById('chat-with-user-id').innerText = userReceiverInfo.id;

  document.getElementById(
    'chat-with',
  ).innerText = `Chat with ${userReceiverInfo.name}`;
  document.getElementById('image-chat-with').src = userReceiverInfo.imgUrl;

  for (const message of messages) {
    if (message.type === 'sent') {
      const divElement = document.createElement('div');
      divElement.classList.add('d-flex', 'justify-content-start', 'mb-4');

      divElement.innerHTML = `
        <div class="img_cont_msg">
          <img
            src="${myInfo.imgUrl}"
            class="rounded-circle user_img_msg"
          />
        </div>
        <div class="msg_cotainer">
          ${message.message}
          <span class="msg_time">8:40 AM, Today</span>
        </div>
      `;

      messagesContainer.appendChild(divElement);
      continue;
    }

    const divElement = document.createElement('div');
    divElement.classList.add('d-flex', 'justify-content-end', 'mb-4');

    divElement.innerHTML = `
      <div class="msg_cotainer_send">
        ${message.message}
        <span class="msg_time_send">8:55 AM, Today</span>
      </div>
      <div class="img_cont_msg">
        <img
          src="${userReceiverInfo.imgUrl}"
          class="rounded-circle user_img_msg"
        />
      </div>
      `;

    messagesContainer.appendChild(divElement);

    continue;
  }
};
