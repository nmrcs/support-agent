import { Avatar } from '@heroui/react'

export function ThinkingIndicator() {
	return (
		<div className="flex gap-3">
			<Avatar className="size-8 shrink-0">
				<Avatar.Fallback>AI</Avatar.Fallback>
			</Avatar>
			<div className="flex-1 min-w-0 pt-1.5">
				<span className="text-shimmer text-sm">Thinking...</span>
			</div>
		</div>
	)
}
