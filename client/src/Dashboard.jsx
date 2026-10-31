import React, { useEffect, useState } from 'react';
import { api, setToken, hasToken } from './api.js';
const fields = {
  projects: ['title', 'firstname', 'lastname', 'email', 'completion', 'description'],
  qualifications: ['title', 'firstname', 'lastname', 'email', 'completion', 'description'],
  contacts: ['firstname', 'lastname', 'email', 'phone', 'message'],
  users: ['name', 'email', 'password'],
};
const label = field => ({ firstname: 'First name', lastname: 'Last name', qualifications: 'Education', projects: 'Projects', contacts: 'Contact messages', users: 'Users' }[field] || field.charAt(0).toUpperCase() + field.slice(1));
export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [signup, setSignup] = useState(false);
  const [credentials, setCredentials] = useState({ name: '', email: '', password: '' });
  const [resource, setResource] = useState('projects');
  const [records, setRecords] = useState([]);
  const [editing, setEditing] = useState(null);
  const [values, setValues] = useState({});
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    if (hasToken()) api('/auth/me').then(setUser).catch(() => { setToken(''); setUser(null); });
  }, []);
  useEffect(() => {
    if (!user) return;
    let active = true;
    setLoading(true); setRecords([]);
    api('/' + resource).then(data => { if (active) setRecords(data); })
      .catch(e => { if (active) setError(e.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [resource, user, revision]);
  async function authenticate(event) {
    event.preventDefault(); setBusy(true); setError(''); setNotice('');
    try {
      if (signup) await api('/users', { method: 'POST', body: credentials });
      const session = await api('/auth/signin', { method: 'POST', body: { email: credentials.email, password: credentials.password } });
      setToken(session.token); setUser(session.user); setCredentials({ name: '', email: '', password: '' }); setResource('projects');
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  async function signout() {
    setBusy(true); setError('');
    try {
      await api('/auth/signout'); setToken(''); setUser(null); setRecords([]); setEditing(null); setNotice('Signed out successfully.');
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  function edit(record = {}) {
    setEditing(record); setError(''); setNotice('');
    setValues(Object.fromEntries(fields[resource].map(field => [field, field === 'password' ? '' : field === 'completion' ? (record[field] || '').slice(0, 10) : record[field] || ''])));
  }
  async function save(event) {
    event.preventDefault(); setBusy(true); setError(''); setNotice('');
    const body = { ...values };
    if (!body.password) delete body.password;
    try {
      await api('/' + resource + (editing?._id ? '/' + editing._id : ''), { method: editing?._id ? 'PUT' : 'POST', body });
      setEditing(null); setNotice('Record saved to the database.'); setRevision(value => value + 1);
      if (resource === 'users' && editing?._id === user._id) setUser(await api('/auth/me'));
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  async function remove(record) {
    if (!window.confirm('Delete this record?')) return;
    setBusy(true); setError('');
    try {
      await api('/' + resource + '/' + record._id, { method: 'DELETE' });
      setEditing(null); setRevision(value => value + 1); setNotice('Record deleted.');
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  const resources = user?.canManage ? Object.keys(fields) : ['projects', 'qualifications'];
  return <section className="dashboard">
    <p className="eyebrow">Portfolio workspace</p>
    <h1>{user ? user.canManage ? 'Manage your portfolio.' : 'Explore the portfolio.' : signup ? 'Create your account.' : 'Sign in to your workspace.'}</h1>
    {error && <p role="alert" className="api-error">{error}</p>}
    {notice && <p role="status">{notice}</p>}
    {!user ? <form className="workspace-form" onSubmit={authenticate}>
      {signup && <label>Name<input name="name" required maxLength="100" autoComplete="name" value={credentials.name} onChange={e => setCredentials({ ...credentials, name: e.target.value })} /></label>}
      <label>Email<input name="email" type="email" required autoComplete="username" value={credentials.email} onChange={e => setCredentials({ ...credentials, email: e.target.value })} /></label>
      <label>Password<input name="password" type="password" minLength="8" maxLength="72" required autoComplete={signup ? 'new-password' : 'current-password'} value={credentials.password} onChange={e => setCredentials({ ...credentials, password: e.target.value })} /></label>
      <button className="button" disabled={busy}>{busy ? 'Please wait…' : signup ? 'Create account & sign in' : 'Sign in'}</button>
      <button type="button" className="text-link" disabled={busy} onClick={() => { setSignup(!signup); setError(''); setCredentials({ name: '', email: '', password: '' }); }}>{signup ? 'Already have an account? Sign in' : 'Create an account'}</button>
      <p>New accounts have the User role and can view projects and education. An administrator manages portfolio records.</p>
    </form> : <>
      <div className="workspace-toolbar"><p>Signed in as <strong>{user.name}</strong> · {user.canManage ? 'Admin' : 'User'}</p><button disabled={busy} onClick={signout}>Sign out</button></div>
      {!user.canManage && <p>You have read-only access to projects and education.</p>}
      <div className="workspace-tabs" aria-label="Choose records">{resources.map(name => <button key={name} disabled={busy} aria-pressed={resource === name} onClick={() => { setResource(name); setEditing(null); setError(''); setNotice(''); }}>{label(name)}</button>)}</div>
      <p aria-live="polite">{loading ? 'Loading records…' : `${records.length} records`}</p>
      {user.canManage && <button disabled={busy} onClick={() => edit()}>Add {resource === 'qualifications' ? 'education' : resource === 'contacts' ? 'contact' : resource.slice(0, -1)}</button>}
      {user.canManage && editing && <form className="workspace-form" onSubmit={save}>
        <h2>{editing._id ? 'Edit record' : 'New record'}</h2>
        {fields[resource].map(field => {
          const props = { name: field, value: values[field] || '', onChange: e => setValues(current => ({ ...current, [field]: e.target.value })), disabled: busy, required: !['phone', 'message'].includes(field) && !(field === 'password' && editing._id) };
          return <label key={field}>{label(field)}{field === 'description' || field === 'message' ? <textarea {...props} rows="3" /> : <input {...props} type={field === 'completion' ? 'date' : field === 'password' ? 'password' : field === 'email' ? 'email' : 'text'} minLength={field === 'password' ? 8 : undefined} maxLength={field === 'password' ? 72 : undefined} />}</label>;
        })}
        <div className="actions"><button className="button" disabled={busy}>{busy ? 'Saving…' : 'Save record'}</button><button type="button" disabled={busy} onClick={() => setEditing(null)}>Cancel</button></div>
      </form>}
      {!loading && !records.length && <p>No records yet.</p>}
      <div className="workspace-records">{records.map(record => <article key={record._id}>
        <h2>{record.title || record.name || `${record.firstname} ${record.lastname}`}</h2>
        <dl>{Object.entries(record).filter(([key]) => !['_id', '__v'].includes(key)).map(([key, value]) => <React.Fragment key={key}><dt>{label(key)}</dt><dd>{String(value)}</dd></React.Fragment>)}</dl>
        {user.canManage && <div className="actions"><button disabled={busy} onClick={() => edit(record)}>Edit</button><button disabled={busy || (resource === 'users' && record._id === user._id)} onClick={() => remove(record)}>Delete</button></div>}
      </article>)}</div>
    </>}
  </section>;
}
