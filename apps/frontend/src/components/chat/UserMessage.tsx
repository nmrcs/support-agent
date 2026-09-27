import { Surface } from '@heroui/react'

export function UserMessage({ text }: { text: string }) {
	return (
		<Surface
			variant="secondary"
			className="ml-auto w-fit max-w-[85%] rounded-3xl px-5 py-3 text-sm leading-relaxed whitespace-pre-wrap"
		>
			{text}
		</Surface>
	)
}
