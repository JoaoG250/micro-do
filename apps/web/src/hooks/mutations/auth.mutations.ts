import { useMutation } from "@tanstack/react-query";
import { authService } from "@/services/auth.service";
import type { CreateUserDto, LoginDto } from "@repo/common/dto/auth";

export const useLoginMutation = () => {
  return useMutation({
    mutationFn: (data: LoginDto) => authService.login(data),
  });
};

export const useRegisterMutation = () => {
  return useMutation({
    mutationFn: (data: CreateUserDto) => authService.register(data),
  });
};
