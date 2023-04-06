import { useRef, useCallback, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'
import { api } from '../api'
import { useToast } from '../hooks/ui/use-toast'
import { useErrors } from '../hooks/use-errors'

const Login = () => {
  const { toast } = useToast()

  const name = useRef('')
  const password = useRef('')

  const navigate = useNavigate()

  const { errors, updateErrors, validators } = useErrors({
    username: { ref: name, validator: (value: string) => value.length === 0 ? 'Username is required' : undefined },
    password: { ref: password, validator: (value: string) => value.length === 0 ? 'Password is required' : undefined }
  })

  const loginUser = useCallback(async (event: FormEvent) => {
    event.preventDefault()

    api.userLogin.query({
      name: name.current,
      password: password.current
    })
      .then((response) => {
        localStorage.setItem('token', response.token)
        localStorage.setItem('password', password.current)
        localStorage.setItem('name', name.current)
        navigate('/')
      })
      .catch((error: Error) => {
        toast({
          variant: 'destructive',
          title: 'Failed to login',
          description:
            error.message.includes('NOT_FOUND')
              ? 'User not found'
              : error.message.includes('UNAUTHORIZED')
                ? 'Invalid password'
                : 'Something went wrong'
        })
      })
  }, [name.current, password.current, navigate, toast])

  return <div className="bg-gray-50 dark:bg-gray-900 h-full w-full">
  <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
    <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
      <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
        <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
          Log in to your account
        </h1>
        <form onSubmit={loginUser} className="space-y-4 md:space-y-6 flex flex-col" action="#">
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
          <Button
            type="submit"
            disabled={errors.length > 0}
          >
            Log in
          </Button>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            You don't have an account?{' '}
            <Link
              className="text-blue-500 hover:underline dark:text-blue-400"
              to="/signup"
            >
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  </div>
</div>
}

export default Login
