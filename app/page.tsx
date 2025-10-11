import Image from "next/image";
import Link from "next/link";
import HyperspeedWrapper from "../components/HyperspeedWrapper";
import Shuffle from "@/components/Shuffle";
import DecryptedText from "../components/DecryptedText";

export default function Home() {
  const headline = "Huanghe 监控平台";

  return (
    <>
      <div className="fixed inset-0 z-0">
        <HyperspeedWrapper preset="one" />
      </div>
      <div className="relative z-10 min-h-screen flex items-center justify-center">
        <div className="bg-white/70 backdrop-blur-md rounded-lg p-8 m-6 max-w-3xl text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">
            {/* ShuffleText is client; keep an inline placeholder for SSR fallback */}
            <span className="inline-block">
              {/* Client Shuffle component will animate this text */}
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
          <p className="text-sm text-gray-600 mb-6">
            <DecryptedText
              text="CS2, BN Supported."
              speed={100}
              maxIterations={40}
              className="revealed"
              parentClassName="all-letters"
              encryptedClassName="encrypted"
              animateOn="view"
            />
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-3 px-7 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-500 text-white text-lg font-semibold hover:from-indigo-700 hover:to-violet-600 shadow-lg transform active:translate-y-0.5 transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden
            >
              <path
                fillRule="evenodd"
                d="M3 4.5A1.5 1.5 0 014.5 3h7A1.5 1.5 0 0113 4.5V7h1.5A1.5 1.5 0 0116 8.5v7A1.5 1.5 0 0114.5 17h-7A1.5 1.5 0 016 15.5V13H4.5A1.5 1.5 0 013 11.5v-7zM9 8a1 1 0 011-1h4a1 1 0 110 2h-3v3a1 1 0 11-2 0V8z"
                clipRule="evenodd"
              />
            </svg>
            <span>登录</span>
          </Link>
        </div>
      </div>
    </>
  );
}
