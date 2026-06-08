"use client";
import { useState, useEffect } from 'react';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoginView, setIsLoginView] = useState(true);
  const [user, setUser] = useState({ username: '', password: '' });
  const [isPaid, setIsPaid] = useState(false); // 新增：付費狀態

  const [tasks, setTasks] = useState<{ id: number; text: string; date: string; completed: boolean }[]>([]);
  const [taskInput, setTaskInput] = useState('');
  const [dateInput, setDateInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);

  // 密碼規則檢查
  const validate = (pwd: string) => pwd.length >= 8 && /[A-Z]/.test(pwd) && /[a-z]/.test(pwd) && /[0-9]/.test(pwd);

  const handleAuth = () => {
    if (validate(user.password)) {
      setIsLoggedIn(true);
      // 超級管理員自動解鎖
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
        <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-sm border border-gray-100">
          <h1 className="text-3xl font-extrabold text-center text-gray-800 mb-2">學生規劃器</h1>
          <input className="w-full border-2 border-gray-200 p-4 rounded-xl mb-4" placeholder="帳號" onChange={e => setUser({...user, username: e.target.value})} />
          <input type="password" className="w-full border-2 border-gray-200 p-4 rounded-xl mb-6" placeholder="密碼 (大小寫+數字)" onChange={e => setUser({...user, password: e.target.value})} />
          <button onClick={handleAuth} className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold">{isLoginView ? '登入系統' : '註冊帳號'}</button>
          <button onClick={() => setIsLoginView(!isLoginView)} className="w-full mt-6 text-blue-500 underline text-sm">{isLoginView ? '沒有帳號？去註冊' : '已有帳號？返回登入'}</button>
        </div>
      </main>
    );
  }

  // --- 2. 付費牆 (收費系統) ---
  if (!isPaid) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md text-center">
          <h2 className="text-2xl font-bold mb-4">解鎖完整功能</h2>
          <p className="text-gray-600 mb-6">您目前為訪客，請支付 <span className="font-bold text-blue-600">100 元</span> 以升級為正式會員。</p>
          <div className="bg-gray-100 p-4 rounded-xl mb-6 text-sm">
            <p>匯款銀行：012</p>
            <p className="font-mono font-bold text-lg">帳號：1234-5678-9012</p>
          </div>
          <button onClick={() => { alert("已送出申請，請靜候管理員確認！"); setIsPaid(true); }} className="w-full bg-green-600 text-white py-3 rounded-xl font-bold">我已付款，申請開通</button>
          <button onClick={() => setIsLoggedIn(false)} className="mt-4 text-gray-400">登出</button>
        </div>
      </main>
    );
  }

  // --- 3. 會員主頁面 ---
  return (
    <main className="p-8 max-w-2xl mx-auto min-h-screen bg-gray-50">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">你好, {user.username} {user.username === 'admin' && <span className="text-xs bg-red-500 text-white px-2 py-1 rounded">管理員</span>}</h1>
        <button onClick={() => setIsLoggedIn(false)} className="text-gray-400">登出</button>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-lg border mb-8 text-center">
        <div className="text-6xl font-mono font-bold mb-6">{Math.floor(timeLeft/60)}:{String(timeLeft%60).padStart(2,'0')}</div>
        <button onClick={() => setIsActive(!isActive)} className={`px-8 py-3 rounded-xl font-bold ${isActive ? 'bg-gray-200' : 'bg-red-500 text-white'}`}>
          {isActive ? '暫停計時' : '開始工作'}
        </button>
      </div>

      <div className="flex gap-2 mb-8">
        <input className="flex-1 border-2 p-3 rounded-xl" value={taskInput} onChange={e => setTaskInput(e.target.value)} placeholder="任務名稱" />
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