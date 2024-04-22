export function isUserSet() {
    return !!localStorage.getItem('PGCS_USER_HASH_ID');
}

export function clearUser() {
    localStorage.removeItem('PGCS_USER_HASH_ID');
}

export function getUserFromLocalStorage() {
    return localStorage.getItem('PGCS_USER_HASH_ID');
}

export function setUserToLocalStorage(userHashId) {
    localStorage.setItem('PGCS_USER_HASH_ID', userHashId);
}