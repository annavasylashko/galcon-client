const setButton = document.getElementById('set-settings-button')
const resetButton = document.getElementById('reset-settings-button')

const settingsInput = document.getElementById('settings')

const defaultRoomSettings = {
    settings: {
        planetCount: 10,
        width: 12,
        height: 5,
        minPlanetProduction: 30,
        maxPlanetProduction: 100,
        speed: 0.5,
        distanceOffset: 0.3,
    },
};

if (!localStorage.getItem('roomSettings')) {
    localStorage.setItem('roomSettings', JSON.stringify(defaultRoomSettings, null, 2))
}
settingsInput.value = localStorage.getItem('roomSettings')

function isJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

const resetSettings = () => {
    localStorage.setItem('roomSettings', JSON.stringify(defaultRoomSettings, null, 2))

    settingsInput.value = localStorage.getItem('roomSettings')

    Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: "Setting set correctly"
    });
}

setButton.addEventListener('click', () => {
    const settings = settingsInput.value

    if (isJsonString(settings)) {
        localStorage.setItem('roomSettings', settings)
        console.log(settings)
        Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: "Setting set correctly. If you won't be able to create a new room, \
            consider resetting settings to default value",
        });
    } else {
        Swal.fire({
            title: 'Not vaid',
            text: "Input you've provided is not a valid JSON. Do you want to reset settings?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'Yes, reset!'
        }).then((result) => {
            if (result.isConfirmed) {
                resetSettings()
            }
        })
    }
})

resetButton.addEventListener('click', () => resetSettings())