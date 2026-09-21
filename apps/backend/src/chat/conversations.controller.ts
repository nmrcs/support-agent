import { Controller, Get, Param } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import type {
	ConversationDetail,
	ConversationSummary,
} from '@support-agent/contracts'
import { CurrentUser, type JwtUser } from '../auth/current-user.decorator'
import { ChatService } from './chat.service'

@ApiTags('conversations')
@Controller('conversations')
export class ConversationsController {
	constructor(private readonly chat: ChatService) {}

	@Get()
	list(@CurrentUser() user: JwtUser): Promise<ConversationSummary[]> {
		return this.chat.list(user.id)
	}

	@Get(':id')
	detail(
		@CurrentUser() user: JwtUser,
		@Param('id') id: string,
	): Promise<ConversationDetail> {
		return this.chat.detail(user.id, id)
	}
}
