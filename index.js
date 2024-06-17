const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/UserRoutes');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const PORT = process.env.PORT || 9000;

app.use(cors());
app.use(express.json());
app.use('/api', userRoutes);

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