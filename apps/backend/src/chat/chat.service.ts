import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import type {
	ChatHistory,
	ChatMessage,
	ChatResponse,
	ConversationDetail,
	ConversationSummary,
	TraceStep,
	TurnTrace,
} from '@support-agent/contracts'
import type { Conversation, Message } from '../generated/prisma/client'
import { LlmService, type LlmMessage } from '../llm/llm.service'
import { PrismaService } from '../prisma/prisma.service'
import { SYSTEM_PROMPT } from './prompt'
import { AgentTools, TOOL_DEFINITIONS, type ToolContext } from './tools'

// Enough for tool call -> retry -> answer; a dialog that needs more is not
// converging and belongs with a human.
const MAX_STEPS = 3
// Turns per conversation. A support dialog this long has stopped converging.
const MAX_TURNS = 15
const HISTORY_LIMIT = 20
const CONVERSATION_LIST_LIMIT = 50

const HANDOVER_TEXT =
	'I am handing this over to a human operator — they will pick up this conversation shortly.'
const ESCALATED_TEXT =
	'A human operator has this conversation now; they will reply here.'

@Injectable()
export class ChatService {
	private readonly logger = new Logger(ChatService.name)

	constructor(
		private readonly prisma: PrismaService,
		private readonly llm: LlmService,
		private readonly tools: AgentTools,
	) {}

	async turn(userId: string, text: string): Promise<ChatResponse> {
		const conversation = await this.openConversation(userId)
		this.logger.log({
			actionCode: 'chat.service.turn.started',
			conversationId: conversation.id,
			textLength: text.length,
		})

		// Once a human owns the conversation the agent stays silent: answering
		// past the handover would undo the escalation it just promised.
		if (conversation.escalated) {
			const trace = emptyTrace(true)
			await this.persistTurn(conversation.id, text, ESCALATED_TEXT, trace)
			return { text: ESCALATED_TEXT, escalated: true, trace }
		}

		const turnCount = await this.prisma.message.count({
			where: { conversationId: conversation.id, role: 'USER' },
		})
		if (turnCount >= MAX_TURNS) {
			return this.escalateWithoutAnswer(
				conversation.id,
				text,
				'turn limit reached',
			)
		}

		const messages = await this.buildMessages(conversation.id, text)
		const ctx: ToolContext = {
			userId,
			conversationId: conversation.id,
			escalated: false,
		}
		const steps: TraceStep[] = []
		const usage = { promptTokens: 0, completionTokens: 0 }
		let answer: string | null = null

		for (let step = 0; step < MAX_STEPS; step++) {
			const completion = await this.llm.chat({
				messages,
				tools: TOOL_DEFINITIONS,
			})
			usage.promptTokens += completion.usage.promptTokens
			usage.completionTokens += completion.usage.completionTokens

			const calls = completion.message.tool_calls
			steps.push({
				kind: 'llm',
				name: 'chat',
				ok: true,
				latencyMs: completion.latencyMs,
				detail: calls?.length
					? `requested ${calls.map((c) => c.function.name).join(', ')}`
					: undefined,
			})

			if (!calls?.length) {
				// Reasoning models prefix the visible text with blank lines once the
				// thinking is stripped; the transcript keeps the clean text.
				answer = (completion.message.content ?? '').trim()
				break
			}

			messages.push({
				role: 'assistant',
				content: completion.message.content,
				tool_calls: calls,
			})
			for (const call of calls) {
				const started = Date.now()
				const result = await this.tools.run(
					call.function.name,
					call.function.arguments,
					ctx,
				)
				steps.push({
					kind: 'tool',
					name: call.function.name,
					ok: !('error' in result),
					latencyMs: Date.now() - started,
					detail: JSON.stringify(result).slice(0, 200),
				})
				this.logger.log({
					actionCode: 'chat.service.turn.tool_called',
					conversationId: conversation.id,
					tool: call.function.name,
					ok: !('error' in result),
				})
				messages.push({
					role: 'tool',
					tool_call_id: call.id,
					content: JSON.stringify(result),
				})
			}
		}

		// The loop ran out without a text answer: hand over rather than fail —
		// escalation is a normal outcome of this pipeline, not an error.
		let reason = ctx.escalated ? 'agent called escalate_to_human' : undefined
		if (answer === null) {
			await this.markEscalated(conversation.id)
			ctx.escalated = true
			reason = 'max steps reached'
			answer = HANDOVER_TEXT
			this.logger.log({
				actionCode: 'chat.service.turn.escalated',
				conversationId: conversation.id,
				reason,
			})
		}

		const trace: TurnTrace = {
			steps,
			escalated: ctx.escalated,
			escalationReason: reason,
			usage,
		}
		await this.persistTurn(conversation.id, text, answer, trace)
		this.logger.log({
			actionCode: 'chat.service.turn.answered',
			conversationId: conversation.id,
			escalated: ctx.escalated,
			steps: steps.length,
			...usage,
		})
		return { text: answer, escalated: ctx.escalated, trace }
	}

	async history(userId: string): Promise<ChatHistory> {
		const conversation = await this.prisma.conversation.findFirst({
			where: { userId, closedAt: null },
			orderBy: { createdAt: 'desc' },
			include: { messages: { orderBy: { seq: 'asc' } } },
		})
		if (!conversation) return { messages: [], escalated: false }
		return {
			messages: conversation.messages.map(toChatMessage),
			escalated: conversation.escalated,
		}
	}

	async reset(userId: string): Promise<void> {
		await this.prisma.conversation.updateMany({
			where: { userId, closedAt: null },
			data: { closedAt: new Date() },
		})
		this.logger.log({ actionCode: 'chat.service.reset.closed', userId })
	}

	async list(userId: string): Promise<ConversationSummary[]> {
		const conversations = await this.prisma.conversation.findMany({
			where: { userId },
			orderBy: { createdAt: 'desc' },
			take: CONVERSATION_LIST_LIMIT,
			include: {
				_count: { select: { messages: true } },
				messages: { orderBy: { seq: 'desc' }, take: 1, select: { text: true } },
			},
		})
		return conversations.map((c) => ({
			id: c.id,
			startedAt: c.createdAt.toISOString(),
			closedAt: c.closedAt?.toISOString() ?? null,
			escalated: c.escalated,
			messageCount: c._count.messages,
			lastMessage: c.messages[0]?.text ?? null,
		}))
	}

	async detail(userId: string, id: string): Promise<ConversationDetail> {
		const conversation = await this.prisma.conversation.findFirst({
			where: { id, userId },
			include: { messages: { orderBy: { seq: 'asc' } } },
		})
		if (!conversation) throw new NotFoundException('conversation not found')
		return {
			id: conversation.id,
			startedAt: conversation.createdAt.toISOString(),
			closedAt: conversation.closedAt?.toISOString() ?? null,
			escalated: conversation.escalated,
			messages: conversation.messages.map(toChatMessage),
		}
	}

	private async escalateWithoutAnswer(
		conversationId: string,
		userText: string,
		reason: string,
	): Promise<ChatResponse> {
		await this.markEscalated(conversationId)
		const trace: TurnTrace = { ...emptyTrace(true), escalationReason: reason }
		await this.persistTurn(conversationId, userText, HANDOVER_TEXT, trace)
		this.logger.log({
			actionCode: 'chat.service.turn.escalated',
			conversationId,
			reason,
		})
		return { text: HANDOVER_TEXT, escalated: true, trace }
	}

	private markEscalated(conversationId: string): Promise<Conversation> {
		return this.prisma.conversation.update({
			where: { id: conversationId },
			data: { escalated: true },
		})
	}

	private async openConversation(userId: string): Promise<Conversation> {
		const existing = await this.prisma.conversation.findFirst({
			where: { userId, closedAt: null },
			orderBy: { createdAt: 'desc' },
		})
		if (existing) return existing
		return this.prisma.conversation.create({ data: { userId } })
	}

	private async buildMessages(
		conversationId: string,
		text: string,
	): Promise<LlmMessage[]> {
		// Only final texts are replayed to the model; past tool calls are not.
		// The agent's answer already carries what the tool returned.
		const history = await this.prisma.message.findMany({
			where: { conversationId },
			orderBy: { seq: 'desc' },
			take: HISTORY_LIMIT,
		})
		return [
			{ role: 'system', content: SYSTEM_PROMPT },
			...history
				.reverse()
				.map((m): LlmMessage =>
					m.role === 'USER'
						? { role: 'user', content: m.text }
						: { role: 'assistant', content: m.text },
				),
			{ role: 'user', content: text },
		]
	}

	private async persistTurn(
		conversationId: string,
		userText: string,
		agentText: string,
		trace: TurnTrace,
	): Promise<void> {
		await this.prisma.message.createMany({
			data: [
				{ conversationId, role: 'USER', text: userText },
				{ conversationId, role: 'AGENT', text: agentText, trace },
			],
		})
	}
}

function toChatMessage(m: Message): ChatMessage {
	return {
		role: m.role,
		text: m.text,
		trace: (m.trace as TurnTrace | null) ?? undefined,
	}
}

function emptyTrace(escalated: boolean): TurnTrace {
	return {
		steps: [],
		escalated,
		usage: { promptTokens: 0, completionTokens: 0 },
	}
}
