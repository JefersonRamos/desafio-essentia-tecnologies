export type UserId = string;

export interface User {
  readonly id: UserId;
  readonly name: string;
  readonly email: string;
}

export interface UserWithSecret extends User {
  readonly passwordHash: string;
}
