import { NAV } from "@/lib/config";

export type NavigationItem = {
  id: string;
  label: string;
  href: string;
  parentId?: string | null;
  enabled: boolean;
  order: number;
  hasSubMenu?: boolean;
  subMenus?: SubMenu[];
  flyer?: MenuFlyer;
};

export type NavigationNode = NavigationItem & { children: NavigationNode[] };

export type MenuFlyer = {
  id: string;
  url: string;
  type: "image" | "pdf";
  name: string;
};

export type SubMenu = {
  id: string;
  title: string;
  slug: string;
  order: number;
  flyer?: MenuFlyer;
};

export type MenuItem = {
  id: string;
  title: string;
  slug: string;
  href: string;
  parentId: string | null;
  order: number;
  enabled: boolean;
  hasSubMenu: boolean;
  flyer?: MenuFlyer;
  subMenus: SubMenu[];
};

function isMenuFlyer(value: unknown): value is MenuFlyer {
  if (!value || typeof value !== "object") return false;
  const flyer = value as Partial<MenuFlyer>;
  return typeof flyer.id === "string" &&
    typeof flyer.url === "string" &&
    (flyer.type === "image" || flyer.type === "pdf") &&
    typeof flyer.name === "string";
}

function normalizeSubMenus(value: unknown): SubMenu[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is SubMenu =>
      Boolean(item) &&
      typeof item.id === "string" &&
      typeof item.title === "string" &&
      typeof item.slug === "string" &&
      Number.isFinite(item.order),
    )
    .map((item) => ({
      id: item.id,
      title: item.title,
      slug: item.slug,
      order: item.order,
      ...(isMenuFlyer(item.flyer) ? { flyer: item.flyer } : {}),
    }))
    .sort((a, b) => a.order - b.order);
}

export type FlyerButton = {
  enabled: boolean;
  text: string;
  link: string;
  width: number;
  height: number;
  fontSize: number;
  fontWeight: string;
  borderRadius: number;
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  borderWidth: number;
  padding: number;
  alignment: "left" | "center" | "right";
};

export type Flyer = {
  id: string;
  image: string;
  title: string;
  description: string;
  button: FlyerButton;
};

type FlyerPage = {
  pageId: string;
  flyers: Flyer[];
};

export type DemoUser = {
  name: string;
  email: string;
  role: "admin";
  avatar?: string;
};

const SESSION_KEY = "ideveloped-demo-session";
const NAV_KEY = "ideveloped-demo-navigation-v2";
const FLYERS_KEY = "ideveloped-demo-flyers";
const PROFILE_KEY = "ideveloped-demo-profile";
const PASSWORD_KEY = "ideveloped-demo-password";
const CHANGE_EVENT = "ideveloped-demo-change";

export const DEMO_CREDENTIALS = {
  email: "admin@idevelopedskills.com",
  password: "skills2026",
};

export const DEFAULT_NAVIGATION: NavigationItem[] = NAV.map((item, index) => {
  const slug = item.label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return {
    id: `default-${slug}`,
    label: item.label,
    href: item.href === "#" ? `/${slug}` : item.href,
    enabled: true,
    order: index,
    hasSubMenu: false,
    subMenus: [],
  };
});

function notifyChange() {
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function subscribeToDemoChanges(callback: () => void) {
  window.addEventListener(CHANGE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

export function getDemoSession(): DemoUser | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as DemoUser) : null;
  } catch {
    return null;
  }
}

export function setDemoSession(user: DemoUser | null) {
  if (user) localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  else localStorage.removeItem(SESSION_KEY);
  notifyChange();
}

export function getNavigationItems(): NavigationItem[] {
  try {
    const raw = localStorage.getItem(NAV_KEY);
    if (!raw) return DEFAULT_NAVIGATION;
    const items = JSON.parse(raw) as NavigationItem[];
    if (!Array.isArray(items)) return DEFAULT_NAVIGATION;
    const navigation = items
      .filter((item) => typeof item.id === "string" && typeof item.label === "string" && typeof item.href === "string")
      .map((item) => {
        const subMenus = normalizeSubMenus(item.subMenus);
        return {
          ...item,
          parentId: typeof item.parentId === "string" ? item.parentId : null,
          enabled: item.enabled !== false,
          order: Number.isFinite(item.order) ? item.order : 0,
          hasSubMenu: item.hasSubMenu === true || subMenus.length > 0,
          subMenus,
        };
      })
      .sort((a, b) => a.order - b.order);
    const normalized = navigation.flatMap((item) => [
      { ...item, hasSubMenu: false, subMenus: [] },
      ...item.subMenus.map((subMenu) => ({
        id: subMenu.id,
        label: subMenu.title,
        href: `${item.href.replace(/\/+$/, "")}/${subMenu.slug}`,
        parentId: item.id,
        enabled: item.enabled,
        order: subMenu.order,
        hasSubMenu: false,
        subMenus: [],
        ...(subMenu.flyer ? { flyer: subMenu.flyer } : {}),
      })),
    ]);
    if (!normalized.some((item) => item.label.toLowerCase() === "home" && !item.parentId)) {
      return [{ ...DEFAULT_NAVIGATION[0], parentId: null, order: -1 }, ...normalized];
    }
    return normalized;
  } catch {
    return DEFAULT_NAVIGATION;
  }
}

export function getNavigationTree(): NavigationNode[] {
  const items = getNavigationItems();
  const byId = new Map<string, NavigationNode>();
  items.forEach((item) => byId.set(item.id, { ...item, children: [] }));
  const roots: NavigationNode[] = [];
  items.forEach((item) => {
    const node = byId.get(item.id);
    if (!node) return;
    const parent = item.parentId ? byId.get(item.parentId) : undefined;
    if (parent && parent.id !== item.id) parent.children.push(node);
    else roots.push(node);
  });
  const sort = (nodes: NavigationNode[]) => {
    nodes.sort((a, b) => a.order - b.order);
    nodes.forEach((node) => sort(node.children));
  };
  sort(roots);
  return roots;
}

export function setNavigationItems(items: NavigationItem[]) {
  localStorage.setItem(NAV_KEY, JSON.stringify(items));
  notifyChange();
}

export function getFlyersForPage(pageId: string): Flyer[] {
  const raw = localStorage.getItem(FLYERS_KEY);
  if (!raw) return [];
  const pages = JSON.parse(raw) as FlyerPage[];
  if (!Array.isArray(pages)) return [];
  return pages.find((page) => page.pageId === pageId)?.flyers ?? [];
}

export function setFlyersForPage(pageId: string, flyers: Flyer[]) {
  const raw = localStorage.getItem(FLYERS_KEY);
  const pages = raw ? (JSON.parse(raw) as FlyerPage[]) : [];
  const nextPages = Array.isArray(pages)
    ? pages.filter((page) => page.pageId !== pageId)
    : [];
  nextPages.push({ pageId, flyers });
  localStorage.setItem(FLYERS_KEY, JSON.stringify(nextPages));
  notifyChange();
}

export function deleteFlyersForPage(pageId: string) {
  const raw = localStorage.getItem(FLYERS_KEY);
  if (!raw) return;
  const pages = JSON.parse(raw) as FlyerPage[];
  if (!Array.isArray(pages)) return;
  localStorage.setItem(FLYERS_KEY, JSON.stringify(pages.filter((page) => page.pageId !== pageId)));
  notifyChange();
}

export function getDemoProfile(): DemoUser {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (raw) return { ...JSON.parse(raw), role: "admin" };
  } catch {
    // Reset malformed demo profile data to the default profile.
  }
  return { name: "Academy Administrator", email: DEMO_CREDENTIALS.email, role: "admin" };
}

export function setDemoProfile(profile: DemoUser) {
  const safeProfile = { ...profile, role: "admin" as const };
  localStorage.setItem(PROFILE_KEY, JSON.stringify(safeProfile));
  const session = getDemoSession();
  if (session) setDemoSession(safeProfile);
  else notifyChange();
}

export function getDemoPassword() {
  return localStorage.getItem(PASSWORD_KEY) ?? DEMO_CREDENTIALS.password;
}

export function setDemoPassword(password: string) {
  localStorage.setItem(PASSWORD_KEY, password);
}
