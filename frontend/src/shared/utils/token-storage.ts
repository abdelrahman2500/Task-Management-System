class TokenStorage {
  getAccessToken() {
    return localStorage.getItem("accessToken");
  }

  setAccessToken(token: string) {
    localStorage.setItem("accessToken", token);
  }

  removeAccessToken() {
    localStorage.removeItem("accessToken");
  }
}

export const tokenStorage = new TokenStorage();
