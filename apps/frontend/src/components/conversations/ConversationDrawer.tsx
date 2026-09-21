import { useEffect, useState } from 'react'
import { Chip, Drawer } from '@heroui/react'
import { useOverlayTriggerState } from 'react-stately'
import type { ConversationDetail } from '@support-agent/contracts'
import { getConversation } from '../../api/client'
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
					<Drawer.Dialog className="w-full max-w-3xl p-0!">
						<Drawer.Header className="px-6 py-4">
							<div className="flex flex-col gap-1.5">
								<Drawer.Heading className="flex items-center gap-2">
									<span className="font-mono text-sm text-neutral-400">
										{(conversation?.id ?? id ?? '').slice(0, 8)}
									</span>
									{conversation && (
										<>
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
										</>
									)}
								</Drawer.Heading>
								{conversation && (
									<div className="text-xs text-neutral-500">
										started {formatDate(conversation.startedAt)} ·{' '}
										{conversation.messages.length} messages
									</div>
								)}
							</div>
							<Drawer.CloseTrigger />
						</Drawer.Header>
						<Drawer.Body className="p-0! overflow-y-auto">
							<div className="px-6 py-6">
								{error && (
									<div className="mb-4 text-sm text-red-400">{error}</div>
								)}
								{!conversation && !error && (
									<div className="text-sm text-neutral-500">Loading...</div>
								)}
								{conversation && (
									<div className="flex flex-col gap-8">
										{conversation.messages.map((m, i) =>
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
										{conversation.messages.length === 0 && (
											<div className="text-center text-sm text-neutral-500">
												No messages
											</div>
										)}
									</div>
								)}
							</div>
						</Drawer.Body>
					</Drawer.Dialog>
				</Drawer.Content>
			</Drawer.Backdrop>
		</Drawer>
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
