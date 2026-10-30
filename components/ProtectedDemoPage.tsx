"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DemoUser, getDemoSession, subscribeToDemoChanges } from "@/lib/demo-store";

export default function ProtectedDemoPage({ children }: { children: (user: DemoUser) => ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<DemoUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const check = () => {
      const session = getDemoSession();
      if (!session || session.role !== "admin") {
        router.replace("/login");
        return;
      }
      setUser(session);
      setReady(true);
    };
    check();
    return subscribeToDemoChanges(check);
  }, [router]);

  if (!ready || !user) {
    return <main className="flex min-h-[50vh] items-center justify-center bg-[#150b0b] text-white">Checking demo session…</main>;
  }
  return children(user);
}
