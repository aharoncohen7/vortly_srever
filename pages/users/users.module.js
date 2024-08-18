const pool = require('../../DL/db');
const bcrypt = require("bcrypt");


// Create
async function createUser(name, phone, email, username, password) {
    console.log(password);
    console.log("createUser() ");
    const SQL = `INSERT into users (name, phone, email, username) 
    values (?, ?, ?, ?)`;
    const [response] = await pool.query(SQL, [name, phone, email, username]);
    const SQL2 = `INSERT into passwords (userId, password) 
    values (?, ?)`;
    const [response2] = await pool.query(SQL2, [response.insertId, password]);
    const newUser = await getUser(response.insertId)
    console.log(newUser, "newUser");
    return newUser;
}


// Comparing username to password
async function checkUser(username, password) {
    console.log("in checkUser", username, password);
    // const SQL = `SELECT users.id, users.username, passwords.password
    // FROM defaultdb.users
    // JOIN defaultdb.passwords ON users.id = passwords.userId
    // where users.username = ? and passwords.password = ?`
    // שיניתי לאחר הצפנת סיסמה 
    const SQL = `SELECT users.id, users.username, passwords.password
    FROM defaultdb.users
    JOIN defaultdb.passwords ON users.id = passwords.userId
    where users.username = ?`
    // const [[user]] = await pool.query(SQL, [username, password]);
    const [[user]] = await pool.query(SQL, [username]);
    if (user === undefined) {
        return 0;
    }
    // if (!bcrypt.compareSync(password, user.password)) throw "Not the same password"
    //להחזיר לאחר החלפת סיסמאות כללית
    if (!bcrypt.compareSync(password, user.password)) return 0;

    console.log(user.id);
    return user.id;

}

// בדיקה אם יוזר כבר קיים
async function isUserExists(email) {
    const SQL = `SELECT users.id
    FROM users
    where email = ?`
    const [[user]] = await pool.query(SQL, [email]);
    if (user === undefined) {
        return 0;
    }
    else {
        console.log(user.id);
        return 1;
    }
}


//Get all users
async function getUsers() {
    // console.log("in getUsers() ");
    const SQL = `select * from defaultdb.users`;
    const [users] = await pool.query(SQL);
    // console.log(user);
    return users;
}

//Get specific user
async function getUser(id) {
    console.log("in getUser() ");
    const SQL = `select * from defaultdb.users where defaultdb.users.id = ?`;
    const [[user]] = await pool.query(SQL, [id]);
    if (user === undefined) {
        return 0;
    }
    return user;
}

//UPDATE
//TODO: -לא כאן אלא בשירותים - להוסיף בדיקת סיסמה לפני שינוי פרטים
async function updateUser(body, id) {
    const allowedFields = ['name', 'username', 'phone', 'email'];
    const updates = [];
    const values = [];
    for (const [key, value] of Object.entries(body)) {
        if (allowedFields.includes(key)) {
            updates.push(`${key} = ?`);
            values.push(value);
        }
    }
    if (updates.length === 0) {
        throw new Error('No valid fields provided for update');
    }
    const query = `UPDATE defaultdb.users SET ${updates.join(', ')} WHERE id = ?`;
    values.push(id);
    try {
        const [response] = await pool.query(query, values);
        console.log(response);
        return response;
    } catch (error) {
        console.error('Error updating user:', error);
        throw error;
    }
}


//TODO: להשאיר כך-כאן הפונקציה צריכה רק לקבל נתונים ולעדכן, בשירותים יש לאתר את המזהה לפי סיסמה ישנה ולהצפין
async function changePassword(id, password) {
    console.log("changePassword() ", {id, password});
    if(password.length < 6){
         console.log({message: "Password is too short"});
         return {message: "Password is too short"};
    }
    const hashPassword = bcrypt.hashSync(password, 8);
    console.log({newPassword: hashPassword})
    const SQL = `UPDATE defaultdb.passwords SET passwords.password = ? WHERE passwords.userId = ?`
    const [response] = await pool.query(SQL, [hashPassword, id ]);
    return response;
}


// זמני - למקרה ונכנסה סיסמה לא מוצפנת
async function changePasswordToHash(id) {
    console.log("in changePasswordTemp()", id);
    const SQL = `SELECT passwords.password
    FROM defaultdb.passwords where userId = ?`
    // const [[user]] = await pool.query(SQL, [username, password]);
    const [[{password}]] = await pool.query(SQL, [id]);
    console.log(password)
    if (!password || password.length > 15) {
        console.log("Password is too short or null");
        return
    }
    const updatedUser = await changePassword(id, password)
    return updatedUser;

}
// זמני - החלפה חד פעמית לסימאות מוצפנות

async function updateAllPasswords() {
    for (let id = 1; id <= 85; id++) {
        try {
            console.log(`Updating password for user ID: ${id}`);
            const result = await changePasswordTemp(id);
            console.log(`Password updated for user ID: ${id}`, result);
        } catch (error) {
            console.error(`Failed to update password for user ID: ${id}`, error);
        }
    }
    console.log('All passwords have been updated.');
    return {message: 'All passwords have been updated'}
}

//set admin
async function setAdmin(permission, id) {
    const query = `UPDATE defaultdb.users SET isAdmin = ? WHERE id = ?`;
    try {
        const [response] = await pool.query(query, [permission, id]);
        console.log(response);
        return response;
    } catch (error) {
        console.error('Error updating permission:', error);
        throw error;
    }
}

// DELETE
async function deleteUser(userId) {
    const deletedUser = await getUser(userId)
    const query = `delete from defaultdb.users where id = ?`;
    const [response] = await pool.query(query, [userId]);
    if(response){
        console.log(response);
        console.log(`User ${deletedUser.username} has been deleted`);
        return deletedUser;
    }
    else{
        console.log("User not found");
        return null;
    }
}



async function test() {
    const data = await getUser(37)
    console.log(data);
}
// test()

module.exports = {
    getUser,
    getUsers,
    updateUser,
    changePassword,
    changePasswordToHash,
    updateAllPasswords,
    setAdmin,
    isUserExists,
    checkUser,
    createUser,
    deleteUser
};







//השגת סיסמה באמצעות ID

// async function getPasswordByID(id) {
//     console.log("in getPasswordByID() ");
//     const SQL = `select * from PASSWORDS where userId = ?`;
//     const [[user]] = await pool.query(SQL, [id]);
//     console.log(user);
//     return user;
// }

// async function loginOld (username, password) {
//     console.log("in loginOld() ");
//     const userID = await getIdbyPassword(password);
//     const userID2 = await getIdbyUsername(username);
//    if(userID!==undefined&&userID2!==undefined){
//      console.log(userID.userId === userID2.id);
//     return (userID.userId === userID2.id)}
//     else {return false;}
// }



// async function getIdbyPassword(password) {
//     console.log("in getIdbyPassword() ");
//     const SQL = `select userId from PASSWORDS where password = ?`;
//     const [[theID]] = await pool.query(SQL, [password]);
//     if (theID === undefined) {
//         console.log("User not found or password incorrect");
//         // החזרת ערך ברירת המחדל או ניתוח פעולה נוספת
//         return -1; // החזרת ערך ברירת המחדל
//     }
//     return theID;
// }
// async function getIdbyUsername(username) {
//     console.log("in getIdbyUsername() ");
//     const SQL = `select id from users where username = ?`;
//     const [[theID]] = await pool.query(SQL, [username]);
//     return theID;
// }