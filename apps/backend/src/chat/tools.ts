import { Injectable, Logger } from '@nestjs/common'
import { z } from 'zod'
import type { LlmToolDefinition } from '../llm/llm.service'
import { OrdersService } from '../orders/orders.service'
import { PrismaService } from '../prisma/prisma.service'

export interface ToolContext {
	userId: string
	conversationId: string
	// Set by escalate_to_human; the turn reads it after the loop.
	escalated: boolean
}

const GetOrderStatusArgs = z.object({ orderNumber: z.string().min(1) })
const EscalateArgs = z.object({ reason: z.string().min(1).max(200) })

export const TOOL_DEFINITIONS: LlmToolDefinition[] = [
	{
		type: 'function',
		function: {
			name: 'get_order_status',
			description:
				"Look up one of the signed-in customer's orders by its number. " +
				'Returns status, delivery estimate and tracking code, or found=false.',
			parameters: {
				type: 'object',
				additionalProperties: false,
				properties: {
					orderNumber: {
						type: 'string',
						description: 'The order number as the customer wrote it, e.g. 1001',
					},
				},
				required: ['orderNumber'],
			},
		},
	},
	{
		type: 'function',
		function: {
			name: 'escalate_to_human',
			description:
				'Hand the conversation over to a human operator. Call it when the ' +
				'customer asks for a person, is upset, or their order was not found ' +
				'twice in a row.',
			parameters: {
				type: 'object',
				additionalProperties: false,
				properties: {
					reason: {
						type: 'string',
						description: 'One short sentence: why the handover is needed',
					},
				},
				required: ['reason'],
			},
		},
	},
]

@Injectable()
export class AgentTools {
	private readonly logger = new Logger(AgentTools.name)

	constructor(
		private readonly orders: OrdersService,
		private readonly prisma: PrismaService,
	) {}

	// Arguments come from the model — a system boundary, so they are validated
	// here. A parse failure goes back to the model as an error result: it can
	// correct itself on the next step.
	async run(
		name: string,
		rawArgs: string,
		ctx: ToolContext,
	): Promise<Record<string, unknown>> {
		let args: unknown
		try {
			args = JSON.parse(rawArgs)
		} catch {
			return { error: 'arguments are not valid JSON' }
		}

		switch (name) {
			case 'get_order_status': {
				const parsed = GetOrderStatusArgs.safeParse(args)
				if (!parsed.success) return { error: 'invalid arguments' }
				const order = await this.orders.findForUser(
					ctx.userId,
					parsed.data.orderNumber,
				)
				if (!order) return { found: false }
				return {
					found: true,
					number: order.number,
					status: order.status,
					eta: order.eta,
					trackingCode: order.trackingCode,
				}
			}
			case 'escalate_to_human': {
				const parsed = EscalateArgs.safeParse(args)
				if (!parsed.success) return { error: 'invalid arguments' }
				await this.prisma.conversation.update({
					where: { id: ctx.conversationId },
					data: { escalated: true },
				})
				ctx.escalated = true
				this.logger.log({
					actionCode: 'chat.tools.run.escalated',
					conversationId: ctx.conversationId,
					reason: parsed.data.reason,
				})
				return { handedOver: true }
			}
			default:
				return { error: `unknown tool: ${name}` }
		}
	}
}
