import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import * as bcrypt from 'bcrypt'
import { PrismaClient, type Prisma } from '../src/generated/prisma/client'
import { validateEnv } from '../src/config/env'
// Real dialogs recorded against qwen/qwen3.5-9b, traces included: the
// Conversations screen has something to show on a fresh clone.
import CONVERSATIONS from './seed-conversations.json'

const env = validateEnv(process.env)
const prisma = new PrismaClient({
	adapter: new PrismaPg({ connectionString: env.DATABASE_URL }),
})

interface OrderSeed {
	number: string
	status: 'PLACED' | 'SHIPPED' | 'DELIVERED'
	eta: string
	trackingCode: string | null
	total: string
	currency: string
}

// Order 5555 deliberately exists for nobody: it is the "not found" branch of
// the reference dialog.
const USERS: { email: string; name: string; orders: OrderSeed[] }[] = [
	{
		email: 'alice@example.com',
		name: 'Alice',
		orders: [
			{
				number: '1001',
				status: 'SHIPPED',
				eta: '2 business days',
				trackingCode: 'TRK-84121-XA',
				total: '64.90',
				currency: 'USD',
			},
			{
				number: '1002',
				status: 'DELIVERED',
				eta: 'delivered',
				trackingCode: 'TRK-83015-KP',
				total: '18.50',
				currency: 'USD',
			},
			{
				number: '1003',
				status: 'PLACED',
				eta: '4 business days',
				trackingCode: null,
				total: '129.00',
				currency: 'USD',
			},
		],
	},
	{
		email: 'bob@example.com',
		name: 'Bob',
		orders: [
			{
				number: '2001',
				status: 'PLACED',
				eta: '5 business days',
				trackingCode: null,
				total: '42.00',
				currency: 'USD',
			},
			{
				number: '2002',
				status: 'SHIPPED',
				eta: '1 business day',
				trackingCode: 'TRK-90233-QF',
				total: '77.35',
				currency: 'USD',
			},
			{
				number: '2003',
				status: 'DELIVERED',
				eta: 'delivered',
				trackingCode: 'TRK-88410-ZR',
				total: '9.99',
				currency: 'USD',
			},
		],
	},
]

async function main(): Promise<void> {
	const passwordHash = await bcrypt.hash('demo', 12)
	const userIds = new Map<string, string>()
	for (const u of USERS) {
		const user = await prisma.user.create({
			data: { email: u.email, name: u.name, passwordHash },
		})
		userIds.set(u.email, user.id)
		for (const o of u.orders) {
			await prisma.order.create({ data: { ...o, userId: user.id } })
		}
	}

	for (const c of CONVERSATIONS) {
		const userId = userIds.get(c.email)
		if (!userId) throw new Error(`conversation for unseeded user: ${c.email}`)
		await prisma.conversation.create({
			data: {
				userId,
				escalated: c.escalated,
				closedAt: c.closed ? new Date() : null,
				messages: {
					create: c.messages.map((m) => ({
						role: m.role as 'USER' | 'AGENT',
						text: m.text,
						trace: ('trace' in m
							? (m.trace as Prisma.InputJsonValue)
							: undefined) as Prisma.InputJsonValue | undefined,
					})),
				},
			},
		})
	}

	console.log(
		`Seeded ${USERS.length} customers with 3 orders each and ${CONVERSATIONS.length} conversations (password: demo)`,
	)
}

main()
	.then(() => prisma.$disconnect())
	.catch((e) => {
		console.error(e)
		return prisma.$disconnect().then(() => process.exit(1))
	})
