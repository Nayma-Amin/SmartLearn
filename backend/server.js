const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors({
  origin: "http://localhost:5180",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend working!");
});

app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  console.log("📩 Incoming login:", { email, password });

  if (email === "naymaaminnishy06@gmail.com" && password === "1234") {
    return res.json({ role: "Teacher", token: "dummy-jwt" });
  }
  if (email === "2021-3-60-178@std.ewubd.edu" && password === "1234") {
    return res.json({ role: "Student", token: "dummy-jwt" });
  }
  if (email === "naymaaminnishy22@gmail.com" && password === "1234") {
    return res.json({ role: "Admin", token: "dummy-jwt" });
  }

  console.log("❌ Invalid credentials:", { email, password });
  res.status(401).json({ error: "Invalid credentials" });
});

app.listen(5000, "127.0.0.1", () =>
  console.log("✅ Backend running on port 5000")
);