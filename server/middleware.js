function decodeJSON(string) {
    try {
        return JSON.parse(string);
    } catch (e) {
        console.error('Failed to parse message:', e);
        return null; // Return null or an appropriate value to indicate failure
    }
}

module.exports = {decodeJSON};