import SocketController from "@controllers/socket.controller";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
  maxHttpBufferSize: 5 * 1024 * 1024, // 5 MB,
});

app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json());

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);
  new SocketController(socket).initialize();
});

console.clear();
server.listen(3005, () => console.log("Server running on port 3000"));
