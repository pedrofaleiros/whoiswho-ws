import { RoomDTO } from "../dto";
import { NotAuthError, ValidationError } from "../errors";
import RoomRepository from "../repository/RoomRepository";
import RoomUserRepository from "../repository/RoomUserRepository";
import UserRepository from "../repository/UserRepository";

interface UpdateRoomData {
    sessionId: string;
    impostors: number;
    includeDefaultGameEnvs: boolean;
    includeUserGameEnvs: boolean;
}

export default class RoomService {

    private repository = new RoomRepository();
    private userRepository = new UserRepository();
    private roomUserRepository = new RoomUserRepository();

    async findById(roomId: string): Promise<RoomDTO> {
        var room = await this.repository.findByIdOrThrow(roomId);
        var user = await this.userRepository.findByIdOrThrow(room.owner_id);

        return {
            id: room.id,
            impostors: room.impostors,
            ownerId: user.id,
            includeDefaultGameEnvs: room.include_default_game_envs,
            includeUserGameEnvs: room.include_user_game_envs,
            status: room.status
        };
    }

    async update(data: UpdateRoomData): Promise<RoomDTO> {

        var session = await this.roomUserRepository.findBySessionIdOrThrow(data.sessionId);

        var room = await this.repository.findByIdOrThrow(session.room_id);

        if (session.user_id !== room.owner_id) throw new NotAuthError();
        if (data.impostors < 1 || data.impostors > 3) throw new ValidationError("Número inválido de impostores.");

        var updated = await this.repository.update({
            roomId: room.id,
            impostors: data.impostors,
            includeDefaultGameEnvs: data.includeDefaultGameEnvs,
            includeUserGameEnvs: data.includeUserGameEnvs
        })

        return {
            id: updated.id,
            impostors: updated.impostors,
            ownerId: updated.owner_id,
            includeDefaultGameEnvs: updated.include_default_game_envs,
            includeUserGameEnvs: updated.include_user_game_envs,
            status: updated.status,
        };
    }

    async startGame(sessionId: string): Promise<RoomDTO> {
        var session = await this.roomUserRepository.findBySessionIdOrThrow(sessionId);
        var room = await this.repository.findByIdOrThrow(session.room_id);

        if (session.user_id !== room.owner_id) throw new NotAuthError();

        if (room.status !== "IDLE") {
            throw new ValidationError("A partida já foi iniciada.");
        }

        var updated = await this.repository.startGame(session.room_id);

        return {
            id: updated.id,
            impostors: updated.impostors,
            ownerId: updated.owner_id,
            includeDefaultGameEnvs: updated.include_default_game_envs,
            includeUserGameEnvs: updated.include_user_game_envs,
            status: updated.status,
        };
    }

    async fininshGame(sessionId: string): Promise<RoomDTO> {
        var session = await this.roomUserRepository.findBySessionIdOrThrow(sessionId);
        var room = await this.repository.findByIdOrThrow(session.room_id);

        if (session.user_id !== room.owner_id) throw new NotAuthError();

        if (room.status === "IDLE") {
            throw new ValidationError("A partida não foi iniciada.");
        }

        var updated = await this.repository.finishGame(session.room_id);

        return {
            id: updated.id,
            impostors: updated.impostors,
            ownerId: updated.owner_id,
            includeDefaultGameEnvs: updated.include_default_game_envs,
            includeUserGameEnvs: updated.include_user_game_envs,
            status: updated.status,
        };
    }
}