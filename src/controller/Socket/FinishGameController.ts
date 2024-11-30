import { Server, Socket } from "socket.io";
import { NotAuthError, ResourceNotFoundError, SocketError, ValidationError } from "../../errors";
import { SocketConst } from "../../utils/SocketConst";
import RoomService from "../../service/RoomService";
import SocketController from "../SocketController";

export default class FinishGameController {

    private roomService = new RoomService();

    async handle(io: Server, socket: Socket, data: any) {
        try {
            const sessionId = socket.id;

            var roomData = await this.roomService.fininshGame(sessionId);

            io.to(roomData.id).emit(SocketConst.ROOM_DATA, roomData);

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