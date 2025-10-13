"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import ProfileCard from "./ProfileCard";
import { useAuth } from "@/contexts/AuthContext";
import { Canvas, extend, useFrame } from "@react-three/fiber";
import {
  useGLTF,
  useTexture,
  Environment,
  Lightformer,
} from "@react-three/drei";
import {
  BallCollider,
  CuboidCollider,
  Physics,
  RigidBody,
  useRopeJoint,
  useSphericalJoint,
  RigidBodyProps,
} from "@react-three/rapier";
import { MeshLineGeometry, MeshLineMaterial } from "meshline";
import * as THREE from "three";
// replace with your own imports, see the usage snippet for details
// Use public assets path so project doesn't require these files to be colocated with the component.
// Place your `card.glb` and `lanyard.png` under `public/assets/lanyard/`.
const cardGLB = "/assets/lanyard/card.glb";
const lanyard = "/assets/lanyard/lanyard.png";

import "./Lanyard.css";

extend({ MeshLineGeometry, MeshLineMaterial });

interface LanyardProps {
  position?: [number, number, number];
  gravity?: [number, number, number];
  fov?: number;
  transparent?: boolean;
}

export default function LanyardClient({
  position = [0, 0, 30],
  gravity = [0, -40, 0],
  fov = 20,
  transparent = true,
}: LanyardProps) {
  const { user } = useAuth();
  const [showProfile, setShowProfile] = useState(false);

  // 格式化会员等级显示
  const getMemberLevelText = (level?: string) => {
    if (!level) return "普通会员";
    const levelMap: Record<string, string> = {
      emperor: "帝王会员",
      private_director: "私董会员",
      core: "核心会员",
      normal: "普通会员",
    };
    return levelMap[level] || level;
  };

  useEffect(() => {
    const handler = () => setShowProfile(true);
    window.addEventListener("lanyard:cardDouble", handler as EventListener);
    return () =>
      window.removeEventListener(
        "lanyard:cardDouble",
        handler as EventListener
      );
  }, []);

  // track canvas remount key to recreate Canvas when context is lost
  const [canvasKey, setCanvasKey] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [glbUrl, setGlbUrl] = useState<string | null>(null);
  const canvasListenersRef = useRef<{
    el?: HTMLCanvasElement | null;
    onLost?: EventListenerOrEventListenerObject;
    onRestored?: EventListenerOrEventListenerObject;
  }>({});

  // Try to cache/load card.glb from CacheStorage to avoid repeated network fetches.
  useEffect(() => {
    let mountedLocal = true;
    let objectUrl: string | null = null;

    async function ensureCached() {
      try {
        if (typeof window !== "undefined" && "caches" in window) {
          const cache = await caches.open("assets-lanyard-v1");
          const cached = await cache.match(cardGLB);
          if (cached) {
            const blob = await cached.blob();
            objectUrl = URL.createObjectURL(blob);
            if (mountedLocal) setGlbUrl(objectUrl);
            return;
          }

          const resp = await fetch(cardGLB, { cache: "no-store" });
          if (resp && resp.ok) {
            try {
              await cache.put(cardGLB, resp.clone());
            } catch (e) {
              // put may fail on opaque responses or cross-origin; ignore
            }
            const blob = await resp.blob();
            objectUrl = URL.createObjectURL(blob);
            if (mountedLocal) setGlbUrl(objectUrl);
            return;
          }
        }
      } catch (err) {
        // fallback to direct URL
      }
      if (mountedLocal) setGlbUrl(cardGLB);
    }

    ensureCached();
    return () => {
      mountedLocal = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, []);
  useEffect(() => {
    // mark client mounted to avoid creating canvas during SSR/hydration
    setMounted(true);
    return () => {
      // cleanup any lingering listeners
      const cur = canvasListenersRef.current;
      if (cur.el) {
        try {
          if (cur.onLost)
            cur.el.removeEventListener(
              "webglcontextlost",
              cur.onLost as EventListener
            );
          if (cur.onRestored)
            cur.el.removeEventListener(
              "webglcontextrestored",
              cur.onRestored as EventListener
            );
        } catch (err) {}
      }
    };
  }, []);
  const [contextLost, setContextLost] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const handleRetry = useCallback(() => {
    setContextLost(false);
    setCanvasKey((k) => k + 1);
  }, []);

  return (
    <div className="lanyard-wrapper" ref={wrapperRef}>
      {contextLost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white p-6 rounded-md">
            <p className="mb-4">
              渲染上下文丢失 (WebGL context lost)。请尝试重试。
            </p>
            <div className="text-right">
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded"
                onClick={handleRetry}
                onTouchStart={(e) => {
                  e.stopPropagation();
                  handleRetry();
                }}
                onPointerDown={(e) => {
                  (e as any).stopPropagation();
                  handleRetry();
                }}
                tabIndex={0}
                style={{
                  touchAction: "manipulation",
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                重试
              </button>
            </div>
          </div>
        </div>
      )}
      {showProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="p-4">
            <ProfileCard
              name={user?.user_nickname || user?.username || "用户"}
              title={user?.team_name || "黄河会"}
              handle={user?.user_nickname || user?.username || "用户"}
              status={getMemberLevelText(user?.member_level)}
              contactText="查看个人信息"
              avatarUrl={user?.avatar_url || "/logo.ico"}
              showUserInfo={true}
              enableTilt={true}
              enableMobileTilt={false}
              onContactClick={() => {
                // 跳转到个人信息页面
                if (typeof window !== "undefined") {
                  window.location.href = "/dashboard/account";
                }
              }}
            />
            <div className="mt-4 text-right">
              <button
                className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 transition-colors"
                onClick={() => setShowProfile(false)}
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
      {mounted && !contextLost && (
        <Canvas
          key={canvasKey}
          camera={{ position, fov }}
          gl={{
            alpha: transparent,
            antialias: false,
            powerPreference: "high-performance",
            preserveDrawingBuffer: false,
          }}
          onCreated={({ gl }) => {
            try {
              (gl as any).setClearColor(
                new THREE.Color(0x000000),
                transparent ? 0 : 1
              );
            } catch (e) {
              // swallow
            }
            try {
              const canvasEl = (gl as any).domElement as
                | HTMLCanvasElement
                | undefined;
              if (canvasEl) {
                const onLost = (ev: Event) => {
                  ev.preventDefault();
                  console.warn(
                    "Lanyard: WebGL context lost (onCreated listener)"
                  );
                  try {
                    canvasEl.style.pointerEvents = "none";
                  } catch (err) {}
                  setContextLost(true);
                };
                const onRestored = () => {
                  console.info(
                    "Lanyard: WebGL context restored (onCreated listener)"
                  );
                  try {
                    canvasEl.style.pointerEvents = "";
                  } catch (err) {}
                  setContextLost(false);
                  setCanvasKey((k) => k + 1);
                };
                canvasEl.addEventListener(
                  "webglcontextlost",
                  onLost as EventListener
                );
                canvasEl.addEventListener(
                  "webglcontextrestored",
                  onRestored as EventListener
                );
                return () => {
                  try {
                    canvasEl.removeEventListener(
                      "webglcontextlost",
                      onLost as EventListener
                    );
                    canvasEl.removeEventListener(
                      "webglcontextrestored",
                      onRestored as EventListener
                    );
                  } catch (err) {}
                };
              }
            } catch (err) {
              // ignore
            }
          }}
        >
          <ambientLight intensity={Math.PI} />
          <Physics gravity={gravity} timeStep={1 / 60}>
            <Band glbUrl={glbUrl} />
          </Physics>
          <Environment blur={0.75}>
            <Lightformer
              intensity={2}
              color="white"
              position={[0, -1, 5]}
              rotation={[0, 0, Math.PI / 3]}
              scale={[100, 0.1, 1]}
            />
            <Lightformer
              intensity={3}
              color="white"
              position={[-1, -1, 1]}
              rotation={[0, 0, Math.PI / 3]}
              scale={[100, 0.1, 1]}
            />
            <Lightformer
              intensity={3}
              color="white"
              position={[1, 1, 1]}
              rotation={[0, 0, Math.PI / 3]}
              scale={[100, 0.1, 1]}
            />
            <Lightformer
              intensity={10}
              color="white"
              position={[-10, 0, 14]}
              rotation={[0, Math.PI / 2, Math.PI / 3]}
              scale={[100, 10, 1]}
            />
          </Environment>
        </Canvas>
      )}
    </div>
  );
}

interface BandProps {
  maxSpeed?: number;
  minSpeed?: number;
  onHoverChange?: (hovered: boolean) => void;
  glbUrl?: string | null;
}
function Band({
  maxSpeed = 50,
  minSpeed = 0,
  onHoverChange,
  glbUrl,
}: BandProps) {
  // Using "any" for refs since the exact types depend on Rapier's internals
  const band = useRef<any>(null);
  const fixed = useRef<any>(null);
  const j1 = useRef<any>(null);
  const j2 = useRef<any>(null);
  const j3 = useRef<any>(null);
  const card = useRef<any>(null);

  const vec = new THREE.Vector3();
  const ang = new THREE.Vector3();
  const rot = new THREE.Vector3();
  const dir = new THREE.Vector3();

  const segmentProps: any = {
    type: "dynamic" as RigidBodyProps["type"],
    canSleep: true,
    colliders: false,
    angularDamping: 4,
    linearDamping: 4,
  };

  const { nodes, materials } = useGLTF((glbUrl as string) || cardGLB) as any;
  const texture: any = useTexture(lanyard);
  const [curve] = useState(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
      ])
  );
  const [dragged, drag] = useState<false | THREE.Vector3>(false);
  const [hovered, hover] = useState(false);

  const [isSmall, setIsSmall] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth < 1024;
    }
    return false;
  });

  useEffect(() => {
    const handleResize = (): void => {
      setIsSmall(window.innerWidth < 1024);
    };

    window.addEventListener("resize", handleResize);
    return (): void => window.removeEventListener("resize", handleResize);
  }, []);

  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 1]);
  useSphericalJoint(j3, card, [
    [0, 0, 0],
    [0, 1.45, 0],
  ]);

  useEffect(() => {
    if (hovered) {
      document.body.style.cursor = dragged ? "grabbing" : "grab";
      return () => {
        document.body.style.cursor = "auto";
      };
    }
  }, [hovered, dragged]);

  useFrame((state, delta) => {
    if (dragged && typeof dragged !== "boolean") {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
      dir.copy(vec).sub(state.camera.position).normalize();
      vec.add(dir.multiplyScalar(state.camera.position.length()));
      [card, j1, j2, j3, fixed].forEach((ref) => ref.current?.wakeUp());
      card.current?.setNextKinematicTranslation({
        x: vec.x - dragged.x,
        y: vec.y - dragged.y,
        z: vec.z - dragged.z,
      });
    }
    if (fixed.current) {
      [j1, j2].forEach((ref) => {
        if (!ref.current.lerped)
          ref.current.lerped = new THREE.Vector3().copy(
            ref.current.translation()
          );
        const clampedDistance = Math.max(
          0.1,
          Math.min(1, ref.current.lerped.distanceTo(ref.current.translation()))
        );
        ref.current.lerped.lerp(
          ref.current.translation(),
          delta * (minSpeed + clampedDistance * (maxSpeed - minSpeed))
        );
      });
      curve.points[0].copy(j3.current.translation());
      curve.points[1].copy(j2.current.lerped);
      curve.points[2].copy(j1.current.lerped);
      curve.points[3].copy(fixed.current.translation());
      band.current.geometry.setPoints(curve.getPoints(32));
      ang.copy(card.current.angvel());
      rot.copy(card.current.rotation());
      card.current.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z });
    }
  });

  curve.curveType = "chordal";
  if (texture && typeof texture === "object" && "wrapS" in texture) {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  }

  return (
    <>
      <group position={[0, 4, 0]}>
        <RigidBody
          ref={fixed}
          {...segmentProps}
          type={"fixed" as RigidBodyProps["type"]}
        />
        <RigidBody
          position={[0.5, 0, 0]}
          ref={j1}
          {...segmentProps}
          type={"dynamic" as RigidBodyProps["type"]}
        >
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody
          position={[1, 0, 0]}
          ref={j2}
          {...segmentProps}
          type={"dynamic" as RigidBodyProps["type"]}
        >
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody
          position={[1.5, 0, 0]}
          ref={j3}
          {...segmentProps}
          type={"dynamic" as RigidBodyProps["type"]}
        >
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody
          position={[2, 0, 0]}
          ref={card}
          {...segmentProps}
          type={
            dragged
              ? ("kinematicPosition" as RigidBodyProps["type"])
              : ("dynamic" as RigidBodyProps["type"])
          }
        >
          <CuboidCollider args={[0.8, 1.125, 0.01]} />
          <group
            scale={2.25}
            position={[0, -1.2, -0.05]}
            onPointerOver={() => hover(true)}
            onPointerOut={() => hover(false)}
            onPointerUp={(e: any) => {
              // touch/double-tap detection for mobile: if two taps within 300ms, treat as double-click
              try {
                const pointerType =
                  e.pointerType ||
                  (e.nativeEvent && e.nativeEvent.pointerType) ||
                  "";
                if (pointerType === "touch" || e.type === "touchend") {
                  const now = Date.now();
                  const last = (e.currentTarget.__lastTap as number) || 0;
                  if (now - last < 300) {
                    try {
                      window.dispatchEvent(
                        new CustomEvent("lanyard:cardDouble")
                      );
                    } catch (err) {}
                    e.currentTarget.__lastTap = 0;
                  } else {
                    e.currentTarget.__lastTap = now;
                  }
                }
              } catch (err) {}
              try {
                e.target.releasePointerCapture(e.pointerId);
              } catch (err) {}
              drag(false);
            }}
            onPointerDown={(e: any) => {
              try {
                e.target.setPointerCapture(e.pointerId);
              } catch (err) {}
              drag(
                new THREE.Vector3()
                  .copy(e.point)
                  .sub(vec.copy(card.current.translation()))
              );
            }}
            onDoubleClick={() => {
              // notify outer component to show profile UI
              try {
                window.dispatchEvent(new CustomEvent("lanyard:cardDouble"));
              } catch (e) {}
            }}
          >
            <mesh geometry={nodes.card.geometry}>
              <meshPhysicalMaterial
                map={materials.base.map}
                map-anisotropy={16}
                clearcoat={1}
                clearcoatRoughness={0.15}
                roughness={0.9}
                metalness={0.8}
              />
            </mesh>
            <mesh
              geometry={nodes.clip.geometry}
              material={materials.metal}
              material-roughness={0.3}
            />
            <mesh geometry={nodes.clamp.geometry} material={materials.metal} />
          </group>
        </RigidBody>
      </group>
      <mesh ref={band}>
        {/* meshline JSX types can confuse TypeScript in this repo; ignore for now */}
        {/* @ts-ignore */}
        <meshLineGeometry />
        {/* @ts-ignore */}
        <meshLineMaterial
          color="white"
          depthTest={false}
          resolution={isSmall ? [1000, 2000] : [1000, 1000]}
          useMap
          map={texture}
          repeat={[-4, 1]}
          lineWidth={1}
        />
      </mesh>
    </>
  );
}
