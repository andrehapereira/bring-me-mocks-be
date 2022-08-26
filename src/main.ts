import { Server } from "./server";

const PORT = process.env.PORT || '8080';

const server = new Server(PORT);

server.start();

