import { useState, useEffect, useCallback, useRef } from 'react'
import { Button } from '../components/ui/button'
import { Progress } from '../components/ui/progress'
import { Input } from '../components/ui/input'
import { Toggle } from '../components/ui/toggle'
import { Textarea } from '../components/ui/textarea'
import { Eye, EyeOff } from 'lucide-react'
import { api } from '../api'
import prettyBytes from 'pretty-bytes'
import { useErrors } from '../hooks/use-errors'
import { useNavigate } from 'react-router-dom'

interface Website {
  domain: string
  accessPath: string
}

export const Dashboard = () => {
  const [websites, setWebsites] = useState<Website[]>([])
  const [userStorage, setUserStorage] = useState({
    used: 0,
    available: 0,
    total: 0
  })
  const [sshKey, setSshKey] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isAddingWebsite, setIsAddingWebsite] = useState(false)

  const newWebsiteDomain = useRef('')
  const newWebsiteAccessPath = useRef('')

  const navigate = useNavigate()

  const { errors: newWebsiteErrors, updateErrors: updateNewWebsiteErrors, validators: newWebsiteValidators } = useErrors({
    domain: {
      ref: newWebsiteDomain,
      validator: (value: string) => {
        if (value.length === 0) {
          return 'Domain is required'
        }

        const domainRegex = /^(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}$/
        if (!domainRegex.test(value)) {
          return 'Domain must be a valid domain name'
        }

        return undefined
      }
    },
    accessPath: {
      ref: newWebsiteAccessPath,
      validator: (value: string) => {
        if (value.length === 0) {
          return 'Access path is required'
        }

        const accessPathRegex = /^(\/[\w-]+)+$/
        if (!accessPathRegex.test(value)) {
          return 'Access path must be a valid path'
        }

        return undefined
      }
    }
  })

  useEffect(() => {
    api.userStorage.query().then(({ storage }) => {
      setUserStorage({
        ...storage,
        total: storage.used + storage.available
      })
    }).catch((error) => { console.error(error) })

    api.userWebsites.query().then(({ websites }) => {
      setWebsites(websites)
    }).catch((error) => { console.error(error) })

    api.userSshKey.query().then(({ sshKey }) => {
      setSshKey(sshKey)
    }).catch((error) => { console.error(error) })
  }, [])

  const addWebsite = useCallback(async (event: React.FormEvent) => {
    event.preventDefault()

    const { domain, accessPath } = { domain: newWebsiteDomain.current, accessPath: newWebsiteAccessPath.current }
    if (domain !== undefined && accessPath !== undefined) {
      setIsAddingWebsite(true)

      await api.addWebsite.mutate({ domain, accessPath })
      setWebsites([...websites, { domain, accessPath }])

      setIsAddingWebsite(false)
      newWebsiteDomain.current = ''
      newWebsiteAccessPath.current = ''
    }

    (event.target as HTMLFormElement).reset();
    ((event.target as HTMLFormElement).elements[0] as HTMLInputElement).focus()
    for (const element of (event.target as HTMLFormElement).elements) {
      if (element instanceof HTMLInputElement) {
        element.value = ''
      }
    }
  }, [websites])

  const logout = () => {
    localStorage.removeItem('name')
    localStorage.removeItem('password')
    localStorage.removeItem('token')

    navigate('/login')
  }

  return <div className="bg-slate-100 dark:bg-gray-900 w-full min-h-screen">
    <div className="flex flex-col items-start justify-start px-6 py-8 mx-auto max-w-7xl lg:py-10">
      <div className='grid grid-cols-[1fr,2fr] gap-8 w-full place-content-start'>
        <header className='flex justify-between col-span-2'>
          <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-4xl dark:text-white">
            Dashboard
          </h1>
          <Button onClick={logout}>Log out</Button>
        </header>
        <aside className="flex flex-col gap-8">
          <div className='bg-white/100 border-solid border-[1px] border-slate-200 px-6 py-5 rounded-xl'>
            <h2 className="mb-4 text-lg font-semibold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
              Database
            </h2>
            <div className='flex flex-col gap-3'>
              <Input readOnly type="domain" defaultValue={location.hostname} />
              <div className='password flex gap-3'>
                <Input readOnly type={showPassword ? 'text' : 'password'} defaultValue={localStorage.getItem('password') ?? ''} />
                <Toggle variant="outline" onClick={() => { setShowPassword(!showPassword) }}>{showPassword ? <Eye/> : <EyeOff />}</Toggle>
              </div>
            </div>
          </div>
          <div className='bg-white/100 border-solid border-[1px] border-slate-200 px-6 py-5 rounded-xl'>
            <h2 className="mb-4 text-lg font-semibold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
              SSH
            </h2>
            <div className='flex flex-col gap-3'>
              <Input readOnly type="domain" defaultValue={`${localStorage.getItem('name')?.trim() ?? ''}@${location.hostname}`} />
              <Textarea readOnly value={sshKey} className='resize-none' />
            </div>
          </div>
          <div className='bg-white/100 border-solid border-[1px] border-slate-200 px-6 py-5 rounded-xl'>
            <h2 className="mb-4 text-lg font-semibold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
              Storage
            </h2>
            {userStorage.used > 0 && userStorage.available > 0 &&
              <Progress value={userStorage.used / userStorage.total * 100} />
            }
            <div className='grid grid-cols-2 mt-4'>
              <div>
                <h4 className="text-gray-500 dark:text-gray-400 mb mt-2">Storage used</h4>
                <p className='text-gray-500 text-base'><span className='text-xl text-black'>{prettyBytes(userStorage.used * 1e3)}</span> / {prettyBytes(userStorage.total * 1e3)}</p>
              </div>
              <div>
                <h4 className="text-gray-500 dark:text-gray-400 mb mt-2">Storage available</h4>
                <p className='text-black text-xl'>{prettyBytes(userStorage.available * 1e3)}</p>
              </div>
            </div>
          </div>
        </aside>
        <main className='bg-white/100 border-solid border-[1px] border-slate-200 px-6 py-5 rounded-xl max-h-screen overflow-auto'>
          <h2 className="text-lg font-semibold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white mb-4">
            Websites
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Add the websites you want to monitor.
          </p>
          <ul className="space-y-4">
            {websites.map((website, index) => {
              return <li key={index} className="flex gap-2 last:!mb-4">
                <Input
                  type="text"
                  placeholder="Domain"
                  value={website.domain}
                  onChange={(event) => {
                    const newWebsites = [...websites]
                    newWebsites[index] = { ...newWebsites[index], domain: event.target.value }
                    setWebsites(newWebsites)
                  }}
                />
                <Input
                  type="text"
                  placeholder="Path"
                  value={website.accessPath}
                  onChange={(event) => {
                    const newWebsites = [...websites]
                    newWebsites[index] = { ...newWebsites[index], accessPath: event.target.value }
                    setWebsites(newWebsites)
                  }}
                />
              </li>
            })}
            <li>
              <form onSubmit={addWebsite} className="space-y-4 md:space-y-6 flex flex-col" action="#">
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Domain"
                    defaultValue={newWebsiteDomain.current}
                    onChange={(e) => { newWebsiteDomain.current = e.target.value }}
                    validator={(value) => {
                      const error = newWebsiteValidators.domain.validator(value)
                      updateNewWebsiteErrors()
                      return error
                    }}
                  />
                  <Input
                    type="text"
                    placeholder="Path"
                    defaultValue={newWebsiteAccessPath.current}
                    onChange={(e) => { newWebsiteAccessPath.current = e.target.value }}
                    validator={(value) => {
                      const error = newWebsiteValidators.accessPath.validator(value)
                      updateNewWebsiteErrors()
                      return error
                    }}
                  />
                </div>
                <Button
                  type="submit"
                  disabled={newWebsiteErrors.length > 0 || newWebsiteDomain.current.length === 0 || newWebsiteAccessPath.current.length === 0}
                  className='w-full'
                  isLoading={isAddingWebsite}
                >
                  Add website
                </Button>
              </form>
            </li>
          </ul>
        </main>
      </div>
    </div>
  </div>
}
