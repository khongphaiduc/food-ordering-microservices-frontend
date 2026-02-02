import api from "./api";

export const LogInUser = (email, password) => {
  return api.post("/auth/login", { email, password });
};

export const LogInUserByGoogle = () => {
  return api.get("/auth/googlelogin");
}
