"use client";
import { useState, useEffect } from 'react';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState({ username: '', password: '' });
  
  // 任務狀態：包含 id, text, date, completed
  const [tasks, setTasks] = useState<{ id: number; text: string; date: string; completed: boolean }[]>([]);
  const [taskInput, setTaskInput] = useState('');
  const [dateInput, setDateInput] = useState('');

  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);

  // 任務操作函式
  const addTask = () => {
    if (taskInput && dateInput) {
      setTasks([...tasks, { id: Date.now(), text: taskInput, date: dateInput, completed: false }]);
      setTaskInput('');
    }
  };

  const toggleTask = (id: number) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: number) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  // 番茄鐘邏輯
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  // 登入介面
  if (!isLoggedIn) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-96">
          <h1 className="text-2xl font-bold text-center mb-6">學生規劃器 - 登入</h1>
          <input className="w-full border p-3 rounded mb-3" placeholder="帳號" onChange={(e) => setUser({...user, username: e.target.value})} />
          <input type="password" className="w-full border p-3 rounded mb-4" placeholder="密碼 (大小寫英文+數字)" onChange={(e) => setUser({...user, password: e.target.value})} />
          <button onClick={() => setIsLoggedIn(true)} className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold">進入系統</button>
        </div>
      </main>
    );
  }

  // 主頁面 (會員限定)
  return (
    <main className="p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">歡迎回來，{user.username}</h1>
      
      {/* 番茄鐘 */}
      <div className="bg-red-50 p-6 rounded-xl border border-red-200 text-center mb-6">
        <div className="text-5xl font-mono mb-4">{Math.floor(timeLeft/60)}:{String(timeLeft%60).padStart(2,'0')}</div>
        <button onClick={() => setIsActive(!isActive)} className="bg-red-500 text-white px-6 py-2 rounded-lg">{isActive ? '暫停' : '開始工作'}</button>
      </div>

      {/* 新增任務 */}
      <div className="flex gap-2 mb-6">
        <input className="flex-1 border p-2 rounded" value={taskInput} onChange={(e) => setTaskInput(e.target.value)} placeholder="任務名稱" />
        <input type="date" className="border p-2 rounded" value={dateInput} onChange={(e) => setDateInput(e.target.value)} />
        <button onClick={addTask} className="bg-blue-600 text-white px-4 py-2 rounded">新增</button>
      </div>

      {/* 任務列表 */}
      <ul className="space-y-2">
        {tasks.map(t => (
          <li key={t.id} className={`border p-3 rounded flex justify-between items-center ${t.completed ? 'bg-green-50 opacity-70' : ''}`}>
            <span className={t.completed ? 'line-through' : ''}>{t.text} ({t.date})</span>
            <div className="flex gap-2">
              <button onClick={() => toggleTask(t.id)} className="text-sm bg-green-500 text-white px-2 py-1 rounded">完成</button>
              <button onClick={() => deleteTask(t.id)} className="text-sm bg-red-500 text-white px-2 py-1 rounded">刪除</button>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}