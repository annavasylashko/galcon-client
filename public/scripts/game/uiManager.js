import { PIXI } from './pixi.min.js';

class UIManager {
    #room
    #app

    #planetGraphics = new Map();
    #batchGraphics = new Map();
    #selectedPlanet = null;

    #logView = document.createElement('div')

    #scaling = 100

    constructor(room) {
        this.#room = room;

        this.#app = new PIXI.Application({
            width: room.settings.width * this.#scaling,
            height: room.settings.height * this.#scaling,
            backgroundAlpha: 0,
            resolution: window.devicePixelRatio || 1,
        });
    }

    getGameView = () => {
        return this.#app.view;
    };

    getLogView = () => {
        return this.#logView
    };

    log = (string) => {
        this.#logView.innerHTML += `<p>${string}</p>`
        this.#logView.scroll({ top: this.#logView.scrollHeight, behavior: 'smooth' });
    }

    startRenderLoop = () => {
        this.#app.ticker.add(this.#render);
    }

    stopRenderLoop = () => {
        this.#app.ticker.remove(this.render);
    };

    #render = () => {
        const planets = this.#room.map.planets;
        const batches = this.#room.map.batches;

        // Render or update planets
        this.#renderPlanets(planets)
        this.#renderBatches(batches)
    }

    #renderPlanets = (planets) => {
        planets.forEach((planet) => {
            let graphics = this.#planetGraphics.get(planet.id);

            // If the graphics object doesn't exist, create a new one
            if (!graphics) {
                graphics = new PIXI.Container();
                this.#planetGraphics.set(planet.id, graphics);
                this.#app.stage.addChild(graphics);

                const planetGraphics = new PIXI.Graphics();
                const highlightGraphics = new PIXI.Graphics();

                graphics.addChild(planetGraphics);
                graphics.addChild(highlightGraphics);

                graphics.eventMode = 'static';

                graphics.on('pointerdown', () => this.#handlePlanetSelection(planet));
                graphics.on('pointerover', () => graphics.highlighted = true);
                graphics.on('pointerout', () => graphics.highlighted = false);
            }

            const planetGraphics = graphics.getChildAt(0);
            const highlightGraphics = graphics.getChildAt(1);

            // Clear the graphics objects
            planetGraphics.clear();
            highlightGraphics.clear();

            const planetColor = planet.owner ? planet.owner.color : 0x999999;

            // Draw the glowing effect
            const glowRadius = planet.radius * 0.1; // Adjust the glow radius as needed

            for (let i = 0; i < 5; i++) {
                const glowColor = planetColor;
                const glowAlpha = (i + 1) / (5 * 10); // Adjust the glow alpha values for a fading effect

                planetGraphics.beginFill(glowColor, glowAlpha);
                planetGraphics.drawCircle(
                    planet.x * this.#scaling,
                    planet.y * this.#scaling,
                    (planet.radius + i * glowRadius) * this.#scaling
                );
                planetGraphics.endFill();
            }

            // Draw the planet circle
            planetGraphics.beginFill(planetColor);
            planetGraphics.lineStyle(0.1 * this.#scaling, 0xffffff); // Set the white outline
            planetGraphics.drawCircle(
                planet.x * this.#scaling,
                planet.y * this.#scaling,
                planet.radius * this.#scaling
            );
            planetGraphics.endFill();

            let highlightColor = '#00000000'

            if (this.#selectedPlanet && planet.id == this.#selectedPlanet.id) {
                highlightColor = '#FFFFFFFF'
            } else if (graphics.highlighted) {
                highlightColor = '#FFFFFF88'
            }

            // Draw the highlight circle
            highlightGraphics.lineStyle(
                0.1 * this.#scaling,
                highlightColor
            );
            highlightGraphics.drawCircle(
                planet.x * this.#scaling,
                planet.y * this.#scaling,
                (planet.radius + 0.3) * this.#scaling // Adjust the highlight radius as needed
            );

            // Render or update batch count text
            let text = graphics.children[2]; // Get the text object from the graphics

            // If the text object doesn't exist, create a new one
            if (!text) {
                text = new PIXI.Text(planet.units, {
                    fontFamily: "Space Mono",
                    fontSize: 0.25 * this.#scaling,
                    fill: '#000000',
                });
                text.anchor.set(0.5);
                graphics.addChild(text);
            }

            // Update the text properties
            text.text = planet.units;
            text.x = planet.x * this.#scaling;
            text.y = planet.y * this.#scaling;
        });
    };


    #renderBatches = (batches) => {
        // Store the IDs of the batches to be removed
        const batchIdsToRemove = [];

        // Iterate over existing batch graphics
        this.#batchGraphics.forEach((_, batchId) => {
            // Check if the batch ID exists in the input batches
            const batchExists = batches.some((batch) => batch.id === batchId);

            // If the batch doesn't exist in the input batches, mark it for removal
            if (!batchExists) {
                batchIdsToRemove.push(batchId);
            }
        });

        // Remove the batch graphics that are no longer in the input batches
        batchIdsToRemove.forEach((batchId) => {
            const graphics = this.#batchGraphics.get(batchId);
            this.#app.stage.removeChild(graphics);
            this.#batchGraphics.delete(batchId);
        });

        // Render or update the remaining batches
        batches.forEach((batch) => {
            let graphics = this.#batchGraphics.get(batch.id);

            // If the graphics object doesn't exist, create a new one
            if (!graphics) {
                graphics = new PIXI.Graphics();
                this.#batchGraphics.set(batch.id, graphics);
                this.#app.stage.addChild(graphics);
            }

            // Set the batch properties
            graphics.clear();
            graphics.beginFill(batch.owner.color);
            graphics.lineStyle(0.05 * this.#scaling, 0xffffff); // Set the white outline
            graphics.drawCircle(
                batch.position.x * this.#scaling,
                batch.position.y * this.#scaling,
                0.2 * this.#scaling // Adjust the radius of the circle as needed
            );
            graphics.endFill();

            // Render or update batch count text
            let text = graphics.children[0]; // Get the text object from the graphics

            // If the text object doesn't exist, create a new one
            if (!text) {
                text = new PIXI.Text(batch.count, {
                    fontFamily: "Space Mono",
                    fontSize: 0.15 * this.#scaling,
                    fill: '#000000',
                });
                text.anchor.set(0.5);
                graphics.addChild(text);
            }

            // Update the text properties
            text.text = batch.count;
            text.x = batch.position.x * this.#scaling;
            text.y = batch.position.y * this.#scaling;
        });
    };

    #handlePlanetSelection = (planet) => {
        if (!this.#selectedPlanet) {
            this.#selectedPlanet = planet

            return
        }

        this.handleBatchSend(this.#selectedPlanet.id, planet.id)
        this.#selectedPlanet = null
    }
}

export { UIManager };
