"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Logo from "./Logo";
import NavDropdown from "./NavDropdown";
import MobileAccordion from "./MobileAccordion";
import { PRIMARY_COUNT, SITE } from "@/lib/config";
import {
  DemoUser,
  getDemoSession,
  getNavigationTree,
  NavigationNode,
  setDemoSession,
  subscribeToDemoChanges,
} from "@/lib/demo-store";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [navigation, setNavigation] = useState<NavigationNode[]>([]);
  const [user, setUser] = useState<DemoUser | null>(null);
  const [accountOpen, setAccountOpen] = useState(false);
  useEffect(() => {
    const f = () => setScrolled(window.scrollY > 8);
    f(); window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, []);
  useEffect(() => { document.body.style.overflow = open ? "hidden" : ""; }, [open]);
  useEffect(() => {
    const refresh = () => {
      setNavigation(getNavigationTree().filter((item) => item.enabled));
      setUser(getDemoSession());
    };
    refresh();
    return subscribeToDemoChanges(refresh);
  }, []);

  const primary = navigation.slice(0, PRIMARY_COUNT);
  const more = navigation.slice(PRIMARY_COUNT);
  const isActive = (href: string) => pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
  function logout() {
    setDemoSession(null);
    setAccountOpen(false);
    setOpen(false);
    router.push("/");
  }

  const link = "relative px-3 py-2 text-[13px] font-bold uppercase tracking-wide text-neutral-800 transition-colors hover:text-brand after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:origin-left after:scale-x-0 after:bg-brand after:transition-transform hover:after:scale-x-100";

  return (
    <header className="sticky top-0 z-50">
      <div className="hidden bg-brand-dark text-xs text-white/90 md:block">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-2">
          <span>{SITE.address}</span>
          <span className="flex gap-6">
            <a href={`mailto:${SITE.email}`} className="hover:text-white">{SITE.email}</a>
            <a href={`tel:${SITE.phone.replace(/\./g, "")}`} className="hover:text-white">{SITE.phone}</a>
          </span>
        </div>
      </div>

      <div className={`bg-white/95 backdrop-blur transition-shadow ${scrolled ? "shadow-[0_4px_20px_rgba(0,0,0,.12)]" : "border-b border-neutral-200"}`}>
        <div className="mx-auto flex h-[72px] max-w-[1400px] items-center justify-between gap-4 px-4 sm:px-6">
          <Logo />
          <div className="ml-auto flex items-center gap-3">
          <nav aria-label="Main" className="hidden items-center xl:flex">
            {primary.map((n) => (
              n.children.length ? (
                <NavDropdown key={n.id} item={n} active={isActive} className={link} />
              ) : (
                <Link key={n.id} href={n.href} aria-current={isActive(n.href) ? "page" : undefined} className={`${link} ${isActive(n.href) ? "text-brand after:scale-x-100" : ""}`}>{n.label}</Link>
              )
            ))}
            {more.length > 0 && <div className="group relative">
              <button className={`${link} flex items-center gap-1`} aria-haspopup="true">More
                <svg viewBox="0 0 12 12" className="h-3 w-3 transition-transform group-hover:rotate-180 group-focus-within:rotate-180"><path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.8" fill="none" /></svg>
              </button>
              <ul className="invisible absolute right-0 top-full w-60 translate-y-2 rounded-xl bg-white p-2 opacity-0 shadow-xl ring-1 ring-black/5 transition-all group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                {more.map((n) => (
                  <li key={n.id}>
                    {n.children.length ? (
                      <NavDropdown key={n.id} item={n} active={isActive} className="block rounded-lg px-3 py-2 text-sm font-medium text-neutral-800 hover:bg-brand/10 hover:text-brand" side />
                    ) : (
                      <Link href={n.href} aria-current={isActive(n.href) ? "page" : undefined} className={`block rounded-lg px-3 py-2 text-sm font-medium hover:bg-brand/10 hover:text-brand ${isActive(n.href) ? "text-brand" : "text-neutral-800"}`}>{n.label}</Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>}
            {!user ? (
              <Link href="/login" className="ml-3 rounded-full border border-brand px-5 py-2 text-[13px] font-bold uppercase tracking-wide text-brand transition hover:bg-brand hover:text-white">Login</Link>
            ) : (
              <div className="group relative ml-3">
                <button onClick={() => setAccountOpen(!accountOpen)} className="flex items-center gap-2 rounded-full border border-neutral-200 px-3 py-2 text-sm font-bold text-neutral-800 hover:border-brand hover:text-brand" aria-expanded={accountOpen}>
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand text-xs text-white">{user.name.slice(0, 1).toUpperCase()}</span>
                  {user.name}
                </button>
                <ul className={`${accountOpen ? "visible opacity-100" : "invisible opacity-0 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100"} absolute right-0 top-full z-50 mt-2 w-48 rounded-xl bg-white p-2 shadow-xl ring-1 ring-black/5 transition-opacity`}>
                  <li><Link href="/admin" onClick={() => setAccountOpen(false)} className="block rounded-lg px-3 py-2 text-sm font-medium text-neutral-800 hover:bg-brand/10 hover:text-brand">Dashboard</Link></li>
                  <li><Link href="/profile" onClick={() => setAccountOpen(false)} className="block rounded-lg px-3 py-2 text-sm font-medium text-neutral-800 hover:bg-brand/10 hover:text-brand">My Profile</Link></li>
                  <li><button onClick={logout} className="block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-neutral-800 hover:bg-brand/10 hover:text-brand">Logout</button></li>
                </ul>
              </div>
            )}
          </nav>

          <button aria-label="Open menu" aria-expanded={open} onClick={() => setOpen(true)} className="flex h-11 w-11 flex-col items-center justify-center gap-[5px] rounded-full bg-neutral-100 xl:hidden">
            <span className="h-0.5 w-5 bg-neutral-900" /><span className="h-0.5 w-5 bg-neutral-900" /><span className="h-0.5 w-3 self-start bg-neutral-900 ml-3" />
          </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      <div className={`fixed inset-0 z-50 xl:hidden ${open ? "visible" : "invisible"}`}>
        <div onClick={() => setOpen(false)} className={`absolute inset-0 bg-black/60 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`} />
        <aside className={`absolute right-0 top-0 flex h-full w-[86%] max-w-sm flex-col bg-white shadow-2xl transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}>
          <div className="flex h-[72px] items-center justify-between border-b px-4">
            <Logo />
            <button aria-label="Close menu" onClick={() => setOpen(false)} className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-300 text-2xl leading-none">×</button>
          </div>
          <nav aria-label="Mobile" className="flex-1 overflow-y-auto px-4 py-3">
            {user && (
              <div className="mb-3 rounded-lg bg-neutral-100 p-3">
                <p className="font-bold text-neutral-900">{user.name}</p>
                <Link href="/admin" onClick={() => setOpen(false)} className="mt-2 inline-block text-sm font-bold text-brand">Dashboard</Link>
                <Link href="/profile" onClick={() => setOpen(false)} className="ml-4 inline-block text-sm font-bold text-brand">My Profile</Link>
                <button onClick={logout} className="ml-4 text-sm font-bold text-brand">Logout</button>
              </div>
            )}
            {navigation.map((n) => (
              n.children.length ? (
                <MobileAccordion key={n.id} item={n} active={isActive} onNavigate={() => setOpen(false)} />
              ) : (
                <Link key={n.id} href={n.href} onClick={() => setOpen(false)} aria-current={isActive(n.href) ? "page" : undefined} className={`block border-b border-neutral-100 py-3 text-[15px] font-bold uppercase ${isActive(n.href) ? "text-brand" : "text-neutral-800"}`}>{n.label}</Link>
              )
            ))}
          </nav>
          <div className="border-t p-4">
            {!user && <Link href="/login" onClick={() => setOpen(false)} className="block rounded-full bg-brand py-4 text-center text-lg font-bold uppercase text-white">Login</Link>}
          </div>
        </aside>
      </div>
    </header>
  );
}
