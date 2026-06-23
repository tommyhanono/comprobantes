import React from 'react'
import { UploadScreen } from './screens/UploadScreen.jsx'
import { AdminScreen } from './screens/AdminScreen.jsx'
import { AdminLogin } from './screens/AdminLogin.jsx'

export default function App() {
  const [screen, setScreen]       = React.useState('upload')
  const [adminAuthed, setAuthed]  = React.useState(false)

  if (screen === 'admin') {
    if (!adminAuthed) {
      return <AdminLogin onSuccess={() => setAuthed(true)} />
    }
    return <AdminScreen onBack={() => { setScreen('upload'); setAuthed(false) }} />
  }

  return <UploadScreen onAdmin={() => setScreen('admin')} />
}
