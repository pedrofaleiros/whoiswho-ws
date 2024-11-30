import { Server, Socket } from "socket.io";
import RoomUserService from "../../service/RoomUserService";
import { SocketConst } from "../../utils/SocketConst";

export default class DisconnectController {

    private roomUserService = new RoomUserService();

    async handle(io: Server, socket: Socket) {
        try {
            const sessionId = socket.id;
            const roomId = await this.roomUserService.removeUserFromRoom(sessionId);
            const users = await this.roomUserService.getRoomUsers(roomId);
            io.to(roomId).emit(SocketConst.USERS, users)
        } catch (error) {
            console.log(error);
        }
    }
}