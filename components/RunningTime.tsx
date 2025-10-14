"use client";

import React, { useEffect, useState } from "react";

interface RunningTimeProps {
  createdAt: string | null;
  className?: string;
}

export default function RunningTime({
  createdAt,
  className = "",
}: RunningTimeProps) {
  const [runningTime, setRunningTime] = useState<string>("");

  useEffect(() => {
    if (!createdAt) {
      setRunningTime("--天--时--分--秒");
      return;
    }

    const updateTime = () => {
      const now = Date.now();
      const created = new Date(createdAt).getTime();
      const diff = Math.floor((now - created) / 1000); // 总秒数

      if (diff < 0) {
        setRunningTime("--天--时--分--秒");
        return;
      }

      const days = Math.floor(diff / 86400);
      const hours = Math.floor((diff % 86400) / 3600);
      const minutes = Math.floor((diff % 3600) / 60);
      const seconds = diff % 60;

      // 格式化为 DD天 HH:MM:SS
      const formatted = `${String(days).padStart(2, "0")}天 ${String(
        hours
      ).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(
        seconds
      ).padStart(2, "0")}`;
      setRunningTime(formatted);
    };

    // 立即更新一次
    updateTime();

    // 每秒更新
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, [createdAt]);

  return <div className={`font-mono ${className}`}>{runningTime}</div>;
}
