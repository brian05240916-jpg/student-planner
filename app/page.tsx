"use client";
import { useState, useEffect } from 'react';

// 模擬的全域使用者清單 (正式環境應使用 Firebase)
const ALL_USERS = [
  { id: 1, username: 'brian', isPaid: true },
  { id: 2, username: 'tester', isPaid: false },
  { id: 3, username: 'studentA', isPaid: false },
];

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState({ username: '', password: '' });
  const [isPaid, setIsPaid] = useState(false);
  const [users, setUsers] = useState(ALL_USERS); // 管理員可操作的列表

  // 登入邏輯
  const handleAuth = () => {
    if (user.password.length >= 8 && /[A-Z]/.test(user.password) && /[a-z]/.test(user.password) && /[0-9]/.test(user.password)) {
      setIsLoggedIn(true);
      if (user.username === 'admin') setIsPaid(true);
    } else {
      alert('密碼規則錯誤！');
    }
  };

  const deleteUser = (id: number) => {
    setUsers(users.filter(u => u.id !== id));
  };

  // --- 管理員後台 ---
  if (isLoggedIn && user.username === 'admin') {
    return (
      <main className="p-8 max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">管理員控制台</h1>
        <div className="bg-white p-6 rounded-xl shadow border">
          <h2 className="text-xl font-bold mb-4">註冊人數: {users.length} 人</h2>
          <ul className="space-y-3">
            {users.map(u => (
              <li key={u.id} className="flex justify-between items-center border-b pb-2">
                <span>{u.username} {u.isPaid ? '✅' : '⏳'}</span>
                <button onClick={() => deleteUser(u.id)} className="bg-red-500 text-white px-3 py-1 rounded">刪除</button>
              </li>
            ))}
          </ul>
        </div>
        <button onClick={() => setIsLoggedIn(false)} className="mt-8 text-gray-500">登出</button>
      </main>
    );
  }

  // --- 一般會員介面 ---
  if (isLoggedIn) {
    return (
      <main className="p-8 text-center">
        <h1 className="text-2xl font-bold">歡迎回來, {user.username}</h1>
        <button onClick={() => setIsLoggedIn(false)} className="mt-4 text-gray-500">登出</button>
      </main>
    );
  }

  // --- 登入頁面 ---
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-80">
        <input className="w-full border p-2 mb-2 rounded" placeholder="帳號" onChange={e => setUser({...user, username: e.target.value})} />
        <input type="password" className="w-full border p-2 mb-4 rounded" placeholder="密碼" onChange={e => setUser({...user, password: e.target.value})} />
        <button onClick={handleAuth} className="w-full bg-blue-600 text-white p-2 rounded">登入</button>
      </div>
    </main>
  );
}