import { Button } from '@heroui/react'
import { ChevronRightIcon } from '../Icons'

const SUGGESTIONS = [
	'Hi! What can you do?',
	'Where is my order 1001?',
	'How much is delivery?',
	'I want to talk to a human',
]

export function PromptSuggestions({
	onPick,
}: {
	onPick: (text: string) => void
}) {
	return (
		<div className="flex flex-col gap-5 pt-6 sm:pt-12">
			<div>
				<p className="font-display text-2xl">What do you want to check?</p>
				<p className="mt-2 text-sm leading-relaxed text-muted">
					Ask a question or start from one of the suggestions below.
				</p>
			</div>
			<div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
				{SUGGESTIONS.map((text) => (
					<Button
						key={text}
						variant="outline"
						fullWidth
						onPress={() => onPick(text)}
						className="group h-auto justify-between py-2.5 text-left whitespace-normal"
					>
						{text}
						<ChevronRightIcon className="size-4 shrink-0 text-muted opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" />
					</Button>
				))}
			</div>
		</div>
	)
}
