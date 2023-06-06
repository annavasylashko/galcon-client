import { setupGameEngine } from './game/game.js';

const showBlockInfo = async (block) => {
  console.log('Block Info:', block);
  if (await setupGameEngine(block)) {
    loadContent('game');
  }
};

let offset = 0;
const limit = 5;
const rooms = [];
let currentIndex = 0;

const handleAPIError = (error) => {
  if (error.response.status === 401) {
    Swal.fire({
      title: 'Unauthorized',
      text: 'You will be redirected to authorization screen',
    }).then(() => {
      window.location.href = 'auth.html';
    });
  } else {
    Swal.fire({
      icon: 'error',
      title: 'Error!',
      text: error.message,
    });
  }
};

const getRooms = () => {
  const token = localStorage.getItem('token');

  axios
    .get('http://localhost:8000/api/rooms', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        offset,
        limit,
      },
    })
    .then((response) => {
      rooms.push(...response.data);
      showRooms();
    })
    .catch(handleAPIError);
};

const showRooms = () => {
  const roomsContainer = document.getElementById('rooms-container');
  roomsContainer.innerHTML = '';

  const currentRooms = rooms.slice(currentIndex, currentIndex + limit);

  currentRooms.forEach((room, index) => {
    const roomBlock = document.createElement('div');
    roomBlock.className = 'room-block';

    const roomName = document.createElement('h2');
    roomName.textContent = `${room.owner.username}#${room.id}`;
    roomBlock.appendChild(roomName);

    const usersList = document.createElement('ul');
    room.users.forEach((user) => {
      const userItem = document.createElement('li');
      userItem.textContent = `User: ${user.username}`;
      usersList.appendChild(userItem);
    });
    roomBlock.appendChild(usersList);

    // Додайте обробник onClick для кожного блоку
    roomBlock.onclick = async () => {
      await showBlockInfo(room);
    };

    roomsContainer.appendChild(roomBlock);
  });

  updateNavigationButtons();
};

const updateNavigationButtons = () => {
  const prevButton = document.querySelector('.prevButton');
  const nextButton = document.querySelector('.nextButton');

  if (currentIndex === 0) {
    prevButton.disabled = true;
    prevButton.classList.add('disabled');
  } else {
    prevButton.disabled = false;
    prevButton.classList.remove('disabled');
  }

  if (currentIndex + limit >= rooms.length) {
    nextButton.disabled = true;
    nextButton.classList.add('disabled');
  } else {
    nextButton.disabled = false;
    nextButton.classList.remove('disabled');
  }
};

const showNextRooms = () => {
  currentIndex += limit;
  if (currentIndex >= rooms.length) {
    currentIndex = 0;
  }
  showRooms();
};

const showPrevRooms = () => {
  currentIndex -= limit;
  if (currentIndex < 0) {
    currentIndex = rooms.length - limit;
  }
  showRooms();
};

document.querySelector('.nextButton').addEventListener('click', showNextRooms);
document.querySelector('.prevButton').addEventListener('click', showPrevRooms);

// Отримання початкових 5 елементів при завантаженні сторінки
getRooms();

const getRoomById = (roomId) => {
  const token = localStorage.getItem('token');

  const url = `http://localhost:8000/api/rooms/${roomId}`;

  axios
    .get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((response) => {
      console.log('Room by id:', response.data);
      if (!response.data) {
        Swal.fire({
          icon: 'warning',
          title: 'Warning!',
          text: 'Room not found',
        });
      }
    })
    .catch(handleAPIError);
};

const createNewRoom = () => {
  const token = localStorage.getItem('token');

  const url = 'http://localhost:8000/api/rooms';

  axios
    .post(url, JSON.parse(localStorage.getItem('roomSettings')), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then(() => {
      window.location.reload()
    })
    .catch(handleAPIError);
};

document
  .querySelector('.createRoomButton')
  .addEventListener('click', createNewRoom);
