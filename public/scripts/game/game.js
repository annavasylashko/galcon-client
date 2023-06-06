import { GameManager } from "./gameManager.js"

async function setupGameEngine(room) {
    const store = {}

    store.room = await updateRoomInfo(room.id)

    if (store.room.state !== 'init') {
        Swal.fire({
            icon: 'error',
            title: "Can't join:",
            text: 'Game has already started!'
        });

        loadContent('rooms')

        return false
    }

    console.log("Updated room info:", store.room)

    store.username = localStorage.getItem('username')

    setupGameManager(store)
    setupSocketCommunication(store)
    setupGameUI(store)

    return true
}

async function updateRoomInfo(roomId) {
    const token = localStorage.getItem('token');

    const url = `http://localhost:8000/api/rooms/${roomId}`;

    const response = await axios.get(url, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })

    return response.data
}

function setupGameManager(store) {
    store.gameManager = new GameManager(store.room, store.username)

    store.gameManager.batchHandler = (batch) => {
        const data = {
            fromPlanetId: batch.fromPlanet.id, 
            toPlanetId: batch.toPlanet.id,
            count: batch.count,
            id: batch.id
        }

        store.socket.emit("BatchSendEvent", data)
    }
}

function setupGameUI(store) {
    const container = document.getElementById("game-container")
    container.innerHTML = ""

    const gameView = store.gameManager.getGameView()
    gameView.id = "game-view"
    container.appendChild(gameView)

    const logView = store.gameManager.getLogView()
    logView.id = "log-view"
    container.appendChild(logView)

    console.log("is owner:", store.room.owner.username === store.username)

    if (store.room.owner.username === store.username) {
        const startButton = document.createElement('div')
        startButton.classList = 'game-button'
        startButton.innerHTML = "Start Game"
        startButton.addEventListener('click', (e) => {
            console.log("starting game...")
            store.socket.emit("RoomStateChangeEvent", { state: "start" })
            startButton.style.display = 'none'
        })
        container.appendChild(startButton)
    }
}

function setupSocketCommunication(store) {
    const socket = io("http://localhost:8000/", {
        auth: {
            token: window.localStorage.getItem('token')
        },
        query: {
            roomId: store.room.id
        }
    });

    socket.on("connect_error", (event) => {
        console.log("Connection error catched: ", event);
        Swal.fire({
            icon: 'error',
            title: "Connection Error:",
            text: event.message
        });

        store.socket.disconnect()

        loadContent('rooms')
    });

    socket.on("ErrorEvent", (event) => {
        console.log("Logical error catched: ", event);
        Swal.fire({
            icon: 'error',
            title: "Logical error:",
            text: event.message
        });

        store.socket.disconnect()

        loadContent('rooms')
    });

    socket.on("RoomUserJoin", (event) => {
        console.log("RoomUserJoin", event);
        store.gameManager.handleRoomJoin(event.user)
    })

    socket.on("RoomStateChangeEvent", (event) => {
        console.log("RoomStateChangeEvent", event)

        if (event.state == "start") {
            store.gameManager.handleStartGame()

            return
        }

        if (event.state == "end") {
            store.gameManager.handleEndGame()
            store.socket.disconnect()

            const winner = store.gameManager.getWinner()

            Swal.fire({
                title: "Game ended!",
                text: `The winner is ${winner.username}`
            })
            .then((result) => {
                loadContent('rooms')
            })

            return
        }
    })

    socket.on("PlanetOccupiedEvent", (event) => {
        console.log("PlanetOccupiedEvent", event)
        store.gameManager.handleAssignPlanet(event.planetId, event.newOwnerId)
    })

    socket.on("BatchSendEvent", (event) => {
        console.log("BatchSendEvent", event)
        store.gameManager.handleBatchSend(event)
    })

    socket.on("BatchCollisionEvent", (event) => {
        console.log("BatchCollisionEvent", event)
        store.gameManager.handleBatchCollision(event.batchId, event.planetId, event.newPlanetUnits)
    })

    store.socket = socket
}

export { setupGameEngine }