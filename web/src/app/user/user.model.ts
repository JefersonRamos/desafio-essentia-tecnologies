export interface UserProfile {
  readonly id: string|null;
  readonly name: string|null;
  readonly email: string|null;
}

export type UserProfilePatch = Partial<UserProfile>;

export const EMPTY_PROFILE: UserProfile = {
  id: null,
  name: null,
  email: null,
};
