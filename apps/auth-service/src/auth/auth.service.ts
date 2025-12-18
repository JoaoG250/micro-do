import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, ILike } from "typeorm";
import { User } from "@repo/db";
import * as bcrypt from "bcryptjs";
import { SearchUserResponse } from "@repo/common/dto/auth";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async validateUser(email: string, pass: string): Promise<User | null> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (user && (await bcrypt.compare(pass, user.passwordHash))) {
      return user;
    }
    return null;
  }

  async createUser(
    username: string,
    email: string,
    pass: string,
  ): Promise<User> {
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(pass, salt);
    const user = this.userRepository.create({
      username,
      email,
      passwordHash,
    });
    return this.userRepository.save(user);
  }

  async searchUsers(search: string): Promise<SearchUserResponse[]> {
    const users = await this.userRepository.find({
      where: [
        { username: ILike(`%${search}%`) },
        { email: ILike(`%${search}%`) },
      ],
      take: 10,
      select: ["id", "username"],
    });

    return users.map((user) => ({
      id: user.id,
      username: user.username,
    }));
  }
}
