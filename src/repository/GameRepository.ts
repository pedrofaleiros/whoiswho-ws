import { Game } from "@prisma/client";
import prismaClient from "../utils/prismaClient";

export default class GameRepository {

    async findByRoom(roomId: string) {
        return await prismaClient.game.findMany({
            where: { room_id: roomId },
            include: {
                game_environments: true, game_players: {
                    include: {
                        player_roles: true,
                        users: true
                    }
                }
            },
            orderBy: { created_at: "asc" },
        });
    }

    async getUserGameEnvs(userId: string) {
        return await prismaClient.gameEnvironment.findMany({
            where: { user_id: userId },
            include: { player_roles: true }
        });
    }

    async getDefaultGameEnvs() {
        return await prismaClient.gameEnvironment.findMany({
            where: { user_id: null },
            include: { player_roles: true }
        });
    }

    async create(roomId: string, gameEnvId: string) {
        return await prismaClient.game.create({
            data: {
                room_id: roomId,
                game_environment_id: gameEnvId,
            }
        });
    }
}