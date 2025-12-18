export interface LoginDto {
  email: string;
  password: string;
}

export interface CreateUserDto {
  username: string;
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
}

export interface RegisterResponse {
  id: string;
  email: string;
  username: string;
}

export interface UserResponse {
  id: string;
  email: string;
  username: string;
}

export interface SearchUserResponse {
  id: string;
  username: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
  username: string;
}

export interface AuthUser {
  id: string;
  email: string;
  username: string;
}
