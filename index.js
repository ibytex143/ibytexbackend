const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const AuthRouter = require('./routes/AuthRouter');
const ProductRouter = require('./routes/ProductRouter');
const AdminRoutes = require("./routes/adminRoutes");
require('dotenv').config();
require('./models/db');

const http = require("http");
const { Server } = require("socket.io");

const PORT = process.env.PORT || 8080;

app.use(bodyParser.json());
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
}));

app.use("/uploads", express.static("uploads"));
app.use('/auth', AuthRouter);
app.use('/products', ProductRouter);
app.use("/admin", AdminRoutes);
app.use("/orders", require("./routes/orderRoutes"));
const authRoutes = require("./routes/authRoutes");

app.get('/ping', (req, res) => {
    res.send('pong');
});

// 🔥 IMPORTANT SOCKET SETUP
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" }
});

io.on("connection", (socket) => {
  console.log("User connected");

  socket.on("send_message", (data) => {
    io.emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});
app.use("/api/auth", authRoutes);

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
