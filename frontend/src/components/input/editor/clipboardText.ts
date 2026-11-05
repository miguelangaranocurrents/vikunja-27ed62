import type {Node as ProseNode, Slice} from '@tiptap/pm/model'

// Plain text for the clipboard. ProseMirror's default joins every block with a blank line,
// which flattens a bullet list into loose sentences. Lists keep their markers so the copied
// text still reads as the list it was.

function listItemToText(item: ProseNode, marker: string): string {
	const blocks: string[] = []
	item.forEach(child => {
		blocks.push(blockToText(child))
	})

	const indent = ' '.repeat(marker.length)
	return blocks
		.join('\n')
		.split('\n')
		.map((line, index) => (index === 0 ? marker : indent) + line)
		.join('\n')
}

function listToText(list: ProseNode, markerFor: (item: ProseNode, index: number) => string): string {
	const items: string[] = []
	list.forEach((item, _offset, index) => {
		items.push(listItemToText(item, markerFor(item, index)))
	})
	return items.join('\n')
}

function blockToText(node: ProseNode): string {
	switch (node.type.name) {
		case 'bulletList':
			return listToText(node, () => '- ')
		case 'orderedList':
			return listToText(node, (_item, index) => `${index + 1}. `)
		case 'taskList':
			return listToText(node, item => item.attrs.checked ? '- [x] ' : '- [ ] ')
		case 'heading':
			return '#'.repeat(Number(node.attrs.level) || 1) + ' ' + node.textContent
		default:
			return node.textContent
	}
}

export function sliceToClipboardText(slice: Slice): string {
	const blocks: string[] = []
	slice.content.forEach(node => {
		blocks.push(blockToText(node))
	})
	return blocks.join('\n\n')
}
