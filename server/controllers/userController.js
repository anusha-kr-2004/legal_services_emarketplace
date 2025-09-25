const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.register = async (req , res) => {
    const { name, email, password, role } = req.body;

    try{
        let user = await User.findOne({ email});
        if (user) {
            return res.status(400).json({ message: 'User already exists'});
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({
            name,
            email,
            password: hashedPassword,
            role 
        });

        await user.save();
        res.status(201).json({ mressage: 'User registered successfully'});
    }
    catch(error){
        console.error(error.message);
        res.status(500).send('Server error');
    }
};