import React from "react";
import Shuffle from "@/components/Shuffle";
import AuthTabs from "@/components/AuthTabs";
import LetterGlitch from "@/components/LetterGlitch";

export const metadata = {
  title: "登录 - Huanghe 前端",
  description: "登录到 CS:GO 饰品交易监控平台",
};

export default function LoginPage() {
  // server component: just layout and pass to client components
  const headline = "欢迎使用 Huanghe 监控平台";

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center relative">
      {/* Fullscreen background */}
      <div className="absolute inset-0 z-0">
        <LetterGlitch
          glitchSpeed={50}
          centerVignette={true}
          outerVignette={false}
          smooth={true}
        />
      </div>

      <div className="mx-auto w-full max-w-4xl p-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 bg-white/70 backdrop-blur-md rounded-xl shadow-xl overflow-hidden">
          {/* Left decorative panel */}
          <div className="hidden md:flex flex-col items-center justify-center p-10 bg-gradient-to-br from-indigo-600 via-violet-500 to-pink-500 text-white">
            <div className="max-w-xs text-center">
              <h2 className="text-2xl font-bold mb-4">欢迎来到 Huanghe</h2>
              <p className="text-sm opacity-90 mb-6">
                一个用于 CS2 饰品监控与交易提醒的轻量前端面板。
              </p>
              {/* Decorative glitch canvas */}
              <div className="rounded-md bg-white/10 p-4">
                <LetterGlitch
                  glitchColors={["#ffffff", "#FFD6E0", "#B8C1FF"]}
                  glitchSpeed={20}
                  characters="Huanghe"
                  centerVignette={false}
                  outerVignette={false}
                  smooth={true}
                />
              </div>
            </div>
          </div>

          {/* Right form panel */}
          <div className="p-8">
            <div className="mb-6 text-center">
              <h1 className="text-3xl font-extrabold text-gray-900">
                <span className="inline-block">
                  <Shuffle
                    text={headline}
                    className="text-3xl"
                    shuffleDirection="right"
                    duration={0.85}
                    animationMode="evenodd"
                    shuffleTimes={3}
                    stagger={0.03}
                    threshold={0.1}
                    triggerOnce={true}
                    triggerOnHover={true}
                  />
                </span>
              </h1>
              <p className="mt-2 text-sm text-gray-500">
                使用你的账号登录以继续
              </p>
            </div>

            <div className="">
              {/* 登录/注册卡片切换 */}
              <AuthTabs />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
