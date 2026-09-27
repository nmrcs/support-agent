import { Spinner } from '@heroui/react'

export function ThinkingIndicator() {
	return (
		<div className="flex items-center gap-2.5 text-sm text-muted">
			<Spinner size="sm" color="current" />
			<span>Thinking...</span>
		</div>
	)
}
