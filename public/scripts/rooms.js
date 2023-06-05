const showBlockInfo = (block) => {
    console.log("Block Info:", block);
};

let offset = 0;
const limit = 5;
const rooms = [];
let currentIndex = 0;

const getRooms = () => {
    const token = localStorage.getItem('token');

    if (token) {
        axios
            .get('http://localhost:8000/api/rooms', {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                params: {
                    offset,
                    limit
                }
            })
            .then((response) => {
                rooms.push(...response.data);
                showRooms();
            })
            .catch((error) => {
                Swal.fire({
                    icon: 'error',
                    title: 'Error!',
                    text: error.message
                });
            });
    }
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
            userItem.textContent = `User: ${user.user}`;
            usersList.appendChild(userItem);
        });
        roomBlock.appendChild(usersList);

        // Додайте обробник onClick для кожного блоку
        roomBlock.onclick = () => {
            showBlockInfo(room);
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
    } else {
        prevButton.disabled = false;
    }

    if (currentIndex + limit >= rooms.length) {
        nextButton.disabled = true;
    } else {
        nextButton.disabled = false;
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

    if (token) {
        const url = `http://localhost:8000/api/rooms/${roomId}`;

        axios.get(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }).then((response) => {
            console.log("Room by id:", response.data);
            if (!response.data) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Warning!',
                    text: 'Room not found'
                });
            }
        }).catch((error) => {
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: error.message
            });
        });
    }
};

const createNewRoom = () => {
    const token = localStorage.getItem('token');

    if (token) {
        const url = 'http://localhost:8000/api/rooms';

        const roomSettings = {
            settings: {
                planetCount: 10,
                width: 12,
                height: 5,
                minPlanetProduction: 30,
                maxPlanetProduction: 100,
                speed: 0.03,
                distanceOffset: 0.3
            }
        };

        axios.post(url, roomSettings, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }).then((response) => {
            console.log("New Room:", response.data);
            location.reload()
        }).catch((error) => {
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: error.message
            });
        });
    }
};

document.querySelector('.createRoomButton').addEventListener('click', createNewRoom)