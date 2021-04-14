export function getDateFormatted(date = new Date()) {
    return ((date.getMonth() > 8) ? (date.getMonth() + 1) : ('0' + (date.getMonth() + 1))) + '-' + ((date.getDate() > 9) ? date.getDate() : ('0' + date.getDate())) + '-' + date.getFullYear();
}
export function getUserName(email = '') {
    return email.split('@')[0];
}