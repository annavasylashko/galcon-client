const getRooms = () => {
    const token = localStorage.getItem('token');

    if (token) {
        axios.get('http://localhost:8000/api/rooms', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }).then((response) => {
            console.log("Rooms:", response.data);
        }).catch((error) => {
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: error.message
            });
        })
    }
};

getRooms()

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

// getRoomById(3);

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
        }).catch((error) => {
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: error.message
            });
        });
    }
};

// createNewRoom();