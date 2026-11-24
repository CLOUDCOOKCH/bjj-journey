'use client'

import { useState, type FormEvent } from 'react'
import { signOut } from 'next-auth/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { trainingClient } from '@/lib/training/client'
import { timeZone, type TrainingData } from '@/lib/training/schemas'

type Preference = TrainingData<'preferences'>

export function AthleteSettings({ userId }: { userId: string }) {
  const client = useQueryClient()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [error, setError] = useState('')
  const [working, setWorking] = useState(false)
  const [password, setPassword] = useState('')
  const preferences = useQuery({
    queryKey: ['training', 'preferences'],
    queryFn: ({ signal }) => trainingClient.list<Preference>('preferences', signal),
  })
  const record = preferences.data?.find(item => item.data.key === 'training')
  const save = useMutation({
    mutationFn: (settings: Preference) => record
      ? trainingClient.update('preferences', record.id, record.version, settings)
      : trainingClient.create('preferences', settings),
    onSuccess: () => client.invalidateQueries({ queryKey: ['training', 'preferences'] }),
  })

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const zone = timeZone.safeParse(String(form.get('timeZone')))
    if (!zone.success) {
      setError('Enter a time zone such as Europe/Berlin or America/Toronto.')
      return
    }
    setError('')
    save.mutate({ key: 'training', timeZone: zone.data, weightUnit: form.get('weightUnit') === 'lb' ? 'lb' : 'kg' })
  }

  async function deleteAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setWorking(true)
    setError('')
    try {
      const response = await fetch('/api/account', {
        method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }),
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error ?? 'Account deletion failed')
      }
      const prefix = `bjj-journey:workout:${userId}:`
      try {
        for (const key of Object.keys(localStorage)) {
          if (key.startsWith(prefix)) localStorage.removeItem(key)
        }
      } finally {
        client.clear()
        await signOut({ callbackUrl: '/' })
      }
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Account deletion failed.')
    } finally {
      setWorking(false)
    }
  }

  return (
    <>
      <Card>
        <CardHeader><CardTitle>Training preferences</CardTitle></CardHeader>
        <CardContent>
          {preferences.isPending && <p role="status">Loading preferences…</p>}
          {preferences.isError && <p role="alert" className="text-destructive">{preferences.error.message}</p>}
          {preferences.isSuccess && (
            <form key={record?.id ?? 'new'} onSubmit={submit} className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-sm font-medium">Calendar time zone
                  <Input className="mt-1" name="timeZone" required defaultValue={record?.data.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone} />
                </label>
                <label className="text-sm font-medium">Weight units
                  <select className="mt-1 h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                    name="weightUnit" defaultValue={record?.data.weightUnit ?? 'kg'}>
                    <option value="kg">Kilograms (kg)</option><option value="lb">Pounds (lb)</option>
                  </select>
                </label>
              </div>
              {!deleteOpen && (error || save.error) && <p role="alert" className="text-destructive">{error || save.error?.message}</p>}
              <Button type="submit" disabled={save.isPending}>Save preferences</Button>
              {save.isSuccess && <p role="status" className="text-sm">Preferences saved.</p>}
            </form>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Account data</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline"><a href="/api/account/export" download>Export my data</a></Button>
            {!deleteOpen && <Button variant="outline" onClick={() => { setDeleteOpen(true); setError('') }}>Delete my account</Button>}
          </div>
          {deleteOpen && (
            <form onSubmit={deleteAccount} className="max-w-md space-y-3">
              <p>This permanently removes your account and its training history. Export your data first if you want to keep a copy.</p>
              <label className="block text-sm font-medium">Confirm your current password
                <Input className="mt-1" type="password" autoComplete="current-password" required value={password} onChange={event => setPassword(event.target.value)} />
              </label>
              {error && <p role="alert" className="text-destructive">{error}</p>}
              <div className="flex flex-wrap gap-2">
                <Button type="submit" variant="destructive" disabled={working || !password}>{working ? 'Deleting…' : 'Permanently delete account'}</Button>
                <Button type="button" variant="ghost" disabled={working} onClick={() => {
                  setDeleteOpen(false)
                  setPassword('')
                  setError('')
                }}>Cancel</Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </>
  )
}
