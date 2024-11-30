import { Server, Socket } from "socket.io";
import { NotAuthError, ResourceNotFoundError, SocketError, ValidationError } from "../../errors";
import { SocketConst } from "../../utils/SocketConst";
import GameService from "../../service/GameService";
import RoomService from "../../service/RoomService";
import SocketController from "../SocketController";

export default class StartGameController {

    private gameService = new GameService();
    private roomService = new RoomService();

    async handle(io: Server, socket: Socket, data: any) {
        try {
            const sessionId = socket.id;

            var game = await this.gameService.create(sessionId);
            var roomData = await this.roomService.startGame(sessionId);

            for (var i = 3; i > 0; i--) {
                io.to(roomData.id).emit(SocketConst.COUNT_DOWN, `A partida começa em ${i}`);
                await new Promise(resolve => setTimeout(resolve, 1000))
            }

            io.to(roomData.id).emit(SocketConst.ROOM_DATA, roomData);
            io.to(roomData.id).emit(SocketConst.NEW_GAME, game);

            io.to(roomData.id).emit(SocketConst.COUNT_DOWN, null);

        } catch (error) {
            if (error instanceof SocketError) {
                socket.emit(SocketConst.WARNING, error.message);
            } else {
                socket.emit(SocketConst.WARNING, "Ocorreu um erro inesperado.");
                console.log(error);
            }
        }
    }
}