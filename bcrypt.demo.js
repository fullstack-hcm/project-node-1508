const bcrypt  = require('bcrypt');

let passwordInput = 'mern_1508';

bcrypt.hash(passwordInput, 10)
    .then(hashString => console.log({ hashString }))
    .catch(err => console.log({ err: err.message }));