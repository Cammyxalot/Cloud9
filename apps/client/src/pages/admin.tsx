import { useCallback, useEffect, useState } from 'react'
import { api } from '../api'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Progress } from '../components/ui/progress'
import prettyBytes from 'pretty-bytes'

const Admin = () => {
  const [stats, setStats] = useState<Record<string, any>>({})

  const navigate = useNavigate()

  const fetchUserStats = useCallback(async () => {
    const { stats } = await api.userStats.query()

    setStats(stats)
  }, [])

  useEffect(() => {
    void fetchUserStats()

    const interval = setInterval(() => {
      void fetchUserStats()
    }, 2000)

    return () => {
      clearInterval(interval)
    }
  }, [])

  return (
    <div className="bg-slate-100 dark:bg-gray-900 w-full min-h-screen">
      <div className="flex flex-col items-start justify-start px-6 py-8 mx-auto max-w-7xl lg:py-10">
        <div className="grid grid-cols-[1fr] gap-8 w-full">
          <header className="flex justify-between">
            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-4xl dark:text-white">
              Admin
            </h1>
            <Button
              onClick={() => {
                navigate('/')
              }}
            >
              Back to home
            </Button>
          </header>
          <aside className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 lg:grid-rows-2 gap-8">
            <div className="bg-white/100  border-solid border-[1px] border-slate-200 px-6 py-5 rounded-xl lg:row-span-2 col-start-1 md:col-span-2">
              <h2 className="mb-4 text-lg font-semibold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                CPU Usage
              </h2>
              <div className="flex items-center justify-center [zoom:0.6] sm:[zoom:1]">
                <svg className="transform -rotate-90 w-72 h-72">
                  <circle
                    cx="145"
                    cy="145"
                    r="120"
                    stroke="currentColor"
                    strokeWidth="16"
                    fill="transparent"
                    className="text-gray-100"
                  />
                  <circle
                    cx="145"
                    cy="145"
                    r="120"
                    stroke="currentColor"
                    strokeWidth="16"
                    fill="transparent"
                    className="text-black"
                    strokeDasharray={753}
                    strokeDashoffset={
                      stats.cpu?.usage !== undefined
                        ? 753 - (stats.cpu?.usage / 100) * 753
                        : 753
                    }
                  />
                </svg>
                <div className="absolute flex flex-col gap-2 items-center">
                  {stats.cpu?.usage !== undefined && (
                    <h3 className="text-5xl">{stats.cpu.usage}%</h3>
                  )}
                  {stats.cpu?.number !== undefined && (
                    <p className="text-lg text-gray-400">
                      {stats.cpu.number} CPUs
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="bg-white/100 border-solid border-[1px] border-slate-200 px-6 py-5 rounded-xl lg:row-start-1 lg:col-start-3">
              <h2 className="mb-4 text-lg font-semibold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                Memory
              </h2>
              <p className="text-gray-500 text-2xl">
                <span className="text-5xl text-black">
                  {prettyBytes((stats.memory?.usage ?? 0) * 1e6)}
                </span>{' '}
                / {prettyBytes((stats.memory?.total ?? 0) * 1e6)}
              </p>
            </div>
            <div className="bg-white/100 border-solid border-[1px] border-slate-200 px-6 py-5 rounded-xl lg:col-start-3">
              <h2 className="mb-4 text-lg font-semibold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                Storage
              </h2>
              {stats.disk?.used !== undefined &&
                stats.disk?.available !== undefined && (
                  <Progress
                    value={(stats.disk.used / stats.disk.total) * 100}
                  />
              )}
              <div className="grid grid-cols-2 mt-4 gap-4">
                <div>
                  <h4 className="text-gray-500 dark:text-gray-400 mb mt-2">
                    Storage used
                  </h4>
                  <p className="text-gray-500 text-base">
                    <span className="text-xl text-black">
                      {prettyBytes((stats.disk?.used ?? 0) * 1e6)}
                    </span>{' '}
                    / {prettyBytes((stats.disk?.total ?? 0) * 1e6)}
                  </p>
                </div>
                <div>
                  <h4 className="text-gray-500 dark:text-gray-400 mb mt-2">
                    Storage available
                  </h4>
                  <p className="text-black text-xl">
                    {prettyBytes((stats.disk?.available ?? 0) * 1e6)}
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
export default Admin
