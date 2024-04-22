export function getCopiedCoordinatesKey() {
    return 'PGCS_COPIED_COORDINATES';
}

export function getTestingCoordinatesKey() {
    return 'PGCS_TESTING_COORDINATES';
}

export function appendCoordinateToCopiedCoordinates(coordinate) {
    const coordinateKey = getCopiedCoordinatesKey();

    // put coordinate into existing coordinates
    const coordinates = JSON.parse(localStorage.getItem(coordinateKey) || '[]');

    // if coordinate is already in the list, ignore it
    if (coordinates.includes(coordinate)) {
        return;
    }

    coordinates.push(coordinate);

    // if coordinates is more than 5, remove the first one
    if (coordinates.length > 5) {
        coordinates.shift();
    }

    localStorage.setItem(coordinateKey, JSON.stringify(coordinates));
}

export function isCoordinateCopied(coordinate) {
    const coordinates = JSON.parse(localStorage.getItem(getCopiedCoordinatesKey()) || '[]');
    return coordinates.includes(coordinate);
}

export function appendClipboardToTestingCoordinates() {
    if (navigator.clipboard) {
        try {
            navigator.clipboard.readText().then((text) => {
                const coordinates = JSON.parse(localStorage.getItem(getTestingCoordinatesKey()) || '[]');
                coordinates.push(text);

                localStorage.setItem(getTestingCoordinatesKey(), JSON.stringify(coordinates));
            });
        } catch (error) {
            console.error('Failed to write clipboard contents:', error);
        }
    } else {
        alert('Clipboard API not available');
    }
}

export function getTestingCoordinates() {
    return JSON.parse(localStorage.getItem(getTestingCoordinatesKey()) || '[]');
}

export function getUserHashId() {
    return localStorage.getItem('PGCS_USER_HASH_ID');
}

export function doesUserHashIdNotExist() {
    return !getUserHashId();
}
