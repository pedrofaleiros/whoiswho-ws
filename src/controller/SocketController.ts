import { Server, Socket } from "socket.io";
import { SocketConst } from "../utils/SocketConst";
import JoinRoomController from "./Socket/JoinRoomController";
import DisconnectController from "./Socket/DisconnectController";
import RoomDataController from "./Socket/RoomDataController";
import StartGameController from "./Socket/StartGameController";
import FinishGameController from "./Socket/FinishGameController";
import { SocketError } from "../errors";

export default class SocketController {

    private joinRoom: JoinRoomController;
    private disconnect: DisconnectController;
    private roomData: RoomDataController;
    private startGame: StartGameController;
    private finishGame: FinishGameController;

    constructor() {
        this.joinRoom = new JoinRoomController();
        this.disconnect = new DisconnectController();
        this.roomData = new RoomDataController();
        this.startGame = new StartGameController();
        this.finishGame = new FinishGameController();
    }

    async handleConnection(io: Server, socket: Socket) {

        socket.on(
            SocketConst.JOIN_ROOM,
            async (data) => await this.joinRoom.handle(io, socket, data)
        );

        socket.on(
            SocketConst.DISCONNECT,
            async () => await this.disconnect.handle(io, socket)
        );

        socket.on(
            SocketConst.SET_ROOM_DATA,
            async (data) => await this.roomData.handle(io, socket, data)
        );

        socket.on(
            SocketConst.START_GAME,
            async (data) => await this.startGame.handle(io, socket, data)
        );

        socket.on(
            SocketConst.FINISH_GAME,
            async (data) => await this.finishGame.handle(io, socket, data)
        );
    }
}
