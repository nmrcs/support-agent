import { Alert, Chip, Drawer, Spinner } from '@heroui/react'
import type { ConversationDetail } from '@support-agent/contracts'
import { useEffect, useState } from 'react'
import { useOverlayTriggerState } from 'react-stately'
import { getConversation } from '../../api/client'
import { formatDate } from '../../lib/format'
import { AssistantMessage } from '../chat/AssistantMessage'
import { UserMessage } from '../chat/UserMessage'

export function ConversationDrawer({
	id,
	onClose,
}: {
	id: string | null
	onClose: () => void
}) {
	const state = useOverlayTriggerState({
		isOpen: id !== null,
		onOpenChange: (v) => {
			if (!v) onClose()
		},
	})
	const [conversation, setConversation] = useState<ConversationDetail | null>(
		null,
	)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		if (!id) {
			setConversation(null)
			return
		}
		let cancelled = false
		setError(null)
		setConversation(null)
		getConversation(id)
			.then((c) => !cancelled && setConversation(c))
			.catch((e) => !cancelled && setError(String(e)))
		return () => {
			cancelled = true
		}
	}, [id])

	return (
		<Drawer state={state}>
			<Drawer.Backdrop>
				<Drawer.Content placement="right">
					<Drawer.Dialog className="w-full max-w-2xl p-0!">
						<Drawer.Header className="border-b border-separator px-6 py-4">
							<div className="flex flex-col gap-2">
								<Drawer.Heading className="font-mono text-sm font-normal text-muted">
									{(conversation?.id ?? id ?? '').slice(0, 8)}
								</Drawer.Heading>
								{conversation && (
									<div className="flex flex-wrap items-center gap-2">
										<Chip
											size="sm"
											variant="soft"
											color={conversation.closedAt ? 'default' : 'success'}
										>
											{conversation.closedAt ? 'closed' : 'open'}
										</Chip>
										{conversation.escalated && (
											<Chip size="sm" variant="soft" color="warning">
												escalated
											</Chip>
										)}
										<span className="tabular text-xs text-muted">
											started {formatDate(conversation.startedAt)} ·{' '}
											{conversation.messages.length} messages
										</span>
									</div>
								)}
							</div>
							<Drawer.CloseTrigger />
						</Drawer.Header>
						<Drawer.Body className="overflow-y-auto p-0!">
							<div className="flex flex-col gap-6 px-6 py-6">
								{error && (
									<Alert status="danger">
										<Alert.Indicator />
										<Alert.Content>
											<Alert.Description>{error}</Alert.Description>
										</Alert.Content>
									</Alert>
								)}
								{!conversation && !error && (
									<div className="flex items-center gap-2.5 text-sm text-muted">
										<Spinner size="sm" color="current" />
										Loading...
									</div>
								)}
								{conversation?.messages.map((m, i) =>
									m.role === 'USER' ? (
										<UserMessage key={i} text={m.text} />
									) : (
										<AssistantMessage
											key={i}
											text={m.text}
											trace={m.trace}
											escalated={m.trace?.escalated}
										/>
									),
								)}
								{conversation?.messages.length === 0 && (
									<p className="text-center text-sm text-muted">No messages</p>
								)}
							</div>
						</Drawer.Body>
					</Drawer.Dialog>
				</Drawer.Content>
			</Drawer.Backdrop>
		</Drawer>
	)
}
