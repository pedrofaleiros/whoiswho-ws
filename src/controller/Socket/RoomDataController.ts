import { Server, Socket } from "socket.io";
import TokenService from "../../service/TokenService";
import RoomService from "../../service/RoomService";
import { SocketConst } from "../../utils/SocketConst";
import { NotAuthError, ResourceNotFoundError, SocketError } from "../../errors";
import SocketController from "../SocketController";

interface RoomData {
    impostors: number;
    includeDefaultGameEnvs: boolean;
    includeUserGameEnvs: boolean;
}

export default class RoomDataController {

    private roomService = new RoomService();

    async handle(io: Server, socket: Socket, data: RoomData) {
        try {
            var sessionId = socket.id;

            var roomData = await this.roomService.update({
                impostors: data.impostors,
                includeDefaultGameEnvs: data.includeDefaultGameEnvs,
                includeUserGameEnvs: data.includeUserGameEnvs,
                sessionId: sessionId,
            });

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