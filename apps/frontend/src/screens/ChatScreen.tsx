import { Alert, Button, ScrollShadow } from '@heroui/react'
import type { ChatMessage } from '@support-agent/contracts'
import { useEffect, useRef, useState } from 'react'
import { getHistory, resetChat, sendMessage } from '../api/client'
import { AssistantMessage } from '../components/chat/AssistantMessage'
import { PromptInput } from '../components/chat/PromptInput'
import { PromptSuggestions } from '../components/chat/PromptSuggestions'
import { ThinkingIndicator } from '../components/chat/ThinkingIndicator'
import { UserMessage } from '../components/chat/UserMessage'
import { RestartIcon } from '../components/Icons'

export function ChatScreen() {
	const [messages, setMessages] = useState<ChatMessage[]>([])
	const [draft, setDraft] = useState('')
	const [inFlight, setInFlight] = useState(false)
	const [escalated, setEscalated] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const scrollRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		getHistory()
			.then((h) => {
				setMessages(h.messages)
				setEscalated(h.escalated)
			})
			.catch((e) => setError(String(e)))
	}, [])

	useEffect(() => {
		const el = scrollRef.current
		if (el) el.scrollTop = el.scrollHeight
	}, [messages, inFlight, error])

	async function sendTurn(text: string): Promise<void> {
		if (inFlight) return
		setError(null)
		setDraft('')
		setMessages((prev) => [...prev, { role: 'USER', text }])
		setInFlight(true)
		try {
			const res = await sendMessage(text)
			setMessages((prev) => [
				...prev,
				{ role: 'AGENT', text: res.text, trace: res.trace },
			])
			setEscalated(res.escalated)
		} catch (e) {
			setError(String(e))
		} finally {
			setInFlight(false)
		}
	}

	function send(): void {
		const text = draft.trim()
		if (text) void sendTurn(text)
	}

	async function onNewChat(): Promise<void> {
		if (inFlight) return
		setError(null)
		try {
			await resetChat()
			setMessages([])
			setEscalated(false)
		} catch (e) {
			setError(String(e))
		}
	}

	return (
		<section aria-label="Support chat" className="relative h-full">
			<ScrollShadow ref={scrollRef} className="h-full" aria-live="polite">
				{/* Room at the bottom for the input that floats over the chat. */}
				<div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 pt-8 pb-48 sm:px-6">
					{messages.length === 0 && (
						<PromptSuggestions onPick={(text) => void sendTurn(text)} />
					)}
					{messages.map((m, i) =>
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
					{inFlight && <ThinkingIndicator />}
					{error && (
						<Alert status="danger">
							<Alert.Indicator />
							<Alert.Content>
								<Alert.Description>{error}</Alert.Description>
							</Alert.Content>
						</Alert>
					)}
				</div>
			</ScrollShadow>

			{/* The input floats over the chat on a fade, with no bar under it. */}
			<div className="pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-background from-20% to-transparent pt-8">
				<div className="pointer-events-auto mx-auto flex max-w-3xl flex-col gap-2 px-4 pb-3 sm:px-6">
					{escalated && (
						<Alert status="warning">
							<Alert.Indicator />
							<Alert.Content>
								<Alert.Description>
									A human operator has this conversation now.
								</Alert.Description>
							</Alert.Content>
						</Alert>
					)}
					<PromptInput
						value={draft}
						onChange={setDraft}
						onSubmit={send}
						loading={inFlight}
						leading={
							messages.length > 0 && (
								<Button
									size="sm"
									variant="ghost"
									isDisabled={inFlight}
									onPress={() => void onNewChat()}
								>
									<RestartIcon className="size-4" />
									New chat
								</Button>
							)
						}
					/>
					<p className="text-center text-xs text-muted">
						AI can make mistakes. Check important info.
					</p>
				</div>
			</div>
		</section>
	)
}
