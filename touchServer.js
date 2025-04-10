const express = require('express');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const session = require('express-session');

const app = express();
app.use(express.json());
app.use(session({ secret: 'surgary_secret', resave: false, saveUninitialized: true }));

// DB connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'surgary_db'
});

// Login route
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
        if (err) return res.status(500).json({ message: 'DB error' });
        if (results.length === 0) return res.status(401).json({ message: 'User not found' });

        const user = results[0];
        const match = await bcrypt.compare(password, user.password);

        if (!match) return res.status(401).json({ message: 'Wrong password' });

        req.session.user = {
            id: user.id,
            name: user.name,
            role: user.role
        };

        res.json({ message: 'Login successful', role: user.role });
    });
});

app.listen(3000, () => console.log('Server running on port 3000'));
