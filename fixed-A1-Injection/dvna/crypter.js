const bcrypt = require('bcrypt');

const hashedPassword = '$2b$10$PWAH1wE7Yb1ON6B31/ydVuVjZ.zhARs19kWRaK87qFulVeWVQLPzm';
const passwordToCheck = 'abcd'; // Replace this with the actual password you're checking

bcrypt.compare(passwordToCheck, hashedPassword, function(err, result) {
    if (err) throw err;
    console.log(result); // result will be true if the password matches
});
