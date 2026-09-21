import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { Env } from '../config/env'

export interface LlmToolCall {
	id: string
	type: 'function'
	function: { name: string; arguments: string }
}

export type LlmMessage =
	| { role: 'system' | 'user'; content: string }
	| { role: 'assistant'; content: string | null; tool_calls?: LlmToolCall[] }
	| { role: 'tool'; tool_call_id: string; content: string }

export interface LlmToolDefinition {
	type: 'function'
	function: {
		name: string
		description: string
		parameters: Record<string, unknown>
	}
}

export interface LlmUsage {
	promptTokens: number
	completionTokens: number
}

export interface LlmCompletion {
	message: { content: string | null; tool_calls?: LlmToolCall[] }
	usage: LlmUsage
	latencyMs: number
}

// A stuck provider must not hold a turn open forever; generation itself takes
// tens of seconds at most.
const CHAT_TIMEOUT_MS = 120_000

@Injectable()
export class LlmService {
	private readonly logger = new Logger(LlmService.name)
	private readonly baseUrl: string
	private readonly apiKey: string
	private readonly model: string

	constructor(config: ConfigService<Env, true>) {
		this.baseUrl = config.get('LLM_BASE_URL', { infer: true })
		this.apiKey = config.get('LLM_API_KEY', { infer: true })
		this.model = config.get('LLM_MODEL', { infer: true })
	}

	async chat(params: {
		messages: LlmMessage[]
		tools: LlmToolDefinition[]
	}): Promise<LlmCompletion> {
		const started = Date.now()
		this.logger.log({
			actionCode: 'llm.service.chat.request',
			model: this.model,
			messages: params.messages.length,
		})

		const res = await fetch(`${this.baseUrl}/chat/completions`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${this.apiKey}`,
			},
			signal: AbortSignal.timeout(CHAT_TIMEOUT_MS),
			body: JSON.stringify({
				model: this.model,
				messages: params.messages,
				tools: params.tools,
				tool_choice: 'auto',
			}),
		})
		if (!res.ok) {
			const body = await res.text()
			this.logger.error({
				actionCode: 'llm.service.chat.error',
				status: res.status,
				body: body.slice(0, 500),
			})
			throw new Error(`LLM provider answered ${res.status}`)
		}

		const data = (await res.json()) as {
			choices: {
				message: { content: string | null; tool_calls?: LlmToolCall[] }
			}[]
			usage?: { prompt_tokens?: number; completion_tokens?: number }
		}
		const message = data.choices[0]?.message
		if (!message) throw new Error('LLM provider answered with no choices')

		const usage: LlmUsage = {
			promptTokens: data.usage?.prompt_tokens ?? 0,
			completionTokens: data.usage?.completion_tokens ?? 0,
		}
		const latencyMs = Date.now() - started
		this.logger.log({
			actionCode: 'llm.service.chat.response',
			model: this.model,
			latencyMs,
			toolCalls: message.tool_calls?.length ?? 0,
			...usage,
		})
		return { message, usage, latencyMs }
	}
}
