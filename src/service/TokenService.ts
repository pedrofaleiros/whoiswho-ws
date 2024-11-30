import { verify } from "jsonwebtoken";
import Env from "../utils/env";
import { NotAuthError } from "../errors";

interface Payload {
    sub: string;
}

export default class TokenService {

    static validateToken(token: string): string {
        try {
            const { sub } = verify(
                token,
                Env.JWT_SECRET as string
            ) as Payload;

            return sub;
        } catch (error) {
            throw new NotAuthError();
        }
    }
}