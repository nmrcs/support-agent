import { Controller, Get } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ApiTags } from '@nestjs/swagger'
import { Public } from '../auth/public.decorator'
import type { Env } from '../config/env'

@ApiTags('health')
@Controller('health')
export class HealthController {
	constructor(private readonly config: ConfigService<Env, true>) {}

	// The model is exposed so bench runs record which model produced their
	// numbers instead of trusting the operator's memory.
	@Public()
	@Get()
	check(): { status: 'ok'; model: string } {
		return {
			status: 'ok',
			model: this.config.get('LLM_MODEL', { infer: true }),
		}
	}
}
