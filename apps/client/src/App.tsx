import { useCallback, useState } from 'react'
import './App.css'
// import { ApiProvider, api } from './api'
import { api } from './api'

function App (): JSX.Element {
  // const userCreateMutation = api.userCreate.useMutation()

  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [sshKey, setSshKey] = useState('')
  const [token, setToken] = useState('')

  const createUser = useCallback(async () => {
    await api.userCreate.mutate({
      name,
      password,
      sshKey
    })
  }, [name, password, sshKey])

  const login = useCallback(async () => {
    const { token } = await api.userLogin.query({
      name,
      password
    })
    setToken(token)
  }, [name, password, setToken])

  return (
    <div className="App">
      {/* <ApiProvider> */}
      <div>
        <h2>Sign up</h2>
        <input type="text" value={name} onChange={e => { setName(e.target.value) }} />
        <input type="password" value={password} onChange={e => { setPassword(e.target.value) }} />
        <input type="text" value={sshKey} onChange={e => { setSshKey(e.target.value) }} />
        <button
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onClick={createUser}
        >
          Create user
        </button>
      </div>
      <div>
        <h2>Log in</h2>
        <input type="text" value={name} onChange={e => { setName(e.target.value) }} />
        <input type="password" value={password} onChange={e => { setPassword(e.target.value) }} />
        <button
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onClick={login}
        >
          Log in
        </button>
        <p>Token: {token}</p>
      </div>
      {/* </ApiProvider> */}
    </div>
  )
}

export default App
