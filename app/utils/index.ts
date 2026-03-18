export const getStorage = (key: string) => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(key);
};

export const setStorage = (key: string, value: any) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, value);
};

export const removeStorage = (key: string) => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(key);
};
