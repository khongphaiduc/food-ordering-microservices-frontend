import api from "./api";

export const LogInUser = (email, password) => {
  return api.post("/users/login", { email, password });
};

export const LogInUserByGoogle = () => {
  return api.get("/users/googlelogin");
}
