import { useEffect, useRef } from 'react'
import { Button, Spinner, Surface } from '@heroui/react'

export function PromptInput({
	value,
	onChange,
	onSubmit,
	loading = false,
	placeholder = 'Type a message...',
}: {
	value: string
	onChange: (v: string) => void
	onSubmit: () => void
	loading?: boolean
	placeholder?: string
}) {
	const textareaRef = useRef<HTMLTextAreaElement>(null)

	useEffect(() => {
		const el = textareaRef.current
		if (!el) return
		el.style.height = 'auto'
		el.style.height = `${Math.min(el.scrollHeight, 200)}px`
	}, [value])

	const canSend = !loading && value.trim().length > 0

	function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>): void {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault()
			if (canSend) onSubmit()
		}
	}

	return (
		<Surface className="rounded-2xl border border-neutral-800 focus-within:border-neutral-700 transition">
			<textarea
				ref={textareaRef}
				value={value}
				onChange={(e) => onChange(e.target.value)}
				onKeyDown={onKeyDown}
				placeholder={placeholder}
				rows={1}
				aria-label="Message input"
				className="block min-h-12 w-full resize-none bg-transparent px-4 pt-3.5 pb-1 text-sm text-neutral-100 placeholder:text-neutral-500 outline-none"
			/>
			<div className="flex items-center justify-end px-2 pb-2">
				<Button
					isIconOnly
					variant="primary"
					onPress={onSubmit}
					isDisabled={!canSend}
					aria-label="Send"
					className="rounded-full size-9 min-w-9"
				>
					{loading ? <Spinner color="current" size="sm" /> : <ArrowUpIcon />}
				</Button>
			</div>
		</Surface>
	)
}

function ArrowUpIcon() {
	return (
		<svg
			fill="none"
			height="16"
			viewBox="0 0 16 16"
			width="16"
			xmlns="http://www.w3.org/2000/svg"
			className="size-4"
			aria-hidden
		>
			<path
				clipRule="evenodd"
				d="M8 14.75a.75.75 0 0 1-.75-.75V3.81L4.53 6.53a.75.75 0 0 1-1.06-1.06l4-4a.75.75 0 0 1 1.06 0l4 4a.75.75 0 0 1-1.06 1.06L8.75 3.81V14a.75.75 0 0 1-.75.75"
				fill="currentColor"
				fillRule="evenodd"
			/>
		</svg>
	)
}
