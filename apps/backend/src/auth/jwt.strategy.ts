import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import type { Env } from '../config/env'
import { PrismaService } from '../prisma/prisma.service'
import type { JwtUser } from './current-user.decorator'

interface JwtPayload {
	sub: string
	email: string
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(
		config: ConfigService<Env, true>,
		private readonly prisma: PrismaService,
	) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: config.get('AUTH_JWT_SECRET', { infer: true }),
		})
	}

	async validate(payload: JwtPayload): Promise<JwtUser> {
		const user = await this.prisma.user.findUnique({
			where: { id: payload.sub },
			select: { id: true, email: true, name: true },
		})
		if (!user) throw new UnauthorizedException('user not found')
		return user
	}
}
