const prisma = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ msg: 'Missing fields' });

  try {
    let user = await prisma.user.findUnique({ where: { email } });
    if (user) return res.status(400).json({ msg: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    const payload = { id: user.id };
    jwt.sign(payload, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '1h' }, (err, token) => {
      if (err) throw err;
      res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  
  try {
    // Hardcoded Demo Fallback User
    if (email === "demo@gridmind.com" && password === "demo123") {
       console.log("Logging in as Demo User bypass");
       return res.json({ 
         token: "mock-jwt-token-demo", 
         user: { id: "9999", name: "Demo User", email: "demo@gridmind.com" } 
       });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      return res.status(400).json({ msg: 'Invalid Credentials or User Not Found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });

    const payload = { id: user.id };
    jwt.sign(payload, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '7d' }, (err, token) => {
      if (err) throw err;
      res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
    });
  } catch (err) {
    console.error("Login Error:", err.message);
    res.status(500).json({ msg: "Server Configuration Error or DB Unreachable" });
  }
};

exports.getMe = async (req, res) => {
  try {
    if (req.user.id === "9999") {
      return res.json({ id: "9999", name: "Demo User", email: "demo@gridmind.com" });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true },
    });
    
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    
    res.json(user);
  } catch (err) {
    console.error("Auth me error:", err.message);
    res.status(500).send('Server Error');
  }
};
