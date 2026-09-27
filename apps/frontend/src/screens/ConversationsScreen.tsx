import { Alert, Chip, Table } from '@heroui/react'
import type { ConversationSummary } from '@support-agent/contracts'
import { useEffect, useState } from 'react'
import { listConversations } from '../api/client'
import { ConversationDrawer } from '../components/conversations/ConversationDrawer'
import { formatDate } from '../lib/format'

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
		<div className="h-full overflow-y-auto">
			<div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 pt-10 pb-16 sm:px-6 sm:pt-14">
				<section>
					<h1 className="font-display text-4xl sm:text-5xl">Conversations</h1>
					<p className="tabular mt-3 text-muted">
						{loading ? '...' : `${items.length} conversations`}
					</p>
				</section>
				{error && (
					<Alert status="danger">
						<Alert.Indicator />
						<Alert.Content>
							<Alert.Description>{error}</Alert.Description>
						</Alert.Content>
					</Alert>
				)}
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
								<Table.Column id="msgs" className="text-right">
									Msgs
								</Table.Column>
							</Table.Header>
							<Table.Body
								items={items}
								renderEmptyState={() => (
									<div className="py-16 text-center text-sm text-muted">
										{loading ? 'Loading...' : 'No conversations yet'}
									</div>
								)}
							>
								{(c: ConversationSummary) => (
									<Table.Row id={c.id} className="cursor-pointer">
										<Table.Cell>
											<span className="tabular text-sm whitespace-nowrap text-muted">
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
												<span className="text-muted">—</span>
											)}
										</Table.Cell>
										<Table.Cell>
											<span className="line-clamp-1 max-w-xl text-sm">
												{c.lastMessage ?? '—'}
											</span>
										</Table.Cell>
										<Table.Cell className="text-right">
											<span className="tabular text-sm text-muted">
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
