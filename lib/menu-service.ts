import {
  getNavigationItems,
  MenuFlyer,
  MenuItem,
  NavigationItem,
  setNavigationItems,
  SubMenu,
} from "@/lib/demo-store";

const DATABASE_NAME = "ideveloped-menu-flyers";
const STORE_NAME = "flyers";
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf"]);

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE_NAME);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Could not open flyer storage."));
  });
}

async function withStore<T>(
  mode: IDBTransactionMode,
  action: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, mode);
    const request = action(transaction.objectStore(STORE_NAME));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Flyer storage request failed."));
    transaction.oncomplete = () => database.close();
    transaction.onerror = () => {
      database.close();
      reject(transaction.error ?? new Error("Flyer storage transaction failed."));
    };
  });
}

export function getMenuItems(): MenuItem[] {
  const navigation = getNavigationItems();
  const byId = new Map(navigation.map((item) => [item.id, item]));
  return navigation.map((item) => {
    const parentPath = item.parentId ? byId.get(item.parentId)?.href.replace(/\/+$/, "") ?? "" : "";
    const route = item.href.replace(/^\/+|\/+$/g, "");
    const slug = item.parentId && parentPath
      ? route.slice(parentPath.replace(/^\/+|\/+$/g, "").length).replace(/^\/+/, "")
      : route;
    return {
      id: item.id,
      title: item.label,
      slug,
      href: item.href,
      parentId: item.parentId ?? null,
      order: item.order,
      enabled: item.enabled,
      hasSubMenu: item.hasSubMenu === true,
      flyer: item.flyer,
      subMenus: [...(item.subMenus ?? [])].sort((a, b) => a.order - b.order),
    };
  });
}

export function setMenuItems(menus: MenuItem[]) {
  const currentItems = getNavigationItems();
  const existingById = new Map(currentItems.map((item) => [item.id, item]));
  const menuById = new Map(menus.map((menu) => [menu.id, menu]));
  const routeById = new Map<string, string>();
  const getRoute = (menu: MenuItem, visiting = new Set<string>()): string => {
    const cached = routeById.get(menu.id);
    if (cached) return cached;
    if (visiting.has(menu.id)) throw new Error("Navigation items cannot be nested under themselves.");
    visiting.add(menu.id);
    const segment = menu.slug.trim().replace(/^\/+|\/+$/g, "").toLowerCase();
    const parent = menu.parentId ? menuById.get(menu.parentId) : undefined;
    const route = parent
      ? `${getRoute(parent, visiting).replace(/\/+$/, "")}/${segment}`
      : segment ? `/${segment}` : "/";
    visiting.delete(menu.id);
    routeById.set(menu.id, route);
    return route;
  };
  const navigation: NavigationItem[] = menus.map((menu) => {
    const existing = existingById.get(menu.id);
    const hasChildren = menus.some((candidate) => candidate.parentId === menu.id);
    return {
      ...existing,
      id: menu.id,
      label: menu.title,
      href: getRoute(menu),
      parentId: menu.parentId,
      enabled: menu.enabled,
      order: menu.order,
      hasSubMenu: hasChildren,
      subMenus: [],
      flyer: menu.flyer,
    };
  });
  setNavigationItems(navigation);
}

export async function saveMenuFlyer(file: File): Promise<MenuFlyer> {
  const extension = file.name.split(".").pop()?.toLowerCase();
  const validExtension = ["jpg", "jpeg", "png", "webp", "pdf"].includes(extension ?? "");
  const validType = ALLOWED_TYPES.has(file.type);
  if (!validExtension || !validType) {
    throw new Error("Choose a JPG, PNG, WebP, or PDF file.");
  }
  if (!file.size) {
    throw new Error("The selected flyer file is empty.");
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("Flyer files must be 5 MB or smaller.");
  }
  const id = `submenu-flyer-${crypto.randomUUID()}`;
  await withStore("readwrite", (store) => store.put(file, id));
  return {
    id,
    url: `indexeddb:${id}`,
    type: file.type === "application/pdf" ? "pdf" : "image",
    name: file.name,
  };
}

export async function resolveMenuFlyerUrl(flyer: MenuFlyer): Promise<string> {
  if (!flyer.url.startsWith("indexeddb:")) return flyer.url;
  const blob = await withStore("readonly", (store) => store.get(flyer.id));
  if (!(blob instanceof Blob)) throw new Error(`Flyer "${flyer.name}" is unavailable in this browser.`);
  return URL.createObjectURL(blob);
}

export async function deleteMenuFlyer(flyer?: MenuFlyer) {
  if (flyer?.url.startsWith("indexeddb:")) {
    await withStore("readwrite", (store) => store.delete(flyer.id));
  }
}

export function menuPath(menu: MenuItem) {
  return menu.href;
}

export function subMenuPath(menu: MenuItem, subMenu: SubMenu) {
  return `${menuPath(menu).replace(/\/$/, "")}/${subMenu.slug}`;
}
