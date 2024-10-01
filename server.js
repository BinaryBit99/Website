const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path'); // For path handling

const app = express();
const mongoURI = process.env.MONGO_URI; 
const PORT = process.env.PORT || 3000; // Using port 3000 for the backend

// Middleware 
const allowedOrigins = [
    'https://barkerportfolio.ca', 
    'https://www.barkerportfolio.ca'
];
app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true); 
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy does not allow access from this origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    methods: ['GET', 'POST', 'OPTIONS'], 
    credentials: true
}));
app.use(bodyParser.json());
app.use(express.static('public'));
app.use((req, res, next) => {
    if (req.headers['x-forwarded-proto'] !== 'https') {
        return res.redirect(`https://${req.headers.host}${req.url}`);
    }
    next();
});
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'BarkerPortfolio.html'));
});

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

const contactSchema = new mongoose.Schema({
    name: String,
    email: String,
    message: String
});
const Contact = mongoose.model('Contact', contactSchema);
// Route 
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

// Handle preflight requests
app.options('*', cors());

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


