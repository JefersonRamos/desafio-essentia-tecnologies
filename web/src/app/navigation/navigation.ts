import { Component, ElementRef, inject, signal, viewChild } from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import { AuthService } from "../auth/auth-service";
import { ThemeStore } from "../core/theme/theme-store";
import { UserStore } from "../user/user-store";

@Component({
  selector: "app-navigation",
  imports: [RouterLink],
  templateUrl: "./navigation.html",
  styleUrl: "./navigation.css",
  host: {
    "(document:click)": "closeOnOutside($event)",
    "(document:keydown.escape)": "closeMenu()",
  },
})
export class Navigation {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly account = viewChild.required<ElementRef<HTMLElement>>("account");

  protected readonly users = inject(UserStore);
  protected readonly theme = inject(ThemeStore);
  protected readonly menuOpen = signal(false);

  protected toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  protected closeMenu(): void {
    this.menuOpen.set(false);
  }

  protected closeOnOutside(event: Event): void {
    if (!this.account().nativeElement.contains(event.target as Node)) {
      this.closeMenu();
    }
  }

  protected signOut(): void {
    this.closeMenu();
    this.auth.signOut().subscribe(() => void this.router.navigateByUrl("/login"));
  }
}
