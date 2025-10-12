"use client";

import React, { useState } from "react";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

export default function AuthTabs() {
  const [tab, setTab] = useState<"login" | "register">("login");

  return (
    <div className="w-full max-w-md mx-auto rounded-[2.5rem] overflow-hidden">
      <div className="flex rounded-t-[2.5rem] overflow-hidden bg-white/80 backdrop-blur-md">
        <button
          className={`flex-1 py-3 font-bold text-lg transition-colors duration-150 focus:outline-none ${
            tab === "login"
              ? "text-indigo-700 bg-white border-b-2 border-indigo-600"
              : "text-gray-500 bg-gray-50 border-b-2 border-transparent"
          }`}
          onClick={() => setTab("login")}
        >
          登录
        </button>
        <button
          className={`flex-1 py-3 font-bold text-lg transition-colors duration-150 focus:outline-none ${
            tab === "register"
              ? "text-indigo-700 bg-white border-b-2 border-indigo-600"
              : "text-gray-500 bg-gray-50 border-b-2 border-transparent"
          }`}
          onClick={() => setTab("register")}
        >
          注册
        </button>
      </div>
      <div className="bg-white/80 rounded-b-[2.5rem] shadow-2xl p-8 backdrop-blur-md">
        {tab === "login" ? <LoginForm /> : <RegisterForm />}
      </div>
    </div>
  );
}
