const express = require('express');
const router  = express.Router();

const { hash, compare }  = require('bcrypt');

const { USER_MODEL } = require('../models/user.model');

router.post('/add-user', async (req, res) => {
    const { username, password, fullname, email } = req.body;

    let pwdHash = await hash(password, 8);

    let infoUser = new USER_MODEL({ username, password: pwdHash, fullname, email });
    let infoUserAfterInserted = await infoUser.save();
    res.json({ infoUserAfterInserted });
});


router.route('/login')
    .get(async (req, res) => {
        res.render('login');
    })
    .post(async (req, res) => {
        const { username, password } = req.body;
        let isExistUser = await USER_MODEL.findOne({
            username
        });
        if (!isExistUser) return res.render('error', { message: 'USERNAME ko tồn tại!' });
        console.log({ isExistUser })
        const { password: hashPwd } = isExistUser;

        let isMatch = await compare(password, hashPwd);
        console.log({ isMatch });
        if (!isMatch) return res.render('error', { message: 'PASSWORD không khớp!' });

        req.session.infoUser = isExistUser;

        res.redirect('/user');
    })

router.get('/', async (req, res) => {
    const { infoUser  } = req.session;
    if (!infoUser) res.render('error', { message: 'đăng nhập di' });
    const  { fullname, email, username: usernameCurrentLogin } = infoUser;
    
    let infoUserDB = await USER_MODEL.findOne({ 
        username: usernameCurrentLogin 
    }).populate('guestsRequest');

    const { usersRequest, guestsRequest } = infoUserDB;

    /**
     * 
     */
    let listUsers = await USER_MODEL.find({
        username: {
            $ne: usernameCurrentLogin
        }
    });
    
    res.render('home', { fullname, email, listUsers, usersRequest, guestsRequest });
});

router.get('/request-add-friend/:recieverID', async (req, res) => {
    const { recieverID } = req.params;
    const { infoUser } = req.session;
    if (!infoUser) res.render('error', { message: 'đăng nhập di' });
    const { fullname, email, username: usernameCurrentLogin, _id: senderID } = infoUser;

    let infoUserSenderAfterUpdated = await USER_MODEL.findByIdAndUpdate(senderID, {
        $addToSet: {
            usersRequest: recieverID
        }
    }, { new: true });

    let infoUserReceiverAfterUpdate = await USER_MODEL.findByIdAndUpdate(recieverID, {
        $addToSet: {
            guestsRequest: senderID
        }
    }, { new: true });

    res.redirect('/user');
});

router.get('/request-remove-friend/:recieverID', async (req, res) => {
    const { recieverID } = req.params;
    const { infoUser } = req.session;
    if (!infoUser) res.render('error', { message: 'đăng nhập di' });
    const { fullname, email, username: usernameCurrentLogin, _id: senderID } = infoUser;

    let infoUserSenderAfterUpdated = await USER_MODEL.findByIdAndUpdate(senderID, {
        $pull: {
            usersRequest: recieverID
        }
    }, { new: true });

    let infoUserReceiverAfterUpdate = await USER_MODEL.findByIdAndUpdate(recieverID, {
        $pull: {
            guestsRequest: senderID
        }
    }, { new: true });

    res.redirect('/user');
});

router.get('/resolve-friend/:recieverID', async (req, res) => {
    const { recieverID } = req.params;
    const { infoUser } = req.session;
    if (!infoUser) res.render('error', { message: 'đăng nhập di' });
    const { fullname, email, username: usernameCurrentLogin, _id: senderID } = infoUser;

    let infoUserSenderAfterUpdated = await USER_MODEL.findByIdAndUpdate(senderID, {
        $addToSet: {
            friends: recieverID
        }, 
        $pull: {
            guestsRequest: recieverID
        }
    }, { new: true });

    let infoUserReceiverAfterUpdate = await USER_MODEL.findByIdAndUpdate(recieverID, {
        $addToSet: {
            friends: senderID
        },
        $pull: {
            usersRequest: senderID
        }
    }, { new: true });

    res.redirect('/user');
});

// router.get('/reject-friend/:recieverID', async (req, res) => {
//     const { recieverID } = req.params;
//     const { infoUser } = req.session;
//     if (!infoUser) res.render('error', { message: 'đăng nhập di' });
//     const { fullname, email, username: usernameCurrentLogin, _id: senderID } = infoUser;

//     let infoUserSenderAfterUpdated = await USER_MODEL.findByIdAndUpdate(senderID, {
//         $pull: {
//             usersRequest: recieverID
//         }
//     }, { new: true });

//     let infoUserReceiverAfterUpdate = await USER_MODEL.findByIdAndUpdate(recieverID, {
//         $pull: {
//             guestsRequest: senderID
//         }
//     }, { new: true });

//     res.redirect('/user');
// });

exports.USER_ROUTER = router;

// module.exports = {
//     USER_ROUTER : router
// }