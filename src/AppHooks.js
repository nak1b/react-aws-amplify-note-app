import React, { useState, useEffect } from 'react'
import { withAuthenticator } from 'aws-amplify-react'
import { API, graphqlOperation } from 'aws-amplify'
import { createNote, deleteNote, updateNote } from './graphql/mutations'
import { listNotes } from './graphql/queries'
import { onCreateNote, onDeleteNote, onUpdateNote } from './graphql/subscriptions'

const App = () => {
  const [id, setId] = useState('')
  const [note, setNote] = useState('')
  const [notes, setNotes] = useState([])

  useEffect(() => {
    getNotes()

    const createNoteListner = API.graphql(graphqlOperation(onCreateNote)).subscribe({
      next: noteData => {
        const newNote = noteData.value.data.onCreateNote
        setNotes(prevNotes => {
          const oldNotes = prevNotes.filter(item => item.id !== newNote.id)
          const updatedNotes = [...oldNotes, newNote]
          return updatedNotes
        })
      }
    })

    const updateNoteListner = API.graphql(graphqlOperation(onUpdateNote)).subscribe({
      next: noteData => {
        const updatedNote = noteData.value.data.onUpdateNote
        setNotes(prevNotes => {
          return prevNotes.map(item => {
            return item.id === updatedNote.id ? updatedNote : item
          })
        })
      }
    })

    const delteNoteListner = API.graphql(graphqlOperation(onDeleteNote)).subscribe({
      next: noteData => {
        const deletedNoteId = noteData.value.data.onDeleteNote.id
        setNotes(prevNotes => {
           return prevNotes.filter(item => item.id !== deletedNoteId)
        })
      }
    })

    return () => {
      createNoteListner.unsubscribe()
      updateNoteListner.unsubscribe()
      delteNoteListner.unsubscribe()
    }
  }, [])

  const getNotes = async () => {
    const res = await API.graphql(graphqlOperation(listNotes))
    setNotes(res.data.listNotes.items)
  }

  const handleNoteChange = (e) => {
    setNote(e.target.value)
  }

  const isNoteExists = () => {
    if(!id) { return false }

    return notes.findIndex(note => note.id === id) > -1 
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if(isNoteExists()) {
      return updateNoteItem()
    }

    const input = { note }

    await API.graphql(graphqlOperation(createNote, { input }))
    setNote('')
  }

  const updateNoteItem = async () => {
    const input = { note, id }

    await API.graphql(graphqlOperation(updateNote, { input }))

    setNote('')
    setId('')
  }

  const handleDelete = async (id) => {
    const input = { id }

    await API.graphql(graphqlOperation(deleteNote, { input }))
  }

  const handleNoteSelected = ({note, id}) => {
    setNote(note)
    setId(id)
  }

  const renderNotes = () => {
    return notes.map(item => (
      <div key={item.id} className='flex items-center'>
        <li 
          className='list pa3 f4'
          onClick={() => handleNoteSelected(item)}>
          {item.note}
        </li>
        <button 
          className='bg-transparent bn f4'
          onClick={() => handleDelete(item.id)}>
          <span>&times;</span>
        </button>
      </div>
    ))
  }

  
  return (
    <div className='flex flex-column items-center justify-center pa3 bg-light-blue'>
      <h1 className='code f2-l'>
        Note App
      </h1>
      <form className='mb3' onSubmit={handleSubmit}>
        <input
          type='text'
          className='pa2 f4'
          placeholder='Enter your note'
          onChange={handleNoteChange}
          value={note}
        />
        <button
          className='pa2 f4 ml2' 
          type='submit'>
          Add Note
        </button>
      </form>
      <div>
        {renderNotes()}
      </div>
    </div>
  )
}

export default withAuthenticator(App, {
  includeGreetings: true
})
