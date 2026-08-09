import { HttpClient, provideHttpClient, withInterceptors } from "@angular/common/http";
import {
  HttpTestingController,
  provideHttpClientTesting,
} from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { Router, provideRouter } from "@angular/router";

import { authInterceptor } from "./auth-interceptor";

const SESSAO = {
  token: "token-de-teste",
  user: { id: "u-1", name: "Candidato", email: "dev@axyo.com.br" },
};

describe("authInterceptor", () => {
  let http: HttpClient;
  let backend: HttpTestingController;
  let router: Router;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });

    http = TestBed.inject(HttpClient);
    backend = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    vi.spyOn(router, "navigateByUrl").mockResolvedValue(true);
  });

  afterEach(() => backend.verify());

  function comSessao(): void {
    localStorage.setItem("techx.session", JSON.stringify(SESSAO));
  }

  it("anexa o Bearer quando há sessão", () => {
    comSessao();
    http.get("/api/tasks").subscribe();

    const requisicao = backend.expectOne("/api/tasks");

    expect(requisicao.request.headers.get("Authorization")).toBe(`Bearer ${SESSAO.token}`);
    requisicao.flush({ tasks: [] });
  });

  it("não anexa nada quando não há sessão", () => {
    http.get("/api/tasks").subscribe();

    const requisicao = backend.expectOne("/api/tasks");

    expect(requisicao.request.headers.has("Authorization")).toBe(false);
    requisicao.flush({ tasks: [] });
  });

  it("não vaza o token para fora da API", () => {
    comSessao();
    http.get("https://exemplo.com/qualquer-coisa").subscribe();

    const requisicao = backend.expectOne("https://exemplo.com/qualquer-coisa");

    expect(requisicao.request.headers.has("Authorization")).toBe(false);
    requisicao.flush({});
  });

  it("no 401 de rota protegida, limpa a sessão e manda para o login", () => {
    comSessao();
    http.get("/api/tasks").subscribe({ error: () => undefined });

    backend
      .expectOne("/api/tasks")
      .flush({ code: "auth.token_revoked" }, { status: 401, statusText: "Unauthorized" });

    expect(localStorage.getItem("techx.session")).toBeNull();
    expect(router.navigateByUrl).toHaveBeenCalledWith("/login");
  });

  it("no 401 do login, não desloga nem navega — o erro é da tentativa", () => {
    comSessao();
    http.post("/api/auth/login", {}).subscribe({ error: () => undefined });

    backend
      .expectOne("/api/auth/login")
      .flush({ code: "auth.invalid_credentials" }, { status: 401, statusText: "Unauthorized" });

    expect(localStorage.getItem("techx.session")).not.toBeNull();
    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });

  it("erro que não é 401 não derruba a sessão", () => {
    comSessao();
    http.get("/api/tasks").subscribe({ error: () => undefined });

    backend
      .expectOne("/api/tasks")
      .flush({ code: "common.internal_error" }, { status: 500, statusText: "Server Error" });

    expect(localStorage.getItem("techx.session")).not.toBeNull();
    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });
});
