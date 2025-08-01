export const getUserFromLocalStorage = () => {
  if (typeof window === "undefined") return null;
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

export const saveUserToLocalStorage = (user: any) => {
  if (typeof window === "undefined") return;
  localStorage.setItem("user", JSON.stringify(user));
};

export const logoutUser = () => {
  localStorage.removeItem("user");
};
