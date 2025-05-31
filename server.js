const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5001;

// Configure CORS to allow requests from your frontend
const allowedOrigins = ["http://localhost:5173", "http://127.0.0.1:5173", "*"];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 204,
};

// Apply CORS middleware
app.use(cors(corsOptions));
app.use(express.json());

// Test endpoint to verify CORS is working
app.get("/api/test", (req, res) => {
  res.json({
    status: "success",
    message: "CORS test successful! Backend is reachable.",
    timestamp: new Date().toISOString(),
  });
});

// Order endpoint
app.post("/api/order", (req, res) => {
  console.log("bpdy : ", req?.body);
  const { email, walletAddress, amountETH } = req.body;

  // Input validation
  if (!email || !walletAddress || amountETH === undefined) {
    return res.status(400).json({
      success: false,
      error: "Missing required fields",
    });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      error: "Invalid email format",
    });
  }

  // Validate ETH amount
  const amount = parseFloat(amountETH);
  if (isNaN(amount) || amount <= 0) {
    return res.status(400).json({
      success: false,
      error: "Invalid ETH amount",
    });
  }

  console.log("New order received:");
  console.log(`- Email: ${email}`);
  console.log(`- Wallet: ${walletAddress}`);
  console.log(`- Amount: ${amountETH} ETH`);

  // Generate order ID
  const orderId =
    "ORD" + Math.random().toString(36).substring(2, 11).toUpperCase();

  res.json({
    success: true,
    orderId,
  });
});

// Handle 404 errors
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Endpoint not found",
  });
});

// Centralized error handling
app.use((err, req, res, next) => {
  console.error("Server error:", err.stack);

  // Handle CORS errors specifically
  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({
      success: false,
      error: "CORS policy blocked the request",
    });
  }

  res.status(500).json({
    success: false,
    error: "Internal server error",
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`✅ CORS enabled for origins: ${allowedOrigins.join(", ")}`);
  console.log(`🔍 Test endpoint: http://localhost:${PORT}/api/test`);
});
