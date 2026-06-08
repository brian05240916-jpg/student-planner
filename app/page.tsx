"use client";
import { useState } from 'react';

export default function Home() {
  const [tasks, setTasks] = useState<string[]>([]);
  const [input, setInput] = useState('');

  const addTask = () => {
    if (input) {
      setTasks([...tasks, input]);
      setInput('');
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <h1 className="text-4xl font-bold mb-8">學生規劃器</h1>
      <div className="flex gap-2 mb-4">
        <input 
          className="border p-2 rounded text-black"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="新增待辦事項..."
        />
        <button onClick={addTask} className="bg-blue-500 text-white p-2 rounded">
          加入
        </button>
      </div>
      <ul className="w-full max-w-md">
        {tasks.map((task, index) => (
          <li key={index} className="border-b p-2">{task}</li>
        ))}
      </ul>
    </main>
  );
}