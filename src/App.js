import React from 'react'
import { withAuthenticator } from 'aws-amplify-react'
import { API, graphqlOperation } from 'aws-amplify'
import { createNote } from './graphql/mutations'
import { listNotes } from './graphql/queries'

class App extends React.Component {
  state = {
    note: '',
    notes: []
  }

  async componentDidMount() {
    const res = await API.graphql(graphqlOperation(listNotes))
    this.setState({
      notes: res.data.listNotes.items
    })
  }

  _handleNoteChange = (e) => {
    this.setState({note: e.target.value})
  }

  _handleSubmit = async (e) => {
    const { note } = this.state
    e.preventDefault()

    const input = { note }
    const res = await API.graphql(graphqlOperation(createNote, { 
      input 
    }))

    const newNote = res.data.createNote
    this.setState({
      notes: [...this.state.notes, newNote],
      note: ''
    })
  }

  _renderNotes = () => {
    const { notes } = this.state 
    
    return notes.map(note => (
      <div key={note.id} className='flex items-center'>
        <li className='list pa3 f4'>{note.note}</li>
        <button className='bg-transparent bn f4'>
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
