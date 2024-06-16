const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const PORT = process.env.PORT || 9000;

app.use(cors());
app.use(express.json());


mongoose.connect(process.env.ATLAS_CONNECTION)
  .then(() => {
    console.log('Database is connected')
  }).catch((err) => {
    console.log('Error connecting to MongoDB:', err);
  });

app.get('/', (req, res) => {
  res.send('API is running...');
});

app.listen(PORT, ()=>{
  console.log(`Successfully served on port: ${PORT}.`);
})

const userRoutes = require('./routes/UserRoutes');
app.use('/api', userRoutes);
