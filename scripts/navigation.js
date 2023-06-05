function loadContent(tabId) {
    const contentContainer = document.getElementById('content-container');
    const contentBlocks = contentContainer.children;

    for (let i = 0; i < contentBlocks.length; i++) {
        const block = contentBlocks[i];
        if (block.id === `${tabId}-content`) {
            block.style.display = 'block';
        } else {
            block.style.display = 'none';
        }
    }
}

function initializeNavigation() {
    const contentContainer = document.getElementById('content-container');

    const roomsTab = document.getElementById('rooms-tab');
    roomsTab.addEventListener('click', () => {
        contentContainer.style.display = 'block';
        loadContent('rooms');
    });

    const gameTab = document.getElementById('game-tab');
    gameTab.addEventListener('click', () => {
        contentContainer.style.display = 'block';
        loadContent('game');
    });

    const profileTab = document.getElementById('profile-tab');
    profileTab.addEventListener('click', () => {
        contentContainer.style.display = 'block';
        loadContent('profile');
    });

    const settingsTab = document.getElementById('settings-tab');
    settingsTab.addEventListener('click', () => {
        contentContainer.style.display = 'block';
        loadContent('settings');
    });
}

window.addEventListener('load', initializeNavigation);
