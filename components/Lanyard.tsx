// Lightweight wrapper: dynamically import the client-only Lanyard component
import dynamic from "next/dynamic";
import type { ComponentProps } from "react";

const LanyardClient = dynamic(() => import("./LanyardClient"), {
  ssr: false,
});

type LanyardProps = ComponentProps<typeof LanyardClient>;

export default function Lanyard(props: LanyardProps) {
  // simply forward props to client component
  return <LanyardClient {...props} />;
}
