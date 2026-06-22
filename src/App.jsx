import React from 'react'
import { UploadScreen } from './screens/UploadScreen.jsx'
import { AdminScreen } from './screens/AdminScreen.jsx'

export default function App() {
  const [screen, setScreen] = React.useState('upload')

  return screen === 'admin'
    ? <AdminScreen onBack={() => setScreen('upload')} />
    : <UploadScreen onAdmin={() => setScreen('admin')} />
}
