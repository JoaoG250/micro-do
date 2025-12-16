import api from "@/lib/axios";
import {
  LoginDto,
  CreateUserDto,
  LoginResponse,
  RegisterResponse,
  UserResponse,
} from "@repo/common/dto/auth";

export const authService = {
  login: async (data: LoginDto): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>("/auth/login", data);
    return response.data;
  },

  register: async (data: CreateUserDto): Promise<RegisterResponse> => {
    const response = await api.post<RegisterResponse>("/auth/register", data);
    return response.data;
  },

  refresh: async (): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>("/auth/refresh");
    return response.data;
  },

  profile: async (): Promise<UserResponse> => {
    const response = await api.get<UserResponse>("/auth/profile");
    return response.data;
  },
};
