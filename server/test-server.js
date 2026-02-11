const express = require('express');
const app = express();
app.get('/', (req, res) => res.send('OK'));
app.listen(5001, () => {
    console.log('Test server running on 5001');
});
// Prevent immediate exit if event loop logic is weird
setInterval(() => {
    console.log('Heartbeat...');
}, 5000);
