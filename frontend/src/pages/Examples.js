import React, { useEffect, useState } from 'react'

export default function Examples() {
  const [items, setItems] = useState([])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    fetch(import.meta.env.VITE_API_BASE + '/examples')
      .then(r => r.json())
      .then(setItems)
      .catch(() => setItems([]))
  }, [])

  function submit(e) {
    e.preventDefault()
    fetch(import.meta.env.VITE_API_BASE + '/examples', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description })
    })
      .then(r => r.json())
      .then(created => setItems(prev => [created, ...prev]))
    setName('')
    setDescription('')
  }

  return (
    <div>
      <h2>Examples</h2>
      <form onSubmit={submit} style={{ display: 'grid', gap: 8, maxWidth: 360 }}>
        <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
        <input placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
        <button type="submit">Create</button>
      </form>
      <ul>
        {items.map(i => (
          <li key={i._id}>
            <strong>{i.name}</strong> — {i.description}
          </li>
        ))}
      </ul>
    </div>
  )
}


