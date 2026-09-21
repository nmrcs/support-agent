import {
	BadRequestException,
	Body,
	Controller,
	Get,
	Post,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import {
	LoginRequest,
	type AuthUser,
	type LoginResponse,
} from '@support-agent/contracts'
import { AuthService } from './auth.service'
import { CurrentUser, type JwtUser } from './current-user.decorator'
import { Public } from './public.decorator'

@ApiTags('auth')
@Controller('auth')
export class AuthController {
	constructor(private readonly auth: AuthService) {}

	@Public()
	@Post('login')
	async login(@Body() body: unknown): Promise<LoginResponse> {
		const parsed = LoginRequest.safeParse(body)
		if (!parsed.success) throw new BadRequestException(parsed.error.issues)
		return this.auth.login(parsed.data.email, parsed.data.password)
	}

	@Get('me')
	me(@CurrentUser() user: JwtUser): AuthUser {
		return user
	}
}
