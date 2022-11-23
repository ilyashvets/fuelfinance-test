import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AllowAny } from './allow-any';
import { LoginDto, RegisterDto } from './auth.dto';
import { AuthService } from './auth.service';

@Controller()
export class AuthController {
    constructor(
        private readonly authService: AuthService
    ) {
    }

    @AllowAny()
    @Post('register')
    @HttpCode(201)
    async register(@Body() body: RegisterDto) {
        return this.authService.register(body)
    }

    @AllowAny()
    @Post('login')
    async login(@Body() body: LoginDto) {
        return this.authService.login(body)
    }
}
