import {computed} from '@angular/core';
import {patchState, signalStore, withComputed, withMethods, withState} from '@ngrx/signals';
import {EMPTY_PROFILE, type UserProfile, type UserProfilePatch} from './user.model';

/** Perfil inicial — valores vindos do design, até haver autenticação de verdade. */
const INITIAL_PROFILE: UserProfile = {
  id: null,
  name: null,
  email: null
};

export const UserStore = signalStore(
  {providedIn: 'root'},

  withState<UserProfile>(INITIAL_PROFILE),

  withComputed(({id, name}) => ({
    /** Iniciais para o avatar quando não houver imagem. */
    initials: computed(() => (name() ?? '').split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]!.toUpperCase())
      .join('')
    ),
    isAuthenticated: computed(() => id() != null),
  })),

  withMethods((store) => ({
    setProfile(patch: UserProfilePatch): void {
      patchState(store, patch);
    },
    signOut(): void {
      patchState(store, EMPTY_PROFILE);
    },
  })),
);
