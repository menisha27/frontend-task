import { useState } from 'react';
import axios from 'axios';

const API = 'https://backend-intern-task.onrender.com/api/v1';

export default function App() {
  const [token, setToken] = useState('');
  const [userName, setUserName] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [tasks, setTasks] = useState([]);
  const [taskForm, setTaskForm] = useState({ title: '', description: '' });
  const [msg, setMsg] = useState({ text: '', type: '' });
  const [isLogin, setIsLogin] = useState(true);

  const showMsg = (text, type = 'success') => setMsg({ text, type });

  const register = async () => {
    try {
      await axios.post(`${API}/auth/register`, form);
      showMsg('Registration successful! Now login.');
      setIsLogin(true);
    } catch (e) { showMsg(e.response?.data?.error || 'Error!', 'error'); }
  };

  const login = async () => {
    try {
      const { data } = await axios.post(`${API}/auth/login`, form);
      setToken(data.token);
      setUserName(data.name);
      showMsg(`Welcome ${data.name}! 🎉`);
      fetchTasks(data.token);
    } catch (e) { showMsg(e.response?.data?.error || 'Login failed!', 'error'); }
  };

  const fetchTasks = async (t = token) => {
    const { data } = await axios.get(`${API}/tasks`, {
      headers: { Authorization: `Bearer ${t}` }
    });
    setTasks(data);
  };

  const createTask = async () => {
    if (!taskForm.title) return showMsg('Please enter a title!', 'error');
    await axios.post(`${API}/tasks`, taskForm, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setTaskForm({ title: '', description: '' });
    fetchTasks();
    showMsg('Task created! ✅');
  };

  const toggleStatus = async (task) => {
    await axios.put(`${API}/tasks/${task._id}`,
      { status: task.status === 'pending' ? 'done' : 'pending' },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchTasks();
  };

  const s = {
    wrap: { maxWidth: 580, margin: '40px auto', fontFamily: 'Arial', padding: 24 },
    input: { display: 'block', width: '100%', padding: 10, margin: '8px 0', borderRadius: 6, border: '1px solid #ccc', fontSize: 15, boxSizing: 'border-box' },
    btn: { padding: '10px 18px', margin: '5px 5px 5px 0', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 'bold' },
    card: { border: '1px solid #ddd', padding: 14, margin: '10px 0', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }
  };

  return (
    <div style={s.wrap}>
      <h2>📋 Task Manager</h2>

      {msg.text && (
        <div style={{ padding: 10, marginBottom: 12, borderRadius: 6, background: msg.type === 'error' ? '#ffe0e0' : '#e0ffe0', color: msg.type === 'error' ? '#c00' : '#060' }}>
          {msg.text}
        </div>
      )}

      {!token ? (
        <div>
          <button style={{ ...s.btn, background: isLogin ? '#007bff' : '#eee', color: isLogin ? '#fff' : '#333' }} onClick={() => setIsLogin(true)}>Login</button>
          <button style={{ ...s.btn, background: !isLogin ? '#007bff' : '#eee', color: !isLogin ? '#fff' : '#333' }} onClick={() => setIsLogin(false)}>Register</button>

          {!isLogin && <input style={s.input} placeholder="Your Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />}
          <input style={s.input} placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          <input style={s.input} type="password" placeholder="Password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
          <button style={{ ...s.btn, background: '#28a745', color: '#fff' }} onClick={isLogin ? login : register}>
            {isLogin ? '🔐 Login' : '📝 Register'}
          </button>
        </div>
      ) : (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <h3>Welcome, {userName}! 👋</h3>
            <button style={{ ...s.btn, background: '#dc3545', color: '#fff' }} onClick={() => { setToken(''); setTasks([]); }}>Logout</button>
          </div>

          <div style={{ background: '#f8f9fa', padding: 16, borderRadius: 8, marginBottom: 20 }}>
            <h4 style={{ margin: '0 0 10px' }}>➕ Create New Task</h4>
            <input style={s.input} placeholder="Task title" value={taskForm.title} onChange={e => setTaskForm({ ...taskForm, title: e.target.value })} />
            <input style={s.input} placeholder="Description (optional)" value={taskForm.description} onChange={e => setTaskForm({ ...taskForm, description: e.target.value })} />
            <button style={{ ...s.btn, background: '#007bff', color: '#fff' }} onClick={createTask}>✅ Create Task</button>
          </div>

          <h4>📌 Your Tasks ({tasks.length})</h4>
          {tasks.length === 0 && <p style={{ color: '#999' }}>No tasks yet. Create one above!</p>}
          {tasks.map(task => (
            <div key={task._id} style={{ ...s.card, background: task.status === 'done' ? '#f0fff0' : '#fff' }}>
              <div>
                <b style={{ textDecoration: task.status === 'done' ? 'line-through' : 'none' }}>{task.title}</b>
                {task.description && <p style={{ margin: '3px 0', color: '#777', fontSize: 13 }}>{task.description}</p>}
                <span style={{ fontSize: 12, color: task.status === 'done' ? 'green' : 'orange' }}>
                  {task.status === 'done' ? '✅ Done' : '⏳ Pending'}
                </span>
              </div>
              <button style={{ ...s.btn, background: task.status === 'done' ? '#ffc107' : '#28a745', color: '#fff' }} onClick={() => toggleStatus(task)}>
                {task.status === 'done' ? 'Undo' : 'Done ✓'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}