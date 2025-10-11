"use client";

import dynamic from "next/dynamic";
import React from "react";

const Lanyard = dynamic(() => import("../../../components/Lanyard"), {
  ssr: false,
  loading: () => <div className="py-8 text-center">loading …</div>,
}) as unknown as React.ComponentType<any>;

export default function ProfilePage() {
  return <Lanyard position={[0, 0, 20]} gravity={[0, -40, 0]} />;
}
