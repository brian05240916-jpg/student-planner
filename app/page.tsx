'use client';

import { useState, useEffect } from 'react';

interface Task {
  id: number;
  title: string;
  dueDate: string;
  completed: boolean;
}

interface User {
  username: string;
  password: string;
  isPaid: boolean;
}

export default function HomePage() {
  // 🚪 登入與註冊相關狀態
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [currentUser, setCurrentUser] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');

  // 👥 使用者名冊狀態（初始為空，由 LocalStorage 注入）
  const [users, setUsers] = useState<User[]>([]);

  // 📝 任務清單與付費狀態
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isPaid, setIsPaid] = useState(false);

  // 🍅 番茄鐘相關狀態
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [soundType, setSoundType] = useState('Off');

  // ==========================================
  // 💾 核心：LocalStorage 本地資料庫同步機制
  // ==========================================

  // 1. 當網頁【剛打開時】：從瀏覽器資料庫撈資料
  useEffect(() => {
    const localUsers = localStorage.getItem('planner_users');
    if (localUsers) {
      setUsers(JSON.parse(localUsers));
    } else {
      // 預設系統管理員密碼不受新強度的 8 碼限制，方便快速測試
      const defaultUsers = [{ username: 'teacher', password: '1234', isPaid: true }];
      setUsers(defaultUsers);
      localStorage.setItem('planner_users', JSON.stringify(defaultUsers));
    }

    const localTasks = localStorage.getItem('planner_tasks');
    if (localTasks) {
      setTasks(JSON.parse(localTasks));
    } else {
      const defaultTasks = [
        { id: 1, title: '🎒 準備微積分期中考考古題', dueDate: '2026-06-15', completed: false },
        { id: 2, title: '📝 撰寫通識課期末報告摘要', dueDate: '2026-06-20', completed: false }
      ];
      setTasks(defaultTasks);
      localStorage.setItem('planner_tasks', JSON.stringify(defaultTasks));
    }
  }, []);

  // 2. 同步寫入使用者名冊
  useEffect(() => {
    if (users.length > 0) {
      localStorage.setItem('planner_users', JSON.stringify(users));
    }
  }, [users]);

  // 3. 同步寫入任務清單
  useEffect(() => {
    if (tasks.length > 0) {
      localStorage.setItem('planner_tasks', JSON.stringify(tasks));
    }
  }, [tasks]);

  // 番茄鐘倒數邏輯
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      alert('⏰ 25分鐘專注結束！');
      setTimeLeft(25 * 60);
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 📝 處理新用戶註冊（包含安全強度檢查機制）
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    const trimmedUsername = username.trim();
    if (!trimmedUsername || !password) return;

    // 1. 審查管理員保留字（防大小寫或空格繞過）
    if (trimmedUsername.toLowerCase() === 'teacher') {
      setAuthError('❌ 保留字：不允許註冊為管理員帳號！');
      return;
    }

    // 2. 🔐 密碼強度驗證：必須包含英文大寫、小寫、數字，且至少 8 碼
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    if (!passwordRegex.test(password)) {
      setAuthError('❌ 密碼強度不足！必須包含英文大、小寫與數字，且長度至少 8 碼。');
      return;
    }

    // 3. 檢查帳號是否重複（不分大小寫比對）
    const userExists = users.some(u => u.username.toLowerCase() === trimmedUsername.toLowerCase());
    if (userExists) {
      setAuthError('❌ 該帳號已被註冊！');
      return;
    }

    // 4. 驗證全數通過，寫入名冊
    const updatedUsers = [...users, { username: trimmedUsername, password, isPaid: false }];
    setUsers(updatedUsers);
    setAuthSuccess('🎉 註冊成功！密碼符合安全規範。請切換回登入頁面。');
    setPassword('');
  };

  // 🔑 處理登入驗證
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    const foundUser = users.find(u => u.username === username && u.password === password);

    if (foundUser) {
      setIsLoggedIn(true);
      setCurrentUser(foundUser.username);
      setIsPaid(foundUser.isPaid);
    } else {
      setAuthError('❌ 帳號或密碼錯誤！');
    }
  };

  // 用戶手動升級 Pro
  const handlePayPro = () => {
    alert('🎉 感謝訂閱！高質感專注番茄鐘功能已成功解鎖！');
    setIsPaid(true);
    const updatedUsers = users.map(u => u.username === currentUser ? { ...u, isPaid: true } : u);
    setUsers(updatedUsers);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername('');
    setPassword('');
    setIsPaid(false);
    setIsRunning(false);
    setTimeLeft(25 * 60);
  };

  // 🛠️ 超級管理員專用動作
  const adminDeleteUser = (usernameToDelete: string) => {
    if (usernameToDelete === 'teacher') {
      alert('❌ 無法刪除自己（超級管理員）！');
      return;
    }
    if (confirm(`⚠️ 確定要註銷用戶 [${usernameToDelete}] 嗎？`)) {
      setUsers(users.filter(u => u.username !== usernameToDelete));
    }
  };

  const adminTogglePaid = (targetUsername: string) => {
    setUsers(users.map(u => u.username === targetUsername ? { ...u, isPaid: !u.isPaid } : u));
  };

  const adminResetPassword = (targetUsername: string) => {
    // 重設密碼時，為了確保符合新規則，我們幫他重設為符合標準的 'Admin1234'
    setUsers(users.map(u => u.username === targetUsername ? { ...u, password: 'Admin1234' } : u));
    alert(`🔑 已將 [${targetUsername}] 的密碼強制重設為符合安全規範的: Admin1234`);
  };

  // --- 畫面渲染：未登入狀態 ---
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4 text-slate-800">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-8 space-y-6">
          <div className="text-center">
            <span className="text-4xl">🎓</span>
            <h1 className="text-2xl font-black text-slate-900 mt-2">Student Planner</h1>
            <p className="text-sm text-slate-400 mt-1">
              {authMode === 'login' ? '請先登入以管理您的課業進度' : '密碼須含大小寫英文及數字且至少 8 碼'}
            </p>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => { setAuthMode('login'); setAuthError(''); setAuthSuccess(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${authMode === 'login' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              登入帳號
            </button>
            <button
              onClick={() => { setAuthMode('register'); setAuthError(''); setAuthSuccess(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${authMode === 'register' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              新用戶註冊
            </button>
          </div>

          <form onSubmit={authMode === 'login' ? handleLogin : handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">帳號</label>
              <input type="text" required placeholder="請輸入帳號" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">密碼</label>
              <input type="password" required placeholder={authMode === 'login' ? "請輸入密碼" : "例：Abcd1234 (至少8碼)"} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
            </div>

            {authError && <p className="text-xs font-medium text-rose-500 bg-rose-50 p-2.5 rounded-lg border border-rose-100">{authError}</p>}
            {authSuccess && <p className="text-xs font-medium text-emerald-600 bg-emerald-50 p-2.5 rounded-lg border border-emerald-100">{authSuccess}</p>}

            <button type="submit" className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition-colors shadow-md">
              {authMode === 'login' ? '安全登入 ➔' : '立即註冊帳號 ➔'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ✅ 已登入狀態下的主頁面 Dashboard
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 animate-fade-in">
      
      {/* 🌟 頂部導覽列 */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 backdrop-blur-md bg-white/80">
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎒</span>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Student Planner</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-xs font-semibold bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full border border-slate-200">
              <span className={`w-2 h-2 rounded-full ${currentUser === 'teacher' ? 'bg-rose-500 animate-pulse' : isPaid ? 'bg-amber-500' : 'bg-slate-400'}`}></span>
              身份: <span className="text-indigo-600 font-bold">{currentUser}</span> {currentUser === 'teacher' ? '🛠️ (超級管理員)' : isPaid ? '👑 (Pro)' : '(免費版)'}
            </div>
            <button onClick={handleLogout} className="text-xs font-medium text-slate-400 hover:text-rose-500 transition-colors border border-slate-200 hover:border-rose-200 px-3 py-1.5 rounded-xl bg-white">
              登出 👋
            </button>
          </div>
        </div>
      </header>

      {/* 🏆 主內文區塊 */}
      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* 👈 左側欄 */}
          <div className="md:col-span-5 space-y-6">
            
            {/* 💎 Pro 專注番茄鐘卡片 */}
            <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-950 rounded-2xl shadow-xl p-6 text-white relative overflow-hidden border border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">💎</span>
                  <h3 className="font-bold tracking-wide text-indigo-300 uppercase text-xs">Pro Focus Timer</h3>
                </div>
              </div>

              {!isPaid && currentUser !== 'teacher' ? (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-xl font-extrabold text-white">解鎖高質感深度專注番茄鐘</h2>
                    <p className="text-slate-400 text-xs mt-1 leading-relaxed">加入 Pro 會員，在計畫表內直接開啟 25min 沉浸式番茄鐘。</p>
                  </div>
                  <button onClick={handlePayPro} className="w-full py-3 px-4 bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-sm rounded-xl transition-all shadow-md">
                    ⚡ 立即升級 Pro 會員 (NT$ 60)
                  </button>
                </div>
              ) : (
                <div className="text-center py-2 space-y-4">
                  <div className="text-5xl font-mono font-black tracking-widest text-indigo-200 bg-white/5 py-4 rounded-2xl border border-white/10">
                    {formatTime(timeLeft)}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setIsRunning(!isRunning)} className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg ${isRunning ? 'bg-amber-500 text-slate-950' : 'bg-emerald-500 text-white'}`}>
                      {isRunning ? '⏸ 暫停計時' : '▶ 開始專注'}
                    </button>
                    <button onClick={() => { setIsRunning(false); setTimeLeft(25 * 60); }} className="px-3 py-2 bg-white/10 text-white text-xs font-bold rounded-lg border border-white/10">🔄 重設</button>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    {currentUser === 'teacher' ? '💡 管理員專屬：已自動獲得番茄鐘最高調試權限。' : '✅ 尊榮 Pro 會員專注中'}
                  </p>
                </div>
              )}
            </div>

            {/* 📝 新增任務表單 */}
            {currentUser !== 'teacher' && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h2 className="text-md font-bold text-slate-900">建立新任務</h2>
                </div>
                <form onSubmit={(e) => { e.preventDefault(); if(title.trim()) { const updated = [...tasks, {id: Date.now(), title, dueDate, completed: false}]; setTasks(updated); setTitle(''); setDueDate(''); } }} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">任務名稱</label>
                    <input type="text" required placeholder="例如：複習經濟學單元五" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">截止日期</label>
                    <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none" />
                  </div>
                  <button type="submit" className="w-full py-2.5 px-4 bg-slate-900 text-white text-sm font-semibold rounded-xl">添加至清單</button>
                </form>
              </div>
            )}
          </div>

          {/* 👉 右側欄 */}
          <div className="md:col-span-7 bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 min-h-[450px]">
            
            {currentUser === 'teacher' ? (
              // 👑 狀況一：超級管理員面板
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">🛠️ 全站會員權限控制台</h2>
                  <p className="text-xs text-slate-400 mt-0.5">目前系統在線註冊總用戶數：{users.length} 名</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 text-xs font-semibold uppercase">
                        <th className="py-3 px-2">用戶帳號</th>
                        <th className="py-3 px-2">密碼(明碼)</th>
                        <th className="py-3 px-2">會員級別</th>
                        <th className="py-3 px-2 text-right">管理操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {users.map((user) => (
                        <tr key={user.username} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-2 font-bold text-slate-800">{user.username}</td>
                          <td className="py-3.5 px-2 font-mono text-xs text-slate-500">{user.password}</td>
                          <td className="py-3.5 px-2">
                            <button
                              onClick={() => adminTogglePaid(user.username)}
                              disabled={user.username === 'teacher'}
                              className={`text-[11px] font-bold px-2 py-0.5 rounded-full border transition-all ${user.isPaid ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'}`}
                            >
                              {user.username === 'teacher' ? '⭐ Admin' : user.isPaid ? '👑 Pro 會員' : '⚪ 免費版'}
                            </button>
                          </td>
                          <td className="py-3.5 px-2 text-right space-x-1.5">
                            <button onClick={() => adminResetPassword(user.username)} disabled={user.username === 'teacher'} className="text-[11px] bg-indigo-50 text-indigo-600 border border-indigo-100 px-2 py-1 rounded-md font-medium disabled:opacity-30">重設密碼</button>
                            <button onClick={() => adminDeleteUser(user.username)} disabled={user.username === 'teacher'} className="text-[11px] bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-600 hover:text-white px-2 py-1 rounded-md font-medium disabled:opacity-30">註銷/刪除</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              // 📝 狀況二：一般註冊用戶看到的任務清單
              <div className="flex flex-col h-full">
                <div className="border-b border-slate-100 pb-4 mb-4">
                  <h2 className="text-lg font-bold text-slate-900">我的任務清單</h2>
                  <p className="text-xs text-slate-400 mt-0.5">目前待辦: {tasks.filter(t => !t.completed).length} 個項目</p>
                </div>

                {tasks.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                    <span className="text-3xl mb-2">🍃</span>
                    <p className="text-sm font-medium text-slate-900">清單目前是空的</p>
                  </div>
                ) : (
                  <ul className="space-y-3 overflow-y-auto">
                    {tasks.map((task) => (
                      <li key={task.id} className={`group flex justify-between items-center p-4 rounded-xl border ${task.completed ? 'bg-slate-50/80 border-slate-100 opacity-60' : 'bg-white border-slate-200/60'}`}>
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <button type="button" onClick={() => setTasks(tasks.map(t => t.id === task.id ? { ...t, completed: !t.completed } : t))} className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${task.completed ? 'bg-indigo-600 text-white' : 'bg-white'}`}>
                            {task.completed && <span className="text-[10px]">✓</span>}
                          </button>
                          <span className={`text-sm font-medium text-slate-700 truncate ${task.completed ? 'line-through text-slate-400' : ''}`}>{task.title}</span>
                        </div>
                        <div className="flex items-center gap-3 ml-4 shrink-0">
                          {task.dueDate && <span className="text-[10px] font-semibold px-2 py-0.5 rounded border bg-rose-50 text-rose-600 border-rose-100">📅 {task.dueDate}</span>}
                          <button onClick={() => setTasks(tasks.filter(t => t.id !== task.id))} className="text-slate-400 hover:text-rose-500">🗑️</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            
          </div>

        </div>
      </main>
    </div>
  );
}