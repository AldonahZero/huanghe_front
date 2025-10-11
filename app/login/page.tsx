import React from 'react';
import ShuffleText from '@/components/ShuffleText';
import LoginForm from '@/components/LoginForm';

export const metadata = {
  title: '登录 - Huanghe 前端',
  description: '登录到 CS:GO 饰品交易监控平台'
};

export default function LoginPage() {
  // server component: just layout and pass to client components
  const headline = '欢迎使用 黄河 监控平台';

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="mx-auto max-w-xl w-full p-8">
        <div className="rounded-xl bg-white p-10 shadow-lg">
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-extrabold text-gray-900">
              {/* ShuffleText is client; keep an inline placeholder for SSR fallback */}
              <span className="inline-block">
                {/* Client component will animate this text */}
                <ShuffleText text={headline} className="text-3xl" />
              </span>
            </h1>
            <p className="mt-2 text-sm text-gray-500">使用你的账号登录以继续</p>
          </div>

          <div className="flex flex-col md:flex-row md:gap-8">
            <div className="flex-1">
              <LoginForm />
            </div>
            <div className="mt-6 md:mt-0 md:w-80">
              <div className="rounded-md border border-dashed border-gray-200 p-4 text-sm text-gray-600">
                小贴士：注册后可设置监控列表和提醒阈值。
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
