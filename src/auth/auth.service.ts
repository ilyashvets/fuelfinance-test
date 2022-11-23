import * as bcrypt from 'bcryptjs';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService: JwtService,
        @InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>
    ) {
    }

    async register({name, email, password}) {
        const existUser = await this.userRepository.findOne({where: {email}});
        if (existUser) {
            await this.userRepository.delete({id: existUser.id})
            throw new HttpException('User already exist', HttpStatus.CONFLICT)
        }

        const user = await this.userRepository.save({name, email, password: await bcrypt.hash(password, 2)})

        delete user.password

        const access_token = await this.jwtService.signAsync({id: user.id, email: user.email});

        return {user, access_token}
    }

    async login({email, password}) {
        const user = await this.userRepository.findOne({where: {email}})

        if (!user) throw new HttpException('User not registered', HttpStatus.BAD_REQUEST)

        const compared = await bcrypt.compare(password, user.password);
        if (!compared) throw new HttpException('Bad credentials', HttpStatus.UNAUTHORIZED);

        delete user.password

        const access_token = await this.jwtService.signAsync({id: user.id, email: user.email});

        return {user, access_token}
    }
}
