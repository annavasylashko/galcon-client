class GameDataEngine {
    #room;
    #updateInterval = null;

    #framesPerSecond = 30;

    constructor(room) {
        this.#room = room;
        this.#room.map.batches = [];
    }

    startUpdateLoop() {
        this.#updateInterval = setInterval(() => {
            this.#updateResources()
            this.#updateBatchPositions()
        }, 1000 / this.#framesPerSecond);
    }

    stopUpdateLoop() {
        clearInterval(this.#updateInterval);
    }

    assignPlanetToUser(planetId, userId) {
        const planet = this.#findPlanetById(planetId);
        const user = this.#findUserById(userId);

        if (planet && user) {
            planet.owner = user;

            if (this.logger) {
                this.logger(`Planet '${planetId}' is now under control of ${user.username}`)
            }
        } else {
            console.log("Planet or user does not exists")
        }
    }

    sendBatch(id, fromPlanetId, toPlanetId, count, newFromPlanetUnits) {
        const fromPlanet = this.#findPlanetById(fromPlanetId);
        const toPlanet = this.#findPlanetById(toPlanetId);

        const owner = fromPlanet?.owner;

        if (!fromPlanet || !toPlanet || !owner) {
            return
        }

        const batch = {
            id: id,
            owner: owner,
            fromPlanet: fromPlanet,
            toPlanet: toPlanet,
            count: count,
            position: {
                x: fromPlanet.x,
                y: fromPlanet.y
            }
        };

        // Subtract units from the source planet
        fromPlanet.units = newFromPlanetUnits

        // Add the batch to the room's batches array
        this.#room.map.batches.push(batch);
    }

    createBatch(fromPlanetId, toPlanetId) {
        const fromPlanet = this.#findPlanetById(fromPlanetId);
        const toPlanet = this.#findPlanetById(toPlanetId);
        const owner = fromPlanet?.owner;

        if (!fromPlanet || !toPlanet || !owner) {
            return
        }

        /// May implement interface for changing percentage later.
        const unitsToSend = Math.floor(fromPlanet.units * 0.5);

        if (unitsToSend <= 0) {
            return
        }

        const batch = {
            id: uuidv4(),
            fromPlanet: fromPlanet,
            toPlanet: toPlanet,
            count: unitsToSend,
        };

        return batch
    }

    collideBatch(batchId, planetId, newPlanetUnits) {
        const batchIndex = this.#room.map.batches.findIndex((b) => b.id === batchId);
        if (batchIndex !== -1) {
            this.#room.map.batches.splice(batchIndex, 1);
        }

        const planet = this.#findPlanetById(planetId)
        planet.units = newPlanetUnits
    }

    #updateResources() {
        const planets = this.#room.map.planets;
        planets.forEach((planet) => {
            if (!planet.owner) {
                return
            }

            const generatedUnits = planet.production / (60 * this.#framesPerSecond)
            planet.units += generatedUnits;
        });
    }

    #updateBatchPositions() {
        const batches = this.#room.map.batches;

        batches.forEach((batch) => {
            const fromPlanet = batch.fromPlanet
            const toPlanet = batch.toPlanet

            if (!fromPlanet || !toPlanet) {
                return
            }

            const distance = Math.sqrt(
                Math.pow(toPlanet.x - fromPlanet.x, 2) + Math.pow(toPlanet.y - fromPlanet.y, 2)
            );

            const speed = this.#room.map.settings.speed;
            const deltaX = ((toPlanet.x - fromPlanet.x) / distance) * (speed / this.#framesPerSecond);
            const deltaY = ((toPlanet.y - fromPlanet.y) / distance) * (speed / this.#framesPerSecond);

            batch.position.x += deltaX;
            batch.position.y += deltaY;

            // Check for collision with the target planet
            const collisionThreshold = 0.1; // Adjust this value as needed
            if (
                Math.abs(batch.position.x - toPlanet.x) <= collisionThreshold &&
                Math.abs(batch.position.y - toPlanet.y) <= collisionThreshold
            ) {
                // Handle collision logic
                batch.position.x = toPlanet.x
                batch.position.y = toPlanet.y
            }
        });
    }

    #findPlanetById(planetId) {
        const planets = this.#room.map.planets;
        return planets.find((planet) => planet.id === planetId);
    }

    #findUserById(userId) {
        const users = this.#room.users;
        return users.find((user) => user.id === userId);
    }
}

const uuidv4 = () => {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}

export { GameDataEngine };
