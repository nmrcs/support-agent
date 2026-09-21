import { Injectable, Logger, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import type { LoginResponse } from '@support-agent/contracts'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class AuthService {
	private readonly logger = new Logger(AuthService.name)

	constructor(
		private readonly prisma: PrismaService,
		private readonly jwt: JwtService,
	) {}

	async login(email: string, password: string): Promise<LoginResponse> {
		const user = await this.prisma.user.findUnique({ where: { email } })
		if (!user) {
			throw new UnauthorizedException('invalid credentials')
		}
		const ok = await bcrypt.compare(password, user.passwordHash)
		if (!ok) {
			this.logger.warn({
				actionCode: 'auth.service.login.wrong_password',
				email,
			})
			throw new UnauthorizedException('invalid credentials')
		}
		const accessToken = await this.jwt.signAsync({
			sub: user.id,
			email: user.email,
		})
		this.logger.log({ actionCode: 'auth.service.login.ok', userId: user.id })
		return {
			user: { id: user.id, email: user.email, name: user.name },
			accessToken,
		}
	}
}
