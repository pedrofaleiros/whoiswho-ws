import { UserDTO } from "../dto";
import { ResourceNotFoundError, ValidationError } from "../errors";
import RoomRepository from "../repository/RoomRepository";
import RoomUserRepository from "../repository/RoomUserRepository";
import UserRepository from "../repository/UserRepository";

class RoomUserService {

    private repository = new RoomUserRepository();
    private userRepository = new UserRepository();
    private roomRepository = new RoomRepository();

    async addUserToRoom(username: string, roomId: string, sessionId: string): Promise<UserDTO[]> {
        if (await this.repository.findBySessionId(sessionId) != null) {
            throw new ValidationError("Sessão já existe.");
        }

        var user = await this.userRepository.findByUsername(username);
        var room = await this.roomRepository.findById(roomId);

        if (user === null) throw new ResourceNotFoundError("Usuário inválido.");
        if (room === null) throw new ResourceNotFoundError("Sala não encontrada.");

        var roomUser = await this.repository.create(user.id, room.id, sessionId);

        return await this.getRoomUsers(roomUser.room_id);
    }

    async removeUserFromRoom(sessionId: string): Promise<string> {
        const roomUser = await this.repository.findBySessionId(sessionId);
        if (!roomUser) {
            throw new ResourceNotFoundError("Sessão não encontrada.");
        }
        await this.repository.delete(roomUser.session_id);
        return roomUser.room_id;
    }

    async getRoomUsers(roomId: string): Promise<UserDTO[]> {
        const room = await this.roomRepository.findById(roomId);
        if (!room) throw new ResourceNotFoundError("Sala não encontrada");

        const roomUsers = await this.repository.findByRoom(room.id);
        const uniqueUsers = Array.from(new Set(roomUsers.map(user => user.user_id))).map(
            id => roomUsers.find(user => user.user_id === id)!
        );

        const users: UserDTO[] = [];
        uniqueUsers.forEach((usr) => {
            users.push({
                id: usr.users.id,
                username: usr.users.username
            })
        });
        return users;
    }
}

export default RoomUserService;