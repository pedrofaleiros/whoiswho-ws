export class SocketError extends Error {
    message: string;
    constructor(message: string) {
        super();
        this.message = message;
    }
}

export class ResourceNotFoundError extends SocketError {
    constructor(message: string) {
        super(message);
    }
}

export class UserNotFound extends ResourceNotFoundError {
    constructor() {
        super("Usuário não encontrado.");
    }
}

export class RoomNotFound extends ResourceNotFoundError {
    constructor() {
        super("Sala não encontrada.");
    }
}

export class ValidationError extends SocketError {
    constructor(message: string) {
        super(message);
    }
}

export class NotAuthError extends SocketError {
    constructor() {
        super("Não autorizado.");
    }
}