"use client";
import { useState, useEffect } from 'react';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoginView, setIsLoginView] = useState(true);
  const [user, setUser] = useState({ username: '', password: '' });
  
  const [tasks, setTasks] = useState<{ id: number; text: string; date: string; completed: boolean }[]>([]);
  const [taskInput, setTaskInput] = useState('');
  const [dateInput, setDateInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);

  // 密碼規則檢查
  const validate = (pwd: string) => {
    return pwd.length >= 8 && /[A-Z]/.test(pwd) && /[a-z]/.test(pwd) && /[0-9]/.test(pwd);
  };

  const handleAuth = () => {
    if (validate(user.password)) {
      setIsLoggedIn(true);
    } else {
      alert('密碼規則：8碼以上，包含大小寫英文與數字');
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && timeLeft > 0) interval = setInterval(() => setTimeLeft(p => p - 1), 1000);
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  // --- 登入頁面 ---
  if (!isLoggedIn) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-sm border border-gray-100">
          <h1 className="text-3xl font-extrabold text-center text-gray-800 mb-2">學生規劃器</h1>
          <p className="text-center text-gray-500 mb-8">{isLoginView ? '歡迎回來' : '建立帳號'}</p>
          <input className="w-full border-2 border-gray-200 p-4 rounded-xl mb-4 focus:border-blue-500 outline-none" placeholder="帳號" onChange={e => setUser({...user, username: e.target.value})} />
          <input type="password" className="w-full border-2 border-gray-200 p-4 rounded-xl mb-6 focus:border-blue-500 outline-none" placeholder="密碼 (大小寫+數字)" onChange={e => setUser({...user, password: e.target.value})} />
          <button onClick={handleAuth} className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition">{isLoginView ? '登入系統' : '註冊帳號'}</button>
          <button onClick={() => setIsLoginView(!isLoginView)} className="w-full mt-6 text-blue-500 font-medium hover:underline">
            {isLoginView ? '沒有帳號？點此註冊' : '已有帳號？返回登入'}
          </button>
        </div>
      </main>
    );
  }

  // --- 會員主頁面 ---
  return (
    <main className="p-8 max-w-2xl mx-auto min-h-screen bg-gray-50">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">你好, {user.username}</h1>
        <button onClick={() => setIsLoggedIn(false)} className="text-gray-400 hover:text-red-500">登出</button>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-lg border mb-8 text-center">
        <div className="text-6xl font-mono font-bold mb-6 text-gray-800">{Math.floor(timeLeft/60)}:{String(timeLeft%60).padStart(2,'0')}</div>
        <button onClick={() => setIsActive(!isActive)} className={`px-8 py-3 rounded-xl font-bold ${isActive ? 'bg-gray-200' : 'bg-red-500 text-white'}`}>
          {isActive ? '暫停計時' : '開始工作'}
        </button>
      </div>

      <div className="flex gap-2 mb-8">
        <input className="flex-1 border-2 p-3 rounded-xl outline-none focus:border-blue-400" value={taskInput} onChange={e => setTaskInput(e.target.value)} placeholder="任務名稱" />
        <input type="date" className="border-2 p-3 rounded-xl" value={dateInput} onChange={e => setDateInput(e.target.value)} />
        <button onClick={() => setTasks([...tasks, { id: Date.now(), text: taskInput, date: dateInput, completed: false }])} className="bg-blue-600 text-white px-6 rounded-xl font-bold">新增</button>
      </div>

      <ul className="space-y-3">
        {tasks.map(t => (
          <li key={t.id} className="bg-white p-4 rounded-xl shadow border flex justify-between items-center">
            <span className={t.completed ? 'line-through text-gray-400' : 'font-medium'}>{t.text} ({t.date})</span>
            <div className="flex gap-2">
              <button onClick={() => setTasks(tasks.map(x => x.id === t.id ? {...x, completed: !x.completed} : x))} className="bg-green-100 text-green-600 px-3 py-1 rounded-lg">完成</button>
              <button onClick={() => setTasks(tasks.filter(x => x.id !== t.id))} className="bg-red-100 text-red-600 px-3 py-1 rounded-lg">刪除</button>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}