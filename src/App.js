import React from 'react'
import { withAuthenticator } from 'aws-amplify-react'

class App extends React.Component {
  state = {
    notes: [{
        id: 1,
        note: 'Some random note'
      }
    ]
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
        <form className='mb3'>
          <input
            type='text'
            className='pa2 f4'
            placeholder='Enter your note'
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
