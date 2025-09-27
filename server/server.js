const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');

dotenv.config();

const app = express();

app.use(express.json());
app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 5000;
async function conncetDB(){
    try{
        await mongoose.connect(process.env.MONGO_URI,{
            useNewUrlParser : true,
            useUnifiedTopology : true
        });
        console.log("MongoDB connected Successfully");  
    }
    catch(err){
        console.error("MongoDB connection failed:",err.message);
    }
}

conncetDB();

app.listen(PORT,() => {
    console.log(`Server running on port ${PORT}`);
});