export const getData = () =>
  JSON.parse(localStorage.getItem("bot_data")) || { users: [] };

export const saveData = (data) =>
  localStorage.setItem("bot_data", JSON.stringify(data));

export const getLoggedUser = () =>
  localStorage.getItem("logged_user");
