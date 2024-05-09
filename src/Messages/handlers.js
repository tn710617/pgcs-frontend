export function getCopiedCoordinatesKey() {
    return 'PGCS_COPIED_COORDINATES';
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
    if (coordinates.length > 15) {
        coordinates.shift();
    }

    localStorage.setItem(coordinateKey, JSON.stringify(coordinates));
}

export function isCoordinateCopied(coordinate) {
    const coordinates = JSON.parse(localStorage.getItem(getCopiedCoordinatesKey()) || '[]');
    return coordinates.includes(coordinate);
}

export function getUserHashId() {
    return localStorage.getItem('PGCS_USER_HASH_ID');
}

