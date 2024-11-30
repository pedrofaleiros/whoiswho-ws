import { User } from "@prisma/client";
import prismaClient from "../utils/prismaClient";
import { UserNotFound } from "../errors";

export default class UserRepository {

    async findById(id: string): Promise<User | null> {
        return await prismaClient.user.findUnique({ where: { id: id } });
    }

    async findByIdOrThrow(id: string): Promise<User> {
        var user = await prismaClient.user.findUnique({ where: { id: id } });
        if (!user) throw new UserNotFound();
        return user;
    }

    async findByUsername(username: string): Promise<User | null> {
        return await prismaClient.user.findUnique({ where: { username: username } });
    }

    async findByUsernameOrThrow(username: string): Promise<User> {
        var user = await prismaClient.user.findUnique({ where: { username: username } });
        if (!user) throw new UserNotFound();
        return user;
    }

}