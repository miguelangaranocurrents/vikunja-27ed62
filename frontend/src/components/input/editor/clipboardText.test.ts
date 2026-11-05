import {describe, it, expect, afterEach} from 'vitest'
import {ref} from 'vue'
import {Editor} from '@tiptap/core'

import {createEditorExtensions, type EditorExtensionDeps} from './editorExtensions'

window.API_URL = 'http://localhost:3456'

function createEditor(content: string) {
	const holder = document.createElement('div')
	document.body.appendChild(holder)

	let editor: Editor
	const deps: EditorExtensionDeps = {
		t: key => key,
		isEditing: ref(true),
		isEditEnabled: () => true,
		placeholder: '',
		contentHasChanged: ref(false),
		bubbleSave: () => {},
		getEditor: () => editor,
		uploadCallback: undefined,
		uploadAndInsertFiles: () => {},
	}

	editor = new Editor({element: holder, extensions: createEditorExtensions(deps), content})

	return editor
}

function clipboardText(editor: Editor) {
	return editor.view.someProp('clipboardTextSerializer', fn => fn(editor.state.doc.slice(0), editor.view))
}

afterEach(() => {
	document.body.innerHTML = ''
})

describe('copying as plain text', () => {
	it('keeps the list markers of a copied bullet list', () => {
		const editor = createEditor('<p>start</p><ul><li><p>this</p></li><li><p>is</p></li></ul><p>end</p>')

		expect(clipboardText(editor)).toBe('start\n\n- this\n- is\n\nend')
	})

	it('numbers copied ordered lists', () => {
		const editor = createEditor('<ol><li><p>one</p></li><li><p>two</p></li></ol>')

		expect(clipboardText(editor)).toBe('1. one\n2. two')
	})
})
