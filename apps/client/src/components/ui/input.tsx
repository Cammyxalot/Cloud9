import * as React from 'react'

import { cn } from '../../lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  validator?: (value: string) => string | undefined
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, validator, onChange, ...props }, ref) => {
    const [error, setError] = React.useState<string | undefined>(undefined)

    const validate = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
      if (validator !== undefined) {
        setError(validator(event.target.value))
      }
    }, [props.value])

    return (
      <div className="flex flex-col w-full">
        <input
          className={cn(
            'flex h-10 w-full rounded-md border border-slate-300 bg-transparent py-2 px-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-50 dark:focus:ring-slate-400 dark:focus:ring-offset-slate-900',
            error !== undefined && 'border-red-500',
            error !== undefined && 'dark:border-red-500',
            error !== undefined && 'focus:ring-red-500',
            error !== undefined && 'dark:focus:ring-red-500',
            error !== undefined && 'focus:ring-offset-red-200',
            error !== undefined && 'dark:focus:ring-offset-red-900',
            className
          )}
          ref={ref}
          onChange={(event) => { onChange?.(event); validate(event) }}
          {...props}
        />
        {error !== undefined && <p className="text-red-500 text-xs !mt-2">{error}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'

export { Input }
