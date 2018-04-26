import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css'
import 'draft-js/dist/Draft.css'

import './HTMLField.sass'

import { ContentState, EditorState, convertToRaw } from 'draft-js'
import draftToHtml from 'draftjs-to-html'
import htmlToDraft from 'html-to-draftjs'
import React from 'react'
import { Editor } from 'react-draft-wysiwyg'

import { block } from '../utils'

const stateFromValue = value => {
  if (!value) {
    return EditorState.createEmpty()
  }
  const contentBlock = htmlToDraft(value)
  const editorContent = EditorState.createWithContent(
    ContentState.createFromBlockArray(contentBlock.contentBlocks)
  )
  // const contentToHtml = draftToHtml(
  //   convertToRaw(editorContent.getCurrentContent())
  // )
  // if (emptyContent(contentToHtml)) {
  //   return EditorState.createEmpty()
  // }
  return editorContent
}

export const stateToValue = editorState =>
  draftToHtml(convertToRaw(editorState.getCurrentContent()))

@block
export default class HTMLField extends React.Component {
  constructor(props) {
    super(props)
    this.value = null
    this.state = {
      editorState: null,
    }
  }

  componentWillMount() {
    const { value } = this.props
    this.newState(value || '')
  }

  componentWillReceiveProps({ value }) {
    if (value !== this.value) {
      this.newState(value)
    }
  }

  prepareValue(value) {
    return value === '<p></p>\n' ? '' : value ? value.trim() : ''
  }

  newState(value) {
    const newValue = this.prepareValue(value)
    this.value = newValue
    this.setState({
      editorState: stateFromValue(newValue),
    })
  }

  onChange(editorState) {
    const value = this.prepareValue(stateToValue(editorState))
    this.value = value
    this.setState({ editorState })
    this.props.onChange({ target: { value } })
  }

  checkValidity() {
    return true
  }

  render(b) {
    const {
      className,
      readOnly,
      onFocus,
      onBlur,
      onKeyDown,
      required,
      toolbar,
    } = this.props
    const { editorState } = this.state
    const HTMLToolbar = toolbar || {
      image: {
        uploadCallback: async file => ({
          data: { link: await readAsBase64(file) },
        }),
        previewImage: true,
        alt: { present: true, mandatory: false },
      },
    }
    return (
      <div className={b.mix(className)}>
        <Editor
          editorClassName={b.e('editor')}
          editorState={editorState}
          localization={{
            locale: 'fr',
          }}
          onBlur={e => onBlur(e)}
          onEditorStateChange={state => this.onChange(state)}
          onFocus={e => onFocus(e)}
          onKeyDown={e => onKeyDown(e)}
          placeholder="Entrez votre texte ici…"
          readOnly={readOnly}
          required={required}
          toolbar={HTMLToolbar}
          toolbarClassName={b.e('toolbar')}
          wrapperClassName={b.e('wrapper')}
        />
      </div>
    )
  }
}