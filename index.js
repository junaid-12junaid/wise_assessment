const express = require('express');
const mongoose = require('mongoose');
const app = express();
app.use(express.json());
const route = require('./src/routes/instructor');


mongoose.connect('mongodb://localhost:27017/instructorDB')
.then(() => console.log("MongoDb is connected"))
.catch(err => console.log(err))



app.use('/', route)



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
