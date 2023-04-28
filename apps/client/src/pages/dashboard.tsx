import { useState, useEffect, useCallback, useRef } from 'react'
import { Button } from '../components/ui/button'
import { Progress } from '../components/ui/progress'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'
import { api } from '../api'
import prettyBytes from 'pretty-bytes'
import { useErrors } from '../hooks/use-errors'
import { useNavigate } from 'react-router-dom'
import humanizeDuration from 'humanize-duration'
import { useToast } from '../hooks/ui/use-toast'
import { Eye, EyeOff, HardDrive } from 'lucide-react'
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '../components/ui/tooltip'
import { Toggle } from '../components/ui/toggle'

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
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [isAddingWebsite, setIsAddingWebsite] = useState(false)
  const [backupBeingRestored, setBackupBeingRestored] = useState<number | null>(null)
  const [backupBeingDownloaded, setBackupBeingDownloaded] = useState<number | null>(null)
  const [backups, setBackups] = useState<number[]>([])
  const [isCreatingBackup, setIsCreatingBackup] = useState(false)
  const [databases, setDatabases] = useState<Awaited<ReturnType<typeof api.userDatabases.query>>['databases']>([])
  const [isCreatingDatabase, setIsCreatingDatabase] = useState(false)

  const newWebsiteDomain = useRef('')
  const newWebsiteAccessPath = useRef('')
  const newDatabaseName = useRef('')

  const navigate = useNavigate()

  const { toast } = useToast()

  const [newPassword, setNewPassword] = useState('')
  const [oldPassword, setOldPassword] = useState('')

  const changePassword = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== newPassword) {
      await api.changePassword.mutate({ oldPassword, newPassword })
      toast({
        variant: 'default',
        title: 'Password changed',
        description: 'Your password has been changed successfully'
      });
      (e.target as HTMLFormElement).reset()
      for (const element of (e.target as HTMLFormElement).elements) {
        if (element instanceof HTMLInputElement) {
          element.value = ''
        }
      }
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'The new password cannot be the same as the old password'
      })
    }
  }, [newPassword, oldPassword])

  const {
    errors: newWebsiteErrors,
    updateErrors: updateNewWebsiteErrors,
    validators: newWebsiteValidators
  } = useErrors({
    domain: {
      ref: newWebsiteDomain,
      validator: (value: string) => {
        if (value.length === 0) {
          return 'Domain is required'
        }

        const domainRegex =
          /^(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}$/
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

  const { errors: newDatabaseErrors, updateErrors: updateNewDatabaseErrors, validators: newDatabaseValidators } = useErrors({
    name: {
      ref: newDatabaseName,
      validator: (value: string) => {
        if (value.length === 0) {
          return 'Name is required'
        }

        const nameRegex = /^[\w-]+$/
        if (!nameRegex.test(value)) {
          return 'Name must be a valid name'
        }

        return undefined
      }
    }
  })

  const fetchUserData = useCallback(async () => {
    api.userStorage
      .query()
      .then(({ storage }) => {
        setUserStorage({
          ...storage,
          total: storage.used + storage.available
        })
      })
      .catch(error => {
        console.error(error)
      })

    api.userWebsites
      .query()
      .then(({ websites }) => {
        setWebsites(websites)
      })
      .catch(error => {
        console.error(error)
      })

    api.userSshKey
      .query()
      .then(({ sshKey }) => {
        setSshKey(sshKey)
      })
      .catch(error => {
        console.error(error)
      })

    api.userBackups
      .query()
      .then(({ backups }) => {
        setBackups(backups.map(({ timestamp }) => timestamp))
      })
      .catch(error => {
        console.error(error)
      })

    api.userDatabases
      .query()
      .then(({ databases }) => {
        setDatabases(databases)
      })
      .catch((error) => {
        console.error(error)
      })
  }, [])

  useEffect(() => {
    void fetchUserData()
  }, [])

  const restoreBackup = useCallback(async (timestamp: number) => {
    try {
      setBackupBeingRestored(timestamp)
      await api.restoreBackup.mutate({ timestamp })
      await fetchUserData()
      setBackupBeingRestored(null)
      toast({
        variant: 'default',
        title: 'Backup restored',
        description: 'Your backup has been restored successfully'
      })
    } catch (error) {
      setBackupBeingRestored(null)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'An error occured while restoring your backup'
      })
    }
  }, [setBackupBeingRestored])

  const downloadBackup = useCallback(async (timestamp: number) => {
    try {
      setBackupBeingDownloaded(timestamp)
      await api.downloadBackup.query({ timestamp }).then(({ data }: { data: string }) => {
        const link = document.createElement('a')
        link.href = 'data:application/gzip;base64,' + data
        link.setAttribute('download', `backup-${timestamp}.tar.gz`)
        document.body.appendChild(link)
        link.click()
        link.remove()
      })

      setBackupBeingDownloaded(null)
      toast({
        variant: 'default',
        title: 'Backup downloaded',
        description: 'Your backup has been downloaded successfully'
      })
    } catch (error) {
      setBackupBeingDownloaded(null)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'An error occured while downloading your backup'
      })
      throw error
    }
  }, [setBackupBeingDownloaded])

  const addWebsite = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault()

      const { domain, accessPath } = {
        domain: newWebsiteDomain.current,
        accessPath: newWebsiteAccessPath.current
      }
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

  const password = localStorage.getItem('password')

  const createDatabase = useCallback(async (event: React.FormEvent) => {
    event.preventDefault()

    const { name } = { name: newDatabaseName.current }
    if (name !== undefined) {
      setIsCreatingDatabase(true)

      await api.createDatabase.mutate({ name })
      setDatabases([...databases, { name, size: 0 }])
      setIsCreatingDatabase(false)
      newDatabaseName.current = ''
    }

    (event.target as HTMLFormElement).reset()
    for (const element of (event.target as HTMLFormElement).elements) {
      if (element instanceof HTMLInputElement) {
        element.value = ''
      }
    }
  }, [databases])

  const createBackup = useCallback(async () => {
    setIsCreatingBackup(true)
    try {
      await api.createBackup.mutate()
      await fetchUserData()
      toast({
        variant: 'default',
        title: 'Backup created',
        description: 'Your backup has been created successfully'
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'An error occured while creating your backup'
      })
    }
    setIsCreatingBackup(false)
  }, [])

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
                <Input readOnly type={showPassword ? 'text' : 'password'} defaultValue={password ?? ''} />
                <Toggle variant="outline" onClick={() => { setShowPassword(!showPassword) }}>{showPassword ? <Eye /> : <EyeOff />}</Toggle>
              </div>
            </div>
            <div className="bg-white/100 border-solid border-[1px] border-slate-200 px-6 py-5 rounded-xl">
              <h2 className="mb-4 text-lg font-semibold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                SSH
              </h2>
              <div className="flex flex-col gap-3">
                <Input
                  readOnly
                  type="domain"
                  defaultValue={`${localStorage.getItem('name')?.trim() ?? ''
                    }@${location.hostname}`}
                />
                <Textarea readOnly value={sshKey} className="resize-none" />
              </div>
            </div>
          </div>
          <div className='bg-white/100 border-solid border-[1px] border-slate-200 px-6 py-5 rounded-xl'>
            <h2 className="mb-4 text-lg font-semibold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
              Change password
            </h2>
            <div className="flex flex-col gap-3">
              <form
                className='flex flex-col gap-3'
                onSubmit={changePassword}
              >
                <div className='flex gap-3'>
                  <Input
                    type={showOldPassword ? 'text' : 'password'}
                    placeholder='Previous password'
                    value={oldPassword}
                    onChange={(e) => { setOldPassword(e.target.value) }} />
                  <Toggle variant="outline" onClick={() => { setShowOldPassword(!showOldPassword) }}>{showOldPassword ? <Eye /> : <EyeOff />}</Toggle>
                </div>
                <div className='flex gap-3'>
                  <Input
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder='New password'
                    value={newPassword}
                    onChange={(e) => { setNewPassword(e.target.value) }} />
                  <Toggle variant="outline" onClick={() => { setShowNewPassword(!showNewPassword) }}>{showNewPassword ? <Eye /> : <EyeOff />}</Toggle>
                </div>
                <Button
                  type="submit"
                  disabled={newPassword.length === 0 || oldPassword.length === 0 || newPassword === oldPassword}
                >
                  Reset Password
                </Button>
              </form>
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
          <div className='bg-white/100 border-solid border-[1px] border-slate-200 px-6 py-5 rounded-xl'>
            <h2 className="mb-4 text-lg font-semibold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
              Backups
            </h2>
            {backups.length === 0 && <p className='text-gray-500'>No backups available</p>}
            <ul className='flex flex-col gap-3'>
              {backups.sort((a, b) => b - a).map((backupTimestamp, index) =>
                <li key={index}>
                  <div className="flex justify-between items-center">
                    <p>{humanizeDuration(Date.now() - backupTimestamp * 1000, { largest: 1, round: true })} ago</p>
                    <div className='flex gap-3'>
                      <Button
                        variant='destructiveOutline'
                        isLoading={backupBeingRestored === backupTimestamp}
                        onClick={async () => { await restoreBackup(backupTimestamp) }}
                      >
                        Restore
                      </Button>
                      <Button
                        variant='outline'
                        isLoading={backupBeingDownloaded === backupTimestamp}
                        onClick={async () => { await downloadBackup(backupTimestamp) }}
                      >
                        Download
                      </Button>
                    </div>
                  </div>
                </li>)}
              <li>
                <Button
                  variant='outline'
                  className='w-full'
                  isLoading={isCreatingBackup}
                  onClick={async () => { await createBackup() }}
                >
                  Create new backup
                </Button>
              </li>
            </ul>
          </div>
        </aside>
        <main className='flex-1 flex flex-col gap-8'>
          <div className='bg-white/100 border-solid border-[1px] border-slate-200 px-6 py-5 rounded-xl h-fit'>
            <h2 className="text-lg font-semibold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white mb-4">
              Websites
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Add your websites to the list below to enable access to them via the domain name.
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
          </div>
          <div className='bg-white/100 border-solid border-[1px] border-slate-200 px-6 py-5 rounded-xl h-fit'>
            <h2 className="text-lg font-semibold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white mb-4">
              Databases
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Create databases to store your data, and access them on&nbsp;
              <code className='bg-gray-100 dark:bg-gray-800 rounded-md px-2 py-1'>{location.hostname}</code>
              &nbsp;with your credentials.
            </p>
            <ul className="space-y-4">
              {databases.map((database, index) =>
                <li key={index}>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      defaultValue={database.name}
                      readOnly
                    />
                    <div>
                      <TooltipProvider>
                        <Tooltip delayDuration={0}>
                          <TooltipTrigger>
                            <div className='inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors data-[state=on]:bg-slate-200 dark:hover:bg-slate-800 dark:data-[state=on]:bg-slate-700 focus:outline-none dark:text-slate-100 focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:focus:ring-offset-slate-900 dark:hover:text-slate-100 dark:data-[state=on]:text-slate-100 bg-transparent border border-slate-200 hover:bg-slate-100 dark:border-slate-700 h-10 px-3'>
                              <HardDrive className='w-6 h-6' />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            {prettyBytes(database.size * 1024 * 1024)}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                </li>)}
              <li>
                <form onSubmit={createDatabase} className="space-y-4 md:space-y-6 flex flex-col" action="#">
                  <Input
                    type="text"
                    placeholder="Database name"
                    defaultValue={newDatabaseName.current}
                    onChange={(e) => { newDatabaseName.current = e.target.value }}
                    validator={(value) => {
                      const error = newDatabaseValidators.name.validator(value)
                      updateNewDatabaseErrors()
                      return error
                    }}
                  />
                  <Button
                    type="submit"
                    disabled={newDatabaseErrors.length > 0 || newDatabaseName.current.length === 0}
                    className='w-full'
                    isLoading={isCreatingDatabase}
                  >
                    Add database
                  </Button>
                </form>
              </li>
            </ul>
          </div>
        </main>
      </div>
    </div>
  </div>
}
