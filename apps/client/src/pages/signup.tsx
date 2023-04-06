import { useCallback, useRef, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api'
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'
import { Textarea } from '../components/ui/textarea'
import { useToast } from '../hooks/ui/use-toast'
import { useErrors } from '../hooks/use-errors'

const Signup = () => {
  const { toast } = useToast()

  const name = useRef('')
  const password = useRef('')
  const sshKey = useRef('')

  const navigate = useNavigate()

  const { errors, updateErrors, validators } = useErrors({
    username: {
      ref: name,
      validator: (value: string) => {
        if (value.length === 0) {
          return 'Username is required'
        }

        const usernameRegex = /^[a-z][-a-z0-9_]*\$?$/
        if (!usernameRegex.test(value)) {
          return 'Username must start with a lowercase letter, and can only contain lowercase letters, numbers, underscores, and dashes'
        }

        return undefined
      }
    },
    password: { ref: password, validator: (value: string) => value.length === 0 ? 'Password is required' : undefined },
    sshKey: { ref: sshKey, validator: (value: string) => value.length === 0 ? 'SSH Key is required' : undefined }
  })

  const createUser = useCallback(async (event: FormEvent) => {
    event.preventDefault()

    await api.userCreate.mutate({
      name: name.current,
      password: password.current,
      sshKey: sshKey.current
    })
      .then(async () => await api.userLogin.query({
        name: name.current,
        password: password.current
      }))
      .then((response) => {
        localStorage.setItem('token', response.token)
        localStorage.setItem('password', password.current)
        localStorage.setItem('name', name.current)
        navigate('/')
      })
      .catch((error: Error) => {
        toast({
          variant: 'destructive',
          title: 'Failed to sign up',
          description:
            error.message.includes('CONFLICT')
              ? 'Username already taken'
              : 'Something went wrong'
        })
      })
  }, [name.current, password.current, sshKey.current, toast, navigate])

  return <div className="bg-gray-50 dark:bg-gray-900 h-full w-full">
    <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
      <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
        <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
          <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
            Create an account
          </h1>
          <form onSubmit={createUser} className="space-y-4 md:space-y-6 flex flex-col" action="#">
            <Input
              type="username"
              placeholder="Username"
              defaultValue={name.current}
              onChange={(e) => { name.current = e.target.value }}
              validator={(value) => {
                const error = validators.username.validator(value)
                updateErrors()
                return error
              }}
            />
            <Input
              type="password"
              placeholder="Password"
              defaultValue={password.current}
              onChange={(e) => { password.current = e.target.value }}
              validator={(value) => {
                const error = validators.password.validator(value)
                updateErrors()
                return error
              }}
            />
            <Textarea
              placeholder="SSH Key"
              className='min-h-1 max-h-32'
              defaultValue={sshKey.current}
              onChange={(e) => { sshKey.current = e.target.value }}
              validator={(value) => {
                const error = validators.sshKey.validator(value)
                updateErrors()
                return error
              }}
            />
            <Button
              type="submit"
              disabled={errors.length > 0}
            >
              Sign up
            </Button>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <Link
                className="text-blue-500 hover:underline dark:text-blue-400"
                to="/login"
              >
                Log in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  </div>
}

export default Signup
