import { api, apiClient } from "@/lib/axios";
import type {
  LoginDto,
  CreateUserDto,
  LoginResponse,
  RegisterResponse,
  UserResponse,
  SearchUserResponse,
} from "@repo/types/auth";

export const authService = {
  login: async (data: LoginDto): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>("/auth/login", data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post<void>("/auth/logout");
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
    const response = await apiClient.get<UserResponse>("/auth/profile");
    return response.data;
  },

  searchUsers: async (search: string): Promise<SearchUserResponse[]> => {
    const response = await apiClient.get<SearchUserResponse[]>("/auth/users", {
      params: { search },
    });
    return response.data;
  },
};
