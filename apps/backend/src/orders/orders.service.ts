import { Injectable } from '@nestjs/common'
import type { Order } from '../generated/prisma/client'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class OrdersService {
	constructor(private readonly prisma: PrismaService) {}

	// userId comes from the JWT, never from model output: a customer cannot
	// reach another customer's order no matter what they ask the agent.
	findForUser(userId: string, number: string): Promise<Order | null> {
		return this.prisma.order.findFirst({ where: { userId, number } })
	}
}
