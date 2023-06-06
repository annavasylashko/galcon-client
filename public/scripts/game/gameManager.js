import { GameDataEngine } from "./dataEngine.js"
import { UIManager } from "./uiManager.js"

class GameManager {
    #room = null
    #currentUser = null

    #gameDataEngine = null
    #uiManager = null

    #colors = ['#FF8100', '#00E87D', '#005EFF', '#FFC900', '#FF00AA', '#00D9FF'];

    constructor(room, currentUser) {
        this.#room = room
        this.#currentUser = currentUser

        this.#setupDataEngine(room)
        this.#setupUIManager(room, currentUser)

        room.users.forEach(u => {
            this.handleRoomJoin(u, true)
        });
    }

    getGameView = () => {
        return this.#uiManager.getGameView()
    }

    getLogView = () => {
        return this.#uiManager.getLogView()
    }

    handleStartGame = () => {
        this.#gameDataEngine.startUpdateLoop()
        this.#log("GAME STARTED!")
    }

    handleEndGame = () => {
        this.#gameDataEngine.stopUpdateLoop()
        this.#uiManager.stopRenderLoop()
        this.#log("GAME ENDED!")
    }

    handleRoomJoin = (user, initial = false) => {
        const users = this.#room.users

        if (users.length >= 6) {
            return
        }

        if (!initial) {
            users.push(user)
        }

        user.color = this.#colors[users.length - 1]

        this.#log(`User: ${user.username} joined!`)

        if (this.#currentUser === user.username) {
            this.#log(`<p style="color: ${user.color}">THIS WILL BE YOUR COLOR!</p>`)
        }
    }

    handleRoomLeave = (user) => {
        const users = this.#room.users
        const index = users.indexOf(user)

        this.#log(`User: ${user.username} left!`)

        users.splice(index, 1)
    }

    handleAssignPlanet = (planetId, userId) => {
        this.#gameDataEngine.assignPlanetToUser(planetId, userId)
    }

    handleBatchSend = (batch) => {
        this.#gameDataEngine.sendBatch(
            batch.id,
            batch.fromPlanetId,
            batch.toPlanetId,
            batch.count,
            batch.newFromPlanetUnits,
            { x: batch.fromX, y: batch.fromY },
            { x: batch.toX, y: batch.toY }
        )
    }

    handleBatchCollision = (batchId, planetId, newPlanetUnits) => {
        this.#gameDataEngine.collideBatch(batchId, planetId, newPlanetUnits)
    }

    #setupDataEngine = (room) => {
        this.#gameDataEngine = new GameDataEngine(room)
        this.#gameDataEngine.logger = this.#log
    }

    #setupUIManager = (room, currentUser) => {
        this.#uiManager = new UIManager(room, currentUser)
        this.#uiManager.handleBatchSend = (fromPlanetId, toPlanetId) => {
            const batch = this.#gameDataEngine.createBatch(fromPlanetId, toPlanetId)

            this.batchHandler(batch)
        }
        this.#uiManager.startRenderLoop()
    }

    #log = (string) => {
        this.#uiManager.log(string)
    }
}

export { GameManager }