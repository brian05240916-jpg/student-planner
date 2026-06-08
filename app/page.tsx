"use client";
import { useState, useEffect } from 'react';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoginView, setIsLoginView] = useState(true);
  const [user, setUser] = useState({ username: '', password: '' });
  
  const [tasks, setTasks] = useState<{ text: string; date: string }[]>([]);
  const [taskInput, setTaskInput] = useState('');
  const [dateInput, setDateInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);

  // --- 新的密碼驗證邏輯 ---
  // 8碼以上 + 大寫英文 + 小寫英文 + 數字
  const validate = (pwd: string) => {
    const hasUpper = /[A-Z]/.test(pwd);
    const hasLower = /[a-z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    const isLengthValid = pwd.length >= 8;
    return hasUpper && hasLower && hasNumber && isLengthValid;
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const handleAuth = () => {
    if (validate(user.password)) {
      setIsLoggedIn(true);
    } else {
      alert('密碼規則錯誤：需8碼以上，並同時包含大寫英文、小寫英文與數字！');
    }
  };

  if (!isLoggedIn) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
          <h1 className="text-2xl font-bold text-center mb-6">{isLoginView ? '系統登入' : '帳號註冊'}</h1>
          <input className="w-full border p-3 rounded-lg mb-3" placeholder="帳號" onChange={(e) => setUser({...user, username: e.target.value})} />
          <input type="password" className="w-full border p-3 rounded-lg mb-4" placeholder="密碼 (需含大小寫英數)" onChange={(e) => setUser({...user, password: e.target.value})} />
          <button onClick={handleAuth} className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold">{isLoginView ? '進入系統' : '註冊帳號'}</button>
          <button onClick={() => setIsLoginView(!isLoginView)} className="w-full mt-4 text-sm text-blue-500 underline">{isLoginView ? '沒有帳號？去註冊' : '已有帳號？去登入'}</button>
          <div className="mt-8 pt-6 border-t text-center text-sm text-gray-400">
            <p>解鎖完整版：100元</p>
            <p>匯款帳號：012-3456-7890</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">歡迎回來，{user.username}</h1>
      <div className="bg-red-50 p-6 rounded-xl border border-red-200 text-center mb-6">
        <div className="text-5xl font-mono mb-4">{Math.floor(timeLeft/60)}:{String(timeLeft%60).padStart(2,'0')}</div>
        <button onClick={() => setIsActive(!isActive)} className="bg-red-500 text-white px-6 py-2 rounded-lg">{isActive ? '暫停' : '開始工作'}</button>
      </div>
      <div className="flex gap-2 mb-6">
        <input className="flex-1 border p-2 rounded" value={taskInput} onChange={(e) => setTaskInput(e.target.value)} placeholder="任務名稱" />
        <input type="date" className="border p-2 rounded" value={dateInput} onChange={(e) => setDateInput(e.target.value)} />
        <button onClick={() => setTasks([...tasks, { text: taskInput, date: dateInput }])} className="bg-blue-600 text-white px-4 py-2 rounded">新增</button>
      </div>
      <ul className="space-y-2">
        {tasks.map((t, i) => <li key={i} className="border p-3 rounded flex justify-between"><span>{t.text}</span><span>{t.date}</span></li>)}
      </ul>
    </main>
  );
}