import express from 'express';
import cors from 'cors';
import { createServer, Server } from 'http';
import { Server as ServerSocketIo } from "socket.io";
import { SocketConst } from './utils/SocketConst';
import Env from './utils/env';
import { router } from './routes';
import SocketController from './controller/SocketController';

export default class App {

    private app: express.Application;
    private server: Server;
    private socketIo: ServerSocketIo;
    private socketController: SocketController;

    constructor() {
        this.app = express();
        this.expressConfig();

        this.socketController = new SocketController();

        this.server = createServer(this.app);
        this.socketIo = new ServerSocketIo(this.server, { cors: { origin: "*" } });
    }

    public start() {

        this.socketIo.on(
            SocketConst.CONNECTION,
            (socket) => this.socketController.handleConnection(this.socketIo, socket)
        );

        this.server.listen(Env.PORT, () => {
            console.log(`running at ${Env.PORT}`);
        });
    }

    private expressConfig() {
        this.app.use(cors({ origin: "*" }));
        this.app.use(express.json());
        this.app.use(router);
    }
}
