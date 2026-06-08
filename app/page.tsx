"use client";
import { useState, useEffect } from 'react';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoginView, setIsLoginView] = useState(true);
  const [user, setUser] = useState({ username: '', password: '' });
  const [isPaid, setIsPaid] = useState(false);

  // 模擬所有使用者資料庫 (正式版請使用 Firebase)
  const [allUsers, setAllUsers] = useState([
    { id: 1, username: 'brian', isPaid: true },
    { id: 2, username: 'student_tester', isPaid: false }
  ]);

  const [tasks, setTasks] = useState<{ id: number; text: string; date: string; completed: boolean }[]>([]);
  const [taskInput, setTaskInput] = useState('');
  const [dateInput, setDateInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);

  const validate = (pwd: string) => pwd.length >= 8 && /[A-Z]/.test(pwd) && /[a-z]/.test(pwd) && /[0-9]/.test(pwd);

  const handleAuth = () => {
    if (validate(user.password)) {
      setIsLoggedIn(true);
      if (user.username === 'admin') setIsPaid(true);
    } else {
      alert('密碼規則：8碼以上，包含大小寫英文與數字');
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && timeLeft > 0) interval = setInterval(() => setTimeLeft(p => p - 1), 1000);
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  // --- 1. 登入頁面 ---
  if (!isLoggedIn) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-sm">
          <h1 className="text-3xl font-extrabold text-center mb-6">學生規劃器</h1>
          <input className="w-full border-2 p-4 rounded-xl mb-4" placeholder="帳號" onChange={e => setUser({...user, username: e.target.value})} />
          <input type="password" className="w-full border-2 p-4 rounded-xl mb-6" placeholder="密碼 (大小寫+數字)" onChange={e => setUser({...user, password: e.target.value})} />
          <button onClick={handleAuth} className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold">{isLoginView ? '登入' : '註冊'}</button>
        </div>
      </main>
    );
  }

  // --- 2. 付費牆 ---
  if (!isPaid) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md text-center">
          <h2 className="text-2xl font-bold mb-4">解鎖完整功能</h2>
          <p className="mb-6">支付 100 元即可升級正式會員。</p>
          <button onClick={() => setIsPaid(true)} className="w-full bg-green-600 text-white py-3 rounded-xl font-bold">我已付款</button>
        </div>
      </main>
    );
  }

  // --- 3. 會員主頁面 ---
  return (
    <main className="p-8 max-w-2xl mx-auto min-h-screen bg-gray-50">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">你好, {user.username}</h1>
        <button onClick={() => setIsLoggedIn(false)} className="text-red-500">登出</button>
      </div>

      {/* 管理員專區 (只有 admin 能看見) */}
      {user.username === 'admin' && (
        <div className="bg-red-50 p-6 rounded-2xl mb-8 border border-red-200">
          <h2 className="text-xl font-bold mb-4 text-red-700">管理員控制台</h2>
          {allUsers.map(u => (
            <div key={u.id} className="flex justify-between bg-white p-2 mb-2 rounded">
              {u.username} <button onClick={() => setAllUsers(allUsers.filter(x => x.id !== u.id))} className="text-red-500">刪除</button>
            </div>
          ))}
        </div>
      )}

      {/* 番茄鐘與任務區 */}
      <div className="bg-white p-6 rounded-3xl shadow-lg mb-8 text-center">
        <div className="text-5xl font-mono font-bold mb-4">{Math.floor(timeLeft/60)}:{String(timeLeft%60).padStart(2,'0')}</div>
        <button onClick={() => setIsActive(!isActive)} className="bg-red-500 text-white px-8 py-2 rounded-xl">{isActive ? '暫停' : '開始'}</button>
      </div>

      <div className="flex gap-2 mb-8">
        <input className="flex-1 border-2 p-3 rounded-xl" value={taskInput} onChange={e => setTaskInput(e.target.value)} placeholder="任務" />
        <button onClick={() => setTasks([...tasks, { id: Date.now(), text: taskInput, date: dateInput, completed: false }])} className="bg-blue-600 text-white px-6 rounded-xl font-bold">新增</button