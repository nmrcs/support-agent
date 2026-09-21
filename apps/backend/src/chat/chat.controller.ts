import {
	BadRequestException,
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	Post,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import {
	ChatRequest,
	type ChatHistory,
	type ChatResponse,
} from '@support-agent/contracts'
import { CurrentUser, type JwtUser } from '../auth/current-user.decorator'
import { ChatService } from './chat.service'

@ApiTags('chat')
@Controller('chat')
export class ChatController {
	constructor(private readonly chat: ChatService) {}

	@Post()
	async turn(
		@CurrentUser() user: JwtUser,
		@Body() body: unknown,
	): Promise<ChatResponse> {
		const parsed = ChatRequest.safeParse(body)
		if (!parsed.success) throw new BadRequestException(parsed.error.issues)
		return this.chat.turn(user.id, parsed.data.text)
	}

	@Get()
	history(@CurrentUser() user: JwtUser): Promise<ChatHistory> {
		return this.chat.history(user.id)
	}

	@Delete()
	@HttpCode(204)
	async reset(@CurrentUser() user: JwtUser): Promise<void> {
		await this.chat.reset(user.id)
	}
}
