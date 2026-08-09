export interface Credentials {
  email: string;
  password: string;
}

export interface Registration extends Credentials {
  name: string;
}

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
}

export interface Session {
  token: string;
  user: AuthenticatedUser;
}
