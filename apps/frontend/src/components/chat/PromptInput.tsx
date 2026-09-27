import { Button, Spinner, Surface } from '@heroui/react'
import { type ReactNode, useEffect, useRef } from 'react'
import { ArrowUpIcon } from '../Icons'

export function PromptInput({
	value,
	onChange,
	onSubmit,
	loading = false,
	placeholder = 'Type a message...',
	leading,
}: {
	value: string
	onChange: (v: string) => void
	onSubmit: () => void
	loading?: boolean
	placeholder?: string
	// Actions on the left of the send button, inside the field.
	leading?: ReactNode
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
		<Surface className="rounded-[1.75rem] border border-border bg-[color-mix(in_oklab,var(--surface)_72%,transparent)] shadow-lg shadow-black/10 backdrop-blur-xl backdrop-saturate-150 transition focus-within:border-(--focus)">
			<textarea
				ref={textareaRef}
				value={value}
				onChange={(e) => onChange(e.target.value)}
				onKeyDown={onKeyDown}
				placeholder={placeholder}
				rows={1}
				aria-label="Message input"
				className="block min-h-12 w-full resize-none bg-transparent px-5 pt-4 pb-1 text-sm outline-none placeholder:text-muted"
			/>
			<div className="flex items-center justify-between gap-2 px-2.5 pb-2.5">
				<div>{leading}</div>
				<Button
					isIconOnly
					onPress={onSubmit}
					isDisabled={!canSend}
					aria-label="Send"
					className="size-9 min-w-9 rounded-full"
				>
					{loading ? (
						<Spinner size="sm" color="current" />
					) : (
						<ArrowUpIcon className="size-4" />
					)}
				</Button>
			</div>
		</Surface>
	)
}
