const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path'); // Add this for path handling

const app = express();
const mongoURI = process.env.MONGO_URI; // Use the environment variable
const PORT = process.env.PORT || 3000; // Using port 3000 for the backend

// Middleware for CORS
app.use(cors({
    origin: 'http://localhost:8000', // Allow requests from this origin (client running on port 8000)
    methods: ['GET', 'POST', 'OPTIONS'], // Ensure OPTIONS is included
    credentials: true // Allow credentials (cookies, authorization headers, etc.)
}));

// Middleware for parsing JSON data
app.use(bodyParser.json());

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Route to serve the main BarkerPortfolio.html file when accessing '/'
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'BarkerPortfolio.html'));
});

// MongoDB connection
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define a schema and model for storing contact form submissions
const contactSchema = new mongoose.Schema({
    name: String,
    email: String,
    message: String
});

const Contact = mongoose.model('Contact', contactSchema);

// Route to handle form submissions
app.post('/submit', async (req, res) => {
    const { name, email, message } = req.body;

    const newContact = new Contact({
        name,
        email,
        message
    });

    try {
        await newContact.save();
        res.status(200).json({ message: 'Contact saved successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error saving contact', error: err });
    }
});

// Handle preflight requests globally (for CORS support)
app.options('*', cors());

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

