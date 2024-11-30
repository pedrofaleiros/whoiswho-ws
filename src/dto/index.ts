export interface UserDTO {
    id: string;
    username: string;
}

export interface RoomDTO {
    id: string;
    ownerId: string;
    status: string;
    impostors: number;
    includeDefaultGameEnvs: boolean;
    includeUserGameEnvs: boolean;
}

export interface GameEnvDTO {
    id: string;
    name: string;
}

export interface PlayerRoleDTO {
    id: string;
    name: string;
}


export interface GameDTO {
    id: string;
    gameEnvironment: GameEnvDTO;
    gamePlayers: GamePlayerDTO[];
}

export interface GamePlayerDTO {
    id: string;
    user: UserDTO;
    playerRole: PlayerRoleDTO | null;
    impostor: boolean;
}

export enum RoomStatus {
    IDLE = 'IDLE',
    PLAYING = 'PLAYING',
}