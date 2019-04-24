import React from 'react'
import { withAuthenticator } from 'aws-amplify-react'
import { API, graphqlOperation } from 'aws-amplify'
import { createNote, deleteNote, updateNote } from './graphql/mutations'
import { listNotes } from './graphql/queries'
import { onCreateNote, onDeleteNote, onUpdateNote } from './graphql/subscriptions'

class App extends React.Component {
  state = {
    note: '',
    notes: [],
    id: ''
  }

  componentDidMount() {
    this._getNotes()

    this.createNoteListner = API.graphql(graphqlOperation(onCreateNote)).subscribe({
      next: noteData => {
        const newNote = noteData.value.data.onCreateNote
        const prevNotes = this.state.notes.filter(note => note.id !== newNote.id)
        const updatedNotes = [...prevNotes, newNote]
        this.setState({ notes: updatedNotes })
      }
    })

    this.updateNoteListner = API.graphql(graphqlOperation(onUpdateNote)).subscribe({
      next: noteData => {
        const updatedNote = noteData.value.data.onUpdateNote
        const newNotes = this.state.notes.map(note => {
          return note.id === updatedNote.id ? updatedNote : note
        })
        this.setState({notes: newNotes})
      }
    })

    this.delteNoteListner = API.graphql(graphqlOperation(onDeleteNote)).subscribe({
      next: noteData => {
        const deletedNoteId = noteData.value.data.onDeleteNote.id
        const newNotes = this.state.notes.filter(note => note.id !== deletedNoteId)
        this.setState({notes: newNotes})
      }
    })
  }

  componentWillUnmount() {
    this.createNoteListner.unsubsribe()
    this.updateNoteListner.unsubsribe()
    this.delteNoteListner.unsubsribe()
  }

  _getNotes = async () => {
    const res = await API.graphql(graphqlOperation(listNotes))
    this.setState({
      notes: res.data.listNotes.items
    })
  }

  _handleNoteChange = (e) => {
    this.setState({note: e.target.value})
  }

  _isNoteExists = () => {
    const { id, notes } = this.state 

    if(!id) { return false }

    return notes.findIndex(note => note.id === id) > -1 
  }

  _handleSubmit = async (e) => {
    const { note } = this.state
    e.preventDefault()

    if(this._isNoteExists()) {
      return this._updateNote()
    }

    const input = { note }

    await API.graphql(graphqlOperation(createNote, { input }))
    this.setState({ note: '' })
  }

  _updateNote = async () => {
    const { note, id } = this.state
    const input = { note, id }

    await API.graphql(graphqlOperation(updateNote, { input }))

    this.setState({ note: '', id: '' })
  }

  _handleDelete = async (id) => {
    const input = { id }

    await API.graphql(graphqlOperation(deleteNote, { input }))
  }

  _handleNoteSelected = ({note, id}) => {
    this.setState({ note, id })
  }

  _renderNotes = () => {
    const { notes } = this.state 
    
    return notes.map(note => (
      <div key={note.id} className='flex items-center'>
        <li 
          className='list pa3 f4'
          onClick={() => this._handleNoteSelected(note)}>
          {note.note}
        </li>
        <button 
          className='bg-transparent bn f4'
          onClick={() => this._handleDelete(note.id)}>
          <span>&times;</span>
        </button>
      </div>
    ))
  }

  render() {
    return (
      <div className='flex flex-column items-center justify-center pa3 bg-light-blue'>
        <h1 className='code f2-l'>
          Note App
        </h1>
        <form className='mb3' onSubmit={this._handleSubmit}>
          <input
            type='text'
            className='pa2 f4'
            placeholder='Enter your note'
            onChange={this._handleNoteChange}
            value={this.state.note}
          />
          <button
            className='pa2 f4 ml2' 
            type='submit'>
            Add Note
          </button>
        </form>
        <div>
          {this._renderNotes()}
        </div>
      </div>
    )
  }
}

export default withAuthenticator(App, {
  includeGreetings: true
})
