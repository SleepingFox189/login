const express = require("express");
const fs = require("fs");
const cors = require("cors");
const app = express();

app.use(express.json());
app.use(cors());

// Read the key
app.get("/get-key", (req, res) => {
    fs.readFile("key.json", "utf8", (err, data) => {
        if (err) return res.status(500).json({ error: "Failed to read key.json" });
        res.json(JSON.parse(data));
    });
});

// Generate a new key
app.post("/set-key", (req, res) => {
    const newKey = { accessKey: Math.random().toString(36).substring(2, 10) };
    fs.writeFile("key.json", JSON.stringify(newKey), (err) => {
        if (err) return res.status(500).json({ error: "Failed to write key.json" });
        res.json(newKey);
    });
});

// Get users
app.get("/get-users", (req, res) => {
    fs.readFile("users.json", "utf8", (err, data) => {
        if (err) return res.status(500).json({ error: "Failed to read users.json" });
        res.json(JSON.parse(data));
    });
});

// Register a user
app.post("/register", (req, res) => {
    const { username, password, email } = req.body;
    fs.readFile("users.json", "utf8", (err, data) => {
        let users = err ? { pendingUsers: [], approvedUsers: [] } : JSON.parse(data);

        if (users.pendingUsers.some(user => user.username === username) ||
            users.approvedUsers.some(user => user.username === username)) {
            return res.status(400).json({ error: "Username already exists" });
        }

        users.pendingUsers.push({ username, password, email });
        fs.writeFile("users.json", JSON.stringify(users), (err) => {
            if (err) return res.status(500).json({ error: "Failed to update users.json" });
            res.json({ message: "Registration submitted for approval" });
        });
    });
});

// Approve a user
app.post("/approve-user", (req, res) => {
    const { username } = req.body;
    fs.readFile("users.json", "utf8", (err, data) => {
        let users = err ? { pendingUsers: [], approvedUsers: [] } : JSON.parse(data);

        let userIndex = users.pendingUsers.findIndex(user => user.username === username);
        if (userIndex === -1) return res.status(404).json({ error: "User not found" });

        let approvedUser = users.pendingUsers.splice(userIndex, 1)[0];
        users.approvedUsers.push(approvedUser);

        fs.writeFile("users.json", JSON.stringify(users), (err) => {
            if (err) return res.status(500).json({ error: "Failed to update users.json" });
            res.json({ message: "User approved" });
        });
    });
});

// Start server
app.listen(3000, () => console.log("Server running on http://localhost:3000"));