export interface DecodedToken {
    sub: string;
    iat: number;
    exp: number;
    roles: string[];
}

export interface AuthUser {
    id: string;
    email: string;
    roles: string[];
}
