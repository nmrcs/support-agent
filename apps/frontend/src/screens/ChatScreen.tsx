import { useEffect, useRef, useState } from 'react'
import { Button, ScrollShadow } from '@heroui/react'
import type { ChatMessage } from '@support-agent/contracts'
import { getHistory, resetChat, sendMessage } from '../api/client'
import { AssistantMessage } from '../components/chat/AssistantMessage'
import { PromptInput } from '../components/chat/PromptInput'
import { PromptSuggestions } from '../components/chat/PromptSuggestions'
import { ThinkingIndicator } from '../components/chat/ThinkingIndicator'
import { UserMessage } from '../components/chat/UserMessage'

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
	}, [messages, inFlight])

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
		<div className="flex h-full flex-col">
			{messages.length > 0 && (
				<div className="flex items-center justify-end border-b border-neutral-800 px-6 py-2">
					<Button size="sm" variant="primary" onPress={() => void onNewChat()}>
						New chat
					</Button>
				</div>
			)}
			<ScrollShadow ref={scrollRef} className="flex-1">
				<div className="mx-auto flex max-w-178.5 flex-col gap-8 px-4 pb-8 pt-8">
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
				</div>
			</ScrollShadow>

			<div className="shrink-0 bg-neutral-950 px-4 pb-4 pt-3">
				<div className="mx-auto flex max-w-178.5 flex-col gap-2">
					{error && <div className="text-sm text-red-400">{error}</div>}
					{escalated && (
						<div className="text-center text-sm text-amber-400">
							A human operator has this conversation now.
						</div>
					)}
					<PromptInput
						value={draft}
						onChange={setDraft}
						onSubmit={send}
						loading={inFlight}
					/>
					<p className="text-center text-xs text-neutral-500">
						AI can make mistakes. Check important info.
					</p>
				</div>
			</div>
		</div>
	)
}
