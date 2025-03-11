import { ResourceNotFoundError } from "../errors";
import prismaClient from "../utils/prismaClient";
import { RoomUser, User } from "@prisma/client";

export default class RoomUserRepository {

    async create(userId: string, roomId: string, sessionId: string) {
        return await prismaClient.roomUser.create({
            data: {
                session_id: sessionId,
                room_id: roomId,
                user_id: userId
            }
        });
    }

    async delete(sessionId: string) {
        await prismaClient.roomUser.delete({ where: { session_id: sessionId } });
    }

    async findBySessionId(sessionId: string): Promise<RoomUser | null> {
        const find = await prismaClient.roomUser.findUnique({ where: { session_id: sessionId } });
        return find;
    }

    async findBySessionIdOrThrow(sessionId: string): Promise<RoomUser> {
        var find = await prismaClient.roomUser.findUnique({ where: { session_id: sessionId } });
        if (!find) throw new ResourceNotFoundError("Sessão não encontrada.");
        return find;
    }

    async findByRoom(roomId: string) {
        const roomUsers = await prismaClient.roomUser.findMany({
            where: { room_id: roomId },
            include: { users: true }
        });
        return roomUsers;
    }

    async findByUser(userId: string) {
        return await prismaClient.roomUser.findMany({
            where: { user_id: userId }
        });
    }
}