import { z } from 'zod'

export const ChatRequest = z.object({
	text: z.string().min(1).max(4000),
})
export type ChatRequest = z.infer<typeof ChatRequest>

export const TokenUsage = z.object({
	promptTokens: z.number().int().nonnegative(),
	completionTokens: z.number().int().nonnegative(),
})
export type TokenUsage = z.infer<typeof TokenUsage>

export const TraceStep = z.object({
	kind: z.enum(['llm', 'tool']),
	name: z.string(),
	ok: z.boolean(),
	latencyMs: z.number().int().nonnegative(),
	detail: z.string().optional(),
})
export type TraceStep = z.infer<typeof TraceStep>

// The record of one turn: every model and tool call in order, and how the
// turn ended. Stored with the agent message and shown in the chat.
export const TurnTrace = z.object({
	steps: z.array(TraceStep),
	escalated: z.boolean(),
	escalationReason: z.string().optional(),
	usage: TokenUsage,
})
export type TurnTrace = z.infer<typeof TurnTrace>

export const ChatResponse = z.object({
	text: z.string(),
	escalated: z.boolean(),
	trace: TurnTrace,
})
export type ChatResponse = z.infer<typeof ChatResponse>

export const MessageRole = z.enum(['USER', 'AGENT'])
export type MessageRole = z.infer<typeof MessageRole>

export const ChatMessage = z.object({
	role: MessageRole,
	text: z.string(),
	trace: TurnTrace.optional(),
})
export type ChatMessage = z.infer<typeof ChatMessage>

export const ChatHistory = z.object({
	messages: z.array(ChatMessage),
	escalated: z.boolean(),
})
export type ChatHistory = z.infer<typeof ChatHistory>

export const ConversationSummary = z.object({
	id: z.string(),
	startedAt: z.string(),
	closedAt: z.string().nullable(),
	escalated: z.boolean(),
	messageCount: z.number().int().nonnegative(),
	lastMessage: z.string().nullable(),
})
export type ConversationSummary = z.infer<typeof ConversationSummary>

export const ConversationDetail = z.object({
	id: z.string(),
	startedAt: z.string(),
	closedAt: z.string().nullable(),
	escalated: z.boolean(),
	messages: z.array(ChatMessage),
})
export type ConversationDetail = z.infer<typeof ConversationDetail>
