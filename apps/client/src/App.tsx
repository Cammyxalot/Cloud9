import { useCallback, useEffect, useState } from 'react'
import './App.css'
// import { ApiProvider, api } from './api'
import { api } from './api'

function App (): JSX.Element {
  // const userCreateMutation = api.userCreate.useMutation()

  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [sshKey, setSshKey] = useState('')

  const createUser = useCallback(async () => {
    await api.userCreate.mutate({
      name,
      password,
      sshKey
    })
  }, [name, password, sshKey])

  useEffect(() => {
    void api.userStorage.query('baptiste').then(console.log)
  }, [])

  return (
    <div className="App">
      {/* <ApiProvider> */}
      <input
        type="text"
        value={name}
        onChange={e => {
          setName(e.target.value)
        }}
      />
      <input
        type="password"
        value={password}
        onChange={e => {
          setPassword(e.target.value)
        }}
      />
      <input
        type="text"
        value={sshKey}
        onChange={e => {
          setSshKey(e.target.value)
        }}
      />
      <button
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onClick={createUser}
      >
        Create user
      </button>
      {/* </ApiProvider> */}
    </div>
  )
}

export default App
