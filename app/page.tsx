"use client";
import { useState, useEffect } from 'react';

export default function Home() {
  // --- 狀態管理 ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const [tasks, setTasks] = useState<{ text: string; date: string }[]>([]);
  const [taskInput, setTaskInput] = useState('');
  const [dateInput, setDateInput] = useState('');

  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);

  // --- 登入邏輯 ---
  const handleLogin = () => {
    // 規則：長度 >= 8，首字大寫，包含中英文 (Regex 簡單檢查)
    const isValid = password.length >= 8 && /^[A-Z]/.test(password);
    if (isValid) {
      setIsAuthenticated(true);
    } else {
      setError('密碼需 8 碼以上且首字大寫，並包含中英文');
    }
  };

  // --- 番茄鐘計時器 ---
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      alert('時間到！休息一下吧！');
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  // --- 功能函式 ---
  const addTask = () => {
    if (taskInput && dateInput) {
      setTasks([...tasks, { text: taskInput, date: dateInput }]);
      setTaskInput('');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // --- 渲染畫面 ---
  if (!isAuthenticated) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="p-8 bg-white shadow-md rounded-lg text-center">
          <h1 className="text-2xl font-bold mb-4">學生規劃器 - 登入</h1>
          <input 
            type="password" 
            className="border p-2 rounded mb-2 w-full text-black"
            placeholder="請輸入密碼"
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={handleLogin} className="bg-blue-600 text-white px-6 py-2 rounded w-full">
            進入系統
          </button>
          {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
          <p className="mt-4 text-xs text-gray-400">解鎖完整版費用：100元</p>
        </div>
      </main>
    );
  }

  return (
    <main className="p-6 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">學生規劃器</h1>

      {/* 番茄鐘 */}
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg mb-6 text-center">
        <h2 className="text-4xl font-mono">{formatTime(timeLeft)}</h2>
        <button onClick={() => setIsActive(!isActive)} className="bg-red-500 text-white px-6 py-2 mt-4 rounded">
          {isActive ? '暫停' : '開始工作'}
        </button>
      </div>

      {/* 任務輸入 */}
      <div className="flex flex-col gap-2 mb-6">
        <input className="border p-2 rounded" placeholder="任務名稱" value={taskInput} onChange={(e) => setTaskInput(e.target.value)} />
        <input type="date" className="border p-2 rounded" value={dateInput} onChange={(e) => setDateInput(e.target.value)} />
        <button onClick={addTask} className="bg-blue-600 text-white p-2 rounded">新增任務</button>
      </div>

      {/* 列表 */}
      <ul className="space-y-2">
        {tasks.map((t, i) => (
          <li key={i} className="border p-3 rounded flex justify-between shadow-sm">
            <span>{t.text}</span>
            <span className="text-gray-400">{t.date}</span>
          </li>
        ))}
      </ul>
    </main>
  );
}