import { Game, GamePlayer, PlayerRole, Room, User } from "@prisma/client";
import { GameDTO, GamePlayerDTO, UserDTO } from "../dto";
import { NotAuthError, ResourceNotFoundError, ValidationError } from "../errors";
import GameRepository from "../repository/GameRepository";
import RoomRepository from "../repository/RoomRepository";
import RoomUserRepository from "../repository/RoomUserRepository";
import RoomUserService from "./RoomUserService";
import prismaClient from "../utils/prismaClient";

export default class GameService {

    private repository = new GameRepository();
    private roomRepository = new RoomRepository();
    private roomUserRepository = new RoomUserRepository();
    private roomUserService = new RoomUserService();

    async findByRoom(roomId: string): Promise<GameDTO[]> {
        var room = await this.roomRepository.findById(roomId);
        if (!room) throw new ResourceNotFoundError("Sala não encontrada.");

        var games = await this.repository.findByRoom(room.id);

        var gamesDto: GameDTO[] = [];

        games.forEach((game) => {
            gamesDto.push({
                id: game.id,
                gameEnvironment: {
                    id: game.game_environments.id,
                    name: game.game_environments.name ?? ""
                },
                gamePlayers: game.game_players.map((p) => ({
                    id: p.id,
                    impostor: p.is_impostor,
                    user: {
                        id: p.user_id ?? "",
                        username: p.users?.username ?? "",
                    },
                    playerRole: p.player_roles ? {
                        id: p.player_roles.id ?? "",
                        name: p.player_roles.name ?? ""
                    } : null
                }))
            });
        });

        return gamesDto;
    }

    async create(sessionId: string): Promise<GameDTO> {
        var session = await this.roomUserRepository.findBySessionIdOrThrow(sessionId);
        var room = await this.roomRepository.findByIdOrThrow(session.room_id);

        if (room.owner_id !== session.user_id) throw new NotAuthError();

        var roomUsers = await this.roomUserService.getRoomUsers(room.id);
        this.validateImpostors(room, roomUsers.length);

        var gameEnv = await this.getRandGameEnv(room, roomUsers.length);

        var createdGame = await this.repository.create(room.id, gameEnv.id);

        var gamePlayers = await this.getGamePlayers(gameEnv.player_roles, roomUsers, room.impostors, createdGame);

        gamePlayers.forEach(async (gp) => {
            await prismaClient.gamePlayer.create({
                data: {
                    is_impostor: gp.impostor,
                    game_id: createdGame.id,
                    user_id: gp.user.id,
                    player_role_id: gp.playerRole?.id,
                }
            })
        })

        return {
            id: createdGame.id,
            gameEnvironment: {
                id: gameEnv.id,
                name: gameEnv.name ?? "",
            },
            gamePlayers: gamePlayers.map((p) => ({
                id: p.id,
                impostor: p.impostor,
                playerRole: p.playerRole,
                user: p.user
            }))
        };
    }

    private validateImpostors(room: Room, usersSize: number) {
        if (usersSize < 3 || room.impostors >= Math.ceil(usersSize / 2)) {
            throw new ValidationError("Impostores devem ser minoria");
        }
        if (room.impostors < 1 || room.impostors > 3) {
            throw new ValidationError("Quantidade inválida de impostores");
        }
    }

    private async getRandGameEnv(room: Room, usersSize: number) {
        const gameEnvs = await this.getGameEnvs(room, usersSize);

        const randomIndex = Math.floor(Math.random() * gameEnvs.length);
        const selectedGameEnv = gameEnvs[randomIndex];

        return selectedGameEnv;
    }

    private async getGameEnvs(room: Room, usersSize: number) {
        var list;

        if (room.include_default_game_envs) {
            if (room.include_user_game_envs) {
                list = await this.getAllGameEnvs(room.owner_id, usersSize, room.impostors);
            } else {
                list = await this.getDefaultGameEnvs(usersSize, room.impostors);
            }
        } else if (room.include_user_game_envs) {
            list = await this.getUserGameEnvs(room.owner_id, usersSize, room.impostors);
        }

        if (!list || list.length === 0) {
            throw new ValidationError("Nenhum ambiente encontrado para essa quantidade de jogadores.");
        }

        return list;
    }

    private async getAllGameEnvs(userId: string, usersSize: number, impostors: number) {
        var l1 = await this.getDefaultGameEnvs(usersSize, impostors);
        var l2 = await this.getUserGameEnvs(userId, usersSize, impostors);
        return [...l1, ...l2];
    }

    private async getDefaultGameEnvs(usersSize: number, impostors: number) {
        const gameEnvs = await this.repository.getDefaultGameEnvs();
        return gameEnvs.filter(g => g.player_roles.length >= usersSize - impostors);
    }

    private async getUserGameEnvs(userId: string, usersSize: number, impostors: number) {
        const gameEnvs = await this.repository.getUserGameEnvs(userId);
        return gameEnvs.filter(g => g.player_roles.length >= usersSize - impostors);
    }

    private async getGamePlayers(playerRoles: PlayerRole[], users: UserDTO[], impostors: number, game: Game) {

        if (playerRoles.length < users.length - impostors) {
            throw new ValidationError("Nenhum ambiente encontrado para essa quantidade de jogadores.");
        }

        playerRoles = this.shuffleArray(playerRoles);

        //Preenche lista
        var players: GamePlayerDTO[] = [];
        users.forEach((user) => {
            players.push({
                user: {
                    id: user.id,
                    username: user.username
                },
                impostor: false,
                id: "",
                playerRole: null
            })
        });

        //Marca impostores
        var total = 0;
        while (total < impostors) {
            let rand = Math.floor(Math.random() * users.length);

            if (!players[rand].impostor) {
                players[rand].impostor = true;
                total++;
            }
        }

        //Marca papeis
        var j = 0;
        for (var i = 0; i < players.length; i++) {
            if (!players[i].impostor) {
                players[i].playerRole = {
                    id: playerRoles[j].id,
                    name: playerRoles[j].name ?? "",
                };
                j++;
            }
        }

        return players;
    }

    private shuffleArray<T>(array: T[]): T[] {
        let shuffledArray = array.slice();
        for (let i = shuffledArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
        }
        return shuffledArray;
    }
}