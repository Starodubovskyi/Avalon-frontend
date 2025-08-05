type User = {
  name: string;
  lastName: string;
  profileImage?: string;
};

type Listener = () => void;

let currentUser: User | null = null;
const listeners: Listener[] = [];

export const mockAuth = {
  login(user: User) {
    currentUser = user;
    listeners.forEach((cb) => cb());
  },
  logout() {
    currentUser = null;
    listeners.forEach((cb) => cb());
  },
  getUser() {
    return currentUser;
  },
  subscribe(cb: Listener) {
    listeners.push(cb);
    return () => {
      const index = listeners.indexOf(cb);
      if (index !== -1) listeners.splice(index, 1);
    };
  },
};
