import { useCallback, useEffect, useState } from 'react'

export const errors = (validators: Record<string, {
  ref: React.MutableRefObject<string>
  validator: (value: string) => string | undefined
}>) => {
  const [errors, setErrors] = useState<string[]>([])

  const updateErrors = useCallback(() => {
    const errors = Object.values(validators).reduce<string[]>((acc, { ref, validator }) => {
      const error = validator(ref.current)
      if (error !== undefined) {
        acc.push(error)
      }
      return acc
    }, [])
    setErrors(errors)
  }, [setErrors])

  useEffect(() => {
    updateErrors()
  }, [])

  return { errors, updateErrors }
}
