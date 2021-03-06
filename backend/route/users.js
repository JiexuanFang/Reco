const express = require('express');
const bcrypt = require('bcrypt');
const { reset } = require('nodemon');
const router = express.Router();
const User = require('../models/User');

router.get('/', async (req, res) => {

    try {
        const users = await User.find();
        res.json(users);
    } catch (err) {
        res.json({ message: err });
    }

});


router.get('/login', async (req, res) => {
    res.send('login');
});

router.get('/register', async (req, res) => {
    res.send('register');
});


router.get('/:userID', async (req, res) => {
    try {
        const getUser = await User.findOne({ _id: req.params.userID });
        res.json(getUser);
    } catch (err) {
        res.json({ message: err });
    }
})

router.delete('/:userID', async (req, res) => {
    try {
        const removedUser = await User.remove({ _id: req.params.userID });
        res.json(removedUser);
    } catch (err) {
        res.json({ message: err });
    }
})

//UPDATE password
router.patch('/changePassword/:userID', async (req, res) => {
    if (!req.body.password) {
        return res.status(400).json({ message: "Incomplete data" });
    }
    try {
        const salt = await bcrypt.genSalt(10);
        const newPassword = await bcrypt.hash(req.body.password, salt);
        const updatedUser = await User.updateOne(
            { username: req.body.username },
            {
                $set: { password: newPassword },
            });
        res.json(updatedUser);
    } catch (err) {
        res.json({ message: err });
    }
})

//DELETE ALL USERS (dangerous)
router.delete('/', async (req, res) => {
    try {
        const removedUser = await User.remove();
        res.json(removedUser);
    } catch (err) {
        res.json({ message: err });
    }
})

//UPDATE signature
router.patch('/editSignature/:userID', async (req, res) => {
    try {
        const updatedUser = await User.updateOne(
            //{ _id: req.params.userID },
            { username: req.body.username },
            {
                $set: { signature: req.body.signature },
            });
        res.json(updatedUser);
    } catch (err) {
        res.json({ message: err });
    }
})

router.post('/login', async (req, res) => {
    try {
        const data = await User.findOne({ username: req.body.username });
        if (!data) {
            res.status(400).json({ message: "Invalid username" });
        } else {
            const validPassword = await bcrypt.compare(req.body.password,
                data.password);
            if (validPassword) {
                res.status(200).json({ data });
            } else {
                res.status(400).json({ message: "Invalid Password" });
            }
        }
    } catch (err) {
        res.json({ message: err });
    }
});

router.post('/register', async (req, res) => {

    // input data should not be empty
    if (!(req.body.username && req.body.password && req.body.signature)) {
        return res.status(400).json({ message: "Incomplete data" });
    }

    const user = new User({
        username: req.body.username,
        password: req.body.password,
        signature: req.body.signature
    })
    try {
        // console.log(user);
        const data = await User.findOne({
            username: user.username
        });
        if (data) {
            // console.log(data);
            res.status(400).json({ message: "Username exists" });
        } else {
            // hash password with bcrypt
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
            const savedUser = await user.save();
            res.json(savedUser);
            //res.status(200).json({message:"Success"});
        }
    } catch (err) {
        res.json({ message: err });
    }
});

module.exports = router;
