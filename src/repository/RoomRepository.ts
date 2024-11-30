import { Room } from "@prisma/client";
import prismaClient from "../utils/prismaClient";
import { RoomNotFound } from "../errors";
import { RoomStatus } from "../dto";

interface UpdateRoomData {
    roomId: string;
    impostors: number;
    includeDefaultGameEnvs: boolean;
    includeUserGameEnvs: boolean;
}

export default class RoomRepository {

    async findById(id: string): Promise<Room | null> {
        return await prismaClient.room.findUnique({ where: { id: id } });
    }

    async findByIdOrThrow(id: string): Promise<Room> {
        var room = await prismaClient.room.findUnique({ where: { id: id } });
        if (!room) throw new RoomNotFound();
        return room;
    }

    async update(data: UpdateRoomData): Promise<Room> {
        return await prismaClient.room.update({
            where: { id: data.roomId },
            data: {
                impostors: data.impostors,
                include_default_game_envs: data.includeDefaultGameEnvs,
                include_user_game_envs: data.includeUserGameEnvs,
            }
        })
    }

    async startGame(roomId: string) {
        return await prismaClient.room.update({
            where: { id: roomId },
            data: { status: RoomStatus.PLAYING }
        })
    }

    async finishGame(roomId: string) {
        return await prismaClient.room.update({
            where: { id: roomId },
            data: { status: RoomStatus.IDLE }
        })
    }
}