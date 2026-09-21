import { useEffect, useState } from 'react'
import { Chip, Table } from '@heroui/react'
import type { ConversationSummary } from '@support-agent/contracts'
import { listConversations } from '../api/client'
import { ConversationDrawer } from '../components/conversations/ConversationDrawer'

export function ConversationsScreen() {
	const [items, setItems] = useState<ConversationSummary[]>([])
	const [openId, setOpenId] = useState<string | null>(null)
	const [error, setError] = useState<string | null>(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		let cancelled = false
		listConversations()
			.then((res) => {
				if (!cancelled) {
					setItems(res)
					setError(null)
				}
			})
			.catch((e) => !cancelled && setError(String(e)))
			.finally(() => !cancelled && setLoading(false))
		return () => {
			cancelled = true
		}
	}, [])

	return (
		<div className="flex h-full flex-col">
			<div className="flex items-center justify-between border-b border-neutral-800 px-6 py-3">
				<span className="text-sm font-medium">Conversations</span>
				<span className="text-xs text-neutral-500">
					{loading ? '...' : `${items.length} conversations`}
				</span>
			</div>
			<div className="flex-1 overflow-y-auto p-6">
				{error && <div className="mb-4 text-sm text-red-400">{error}</div>}
				<Table>
					<Table.ScrollContainer>
						<Table.Content
							aria-label="Conversations"
							selectionMode="single"
							onRowAction={(key) => setOpenId(String(key))}
						>
							<Table.Header>
								<Table.Column id="started" isRowHeader>
									Started
								</Table.Column>
								<Table.Column id="status">Status</Table.Column>
								<Table.Column id="escalation">Escalation</Table.Column>
								<Table.Column id="last">Last message</Table.Column>
								<Table.Column id="msgs">Msgs</Table.Column>
							</Table.Header>
							<Table.Body
								items={items}
								renderEmptyState={() => (
									<div className="py-16 text-center text-sm text-neutral-500">
										{loading ? 'Loading...' : 'No conversations yet'}
									</div>
								)}
							>
								{(c: ConversationSummary) => (
									<Table.Row id={c.id}>
										<Table.Cell>
											<span className="text-xs text-neutral-400">
												{formatDate(c.startedAt)}
											</span>
										</Table.Cell>
										<Table.Cell>
											<Chip
												size="sm"
												variant="soft"
												color={c.closedAt ? 'default' : 'success'}
											>
												{c.closedAt ? 'closed' : 'open'}
											</Chip>
										</Table.Cell>
										<Table.Cell>
											{c.escalated ? (
												<Chip size="sm" variant="soft" color="warning">
													escalated
												</Chip>
											) : (
												<span className="text-neutral-600">—</span>
											)}
										</Table.Cell>
										<Table.Cell>
											<span className="max-w-md text-sm text-neutral-300 line-clamp-1">
												{c.lastMessage ?? '—'}
											</span>
										</Table.Cell>
										<Table.Cell>
											<span className="text-xs text-neutral-400">
												{c.messageCount}
											</span>
										</Table.Cell>
									</Table.Row>
								)}
							</Table.Body>
						</Table.Content>
					</Table.ScrollContainer>
				</Table>
			</div>
			<ConversationDrawer id={openId} onClose={() => setOpenId(null)} />
		</div>
	)
}

function formatDate(iso: string): string {
	const d = new Date(iso)
	return d.toLocaleString('en-GB', {
		day: '2-digit',
		month: 'short',
		hour: '2-digit',
		minute: '2-digit',
	})
}
