import { GameDataEngine } from "./dataEngine.js"
import { UIManager } from "./uiManager.js"

class GameManager {
    #room = null

    #gameDataEngine = null
    #uiManager = null

    #colors = ['#FF8100', '#00E87D', '#005EFF', '#FFC900', '#FF00AA', '#00D9FF'];

    constructor(room) {
        this.#room = room

        this.#setupDataEngine(room)
        this.#setupUIManager(room)

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
    }

    handleAssignPlanet = (planetId, userId) => {
        this.#gameDataEngine.assignPlanetToUser(planetId, userId)
    }

    #setupDataEngine = (room) => {
        this.#gameDataEngine = new GameDataEngine(room)
        this.#gameDataEngine.logger = this.#log
    }

    #setupUIManager = (room) => {
        this.#uiManager = new UIManager(room)
        this.#uiManager.handleBatchSend = (fromPlanetId, toPlanetId) => {
            this.#gameDataEngine.sendBatch(fromPlanetId, toPlanetId)
        }
        this.#uiManager.startRenderLoop()
    }

    #log = (string) => {
        this.#uiManager.log(string)
    }
}

export { GameManager }