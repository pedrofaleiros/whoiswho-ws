import { Server, Socket } from "socket.io";
import RoomUserService from "../../service/RoomUserService";
import { NotAuthError, ResourceNotFoundError, SocketError, ValidationError } from "../../errors";
import { SocketConst } from "../../utils/SocketConst";
import { GameDTO, RoomDTO, UserDTO } from "../../dto";
import RoomService from "../../service/RoomService";
import GameService from "../../service/GameService";
import TokenService from "../../service/TokenService";

interface JoinRoomData {
    token: string,
    roomId: string
}

export default class JoinRoomController {

    private roomUserService = new RoomUserService();
    private roomService = new RoomService();
    private gameService = new GameService();

    async handle(io: Server, socket: Socket, data: JoinRoomData) {
        try {
            const sessionId = socket.id;
            const { token, roomId } = data;
            var username = TokenService.validateToken(token);

            //TODO: verificar
            await this.roomUserService.deleteUserSessions(username, io);

            var users: UserDTO[] = await this.roomUserService.addUserToRoom(username, roomId, sessionId);
            var roomData: RoomDTO = await this.roomService.findById(roomId);
            var games: GameDTO[] = await this.gameService.findByRoom(roomData.id);

            socket.join(roomData.id);

            io.to(roomData.id).emit(SocketConst.USERS, users);
            socket.emit(SocketConst.GAMES, games);
            socket.emit(SocketConst.ROOM_DATA, roomData);

        } catch (error) {
            if (error instanceof SocketError) {
                socket.emit(SocketConst.ERROR, error.message);
            } else {
                socket.emit(SocketConst.WARNING, "Ocorreu um erro inesperado.");
                console.log(error);
            }
            socket.disconnect();
        }
    }
}