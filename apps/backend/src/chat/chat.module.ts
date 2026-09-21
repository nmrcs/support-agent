import { Module } from '@nestjs/common'
import { LlmModule } from '../llm/llm.module'
import { OrdersModule } from '../orders/orders.module'
import { ChatController } from './chat.controller'
import { ChatService } from './chat.service'
import { ConversationsController } from './conversations.controller'
import { AgentTools } from './tools'

@Module({
	imports: [LlmModule, OrdersModule],
	controllers: [ChatController, ConversationsController],
	providers: [ChatService, AgentTools],
})
export class ChatModule {}
