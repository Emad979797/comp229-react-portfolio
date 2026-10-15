import React, { useEffect, useState } from 'react';
import { api, setToken, hasToken } from './api.js';
const fields = {
  contacts: ['firstname', 'lastname', 'email', 'phone', 'message'],
  projects: ['title', 'firstname', 'lastname', 'email', 'completion', 'description'],
  qualifications: ['title', 'firstname', 'lastname', 'email', 'completion', 'description'],
  users: ['name', 'email', 'password'],
};
export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [signup, setSignup] = useState(false);
  const [resource, setResource] = useState('contacts');
  const [records, setRecords] = useState([]);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (hasToken()) api('/auth/me').then(setUser).catch(() => { setToken(''); setUser(null); });
  }, []);
  async function load(name = resource) {
    try { setRecords(await api('/' + name)); } catch (e) { setError(e.message); }
  }
  useEffect(() => { if (user?.canManage) load(); }, [resource, user]);
  async function authenticate(event) {
    event.preventDefault(); setBusy(true); setError(''); setNotice('');
    const values = Object.fromEntries(new FormData(event.currentTarget));
    try {
      if (signup) await api('/users', { method: 'POST', body: values });
      const session = await api('/auth/signin', { method: 'POST', body: { email: values.email, password: values.password } });
      setToken(session.token); setUser(session.user);
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  async function signout() {
    setError('');
    try { await api('/auth/signout', { method: 'POST' }); setToken(''); setUser(null); setRecords([]); setEditing(null); setNotice('Signed out successfully.'); }
    catch (e) { setError(e.message); }
  }
  async function save(event) {
    event.preventDefault(); setBusy(true); setError(''); setNotice('');
    const form = event.currentTarget;
    const body = Object.fromEntries(new FormData(form));
    if (!body.password) delete body.password;
    try {
      await api('/' + resource + (editing?._id ? '/' + editing._id : ''), { method: editing?._id ? 'PUT' : 'POST', body });
      setEditing(null); form.reset(); setNotice('Record saved.'); await load();
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  async function remove(record) {
    if (!window.confirm('Delete this record?')) return;
    setError('');
    try {
      await api('/' + resource + '/' + record._id, { method: 'DELETE' });
      if (resource === 'users' && record._id === user._id) { setToken(''); setUser(null); setRecords([]); }
      else await load();
      setNotice('Record deleted.');
    } catch (e) { setError(e.message); }
  }
  return <section className="dashboard">
    <p className="eyebrow">Portfolio workspace</p><h1>{user ? 'Manage your portfolio.' : 'Sign in to your workspace.'}</h1>
    {error && <p role="alert" className="api-error">{error}</p>}
    {notice && <p role="status">{notice}</p>}
    {!user ? <form className="workspace-form" onSubmit={authenticate}>
      {signup && <label>Name<input name="name" required autoComplete="name" /></label>}
      <label>Email<input name="email" type="email" required autoComplete="username" /></label>
      <label>Password<input name="password" type="password" minLength="8" maxLength="72" required autoComplete={signup ? 'new-password' : 'current-password'} /></label>
      <button className="button" disabled={busy}>{busy ? 'Please wait…' : signup ? 'Create account & sign in' : 'Sign in'}</button>
      <button type="button" className="text-link" onClick={() => { setSignup(!signup); setError(''); }}>{signup ? 'Already have an account? Sign in' : 'Create a lab account'}</button>
      <p>The portfolio owner manages portfolio records. Other accounts can sign in and manage their own account through the API. Use fictional details for demonstrations.</p>
    </form> : <>
      <div className="workspace-toolbar"><p>Signed in as <strong>{user.name}</strong></p><button onClick={signout}>Sign out</button></div>
      {!user.canManage ? <p>Your account is active. Portfolio editing is reserved for the portfolio owner.</p> : <>
      <div className="workspace-tabs" aria-label="Choose records">{Object.keys(fields).map(name => <button key={name} aria-pressed={resource === name} onClick={() => { setResource(name); setEditing(null); setError(''); setNotice(''); }}>{name}</button>)}</div>
      <p>{records.length} {resource} · User accounts can only be edited or deleted by their owner.</p>
      <button onClick={() => setEditing({})}>Add {resource === 'qualifications' ? 'qualification' : resource.slice(0, -1)}</button>
      {editing && <form key={resource + (editing._id || 'new')} className="workspace-form" onSubmit={save}>
        <h2>{editing._id ? 'Edit record' : 'New record'}</h2>
        {fields[resource].map(field => <label key={field}>{field === 'firstname' ? 'First name' : field === 'lastname' ? 'Last name' : field.charAt(0).toUpperCase() + field.slice(1)}
          {field === 'description' || field === 'message' ? <textarea name={field} rows="3" defaultValue={editing[field] || ''} required={field === 'description'} /> :
          <input name={field} type={field === 'completion' ? 'date' : field === 'password' ? 'password' : field === 'email' ? 'email' : 'text'}
            defaultValue={field === 'completion' ? editing[field]?.slice(0, 10) : editing[field] || ''}
            required={!['phone', 'message'].includes(field) && !(field === 'password' && editing._id)} minLength={field === 'password' ? 8 : undefined} maxLength={field === 'password' ? 72 : undefined} />}
        </label>)}
        <div className="actions"><button className="button" disabled={busy}>{busy ? 'Saving…' : 'Save record'}</button><button type="button" onClick={() => setEditing(null)}>Cancel</button></div>
      </form>}
      <div className="workspace-records">{records.map(record => <article key={record._id}>
        <h2>{record.title || record.name || `${record.firstname} ${record.lastname}`}</h2>
        <dl>{Object.entries(record).filter(([key]) => !['__v'].includes(key)).map(([key, value]) => <React.Fragment key={key}><dt>{key}</dt><dd>{String(value)}</dd></React.Fragment>)}</dl>
        {(resource !== 'users' || record._id === user._id) && <div className="actions"><button onClick={() => setEditing(record)}>Edit</button><button onClick={() => remove(record)}>Delete</button></div>}
      </article>)}</div>
      </>}
    </>}
  </section>;
}
