import axios from "axios";
import nookies, { parseCookies } from "nookies";

export default async function getCurrentUser(ctx) {
  const cookies = parseCookies(ctx);

  if (!cookies.token) {
    ctx.res.statusCode = 302;
    ctx.res.setHeader("Location", `/auth/login`);
    return;
  }

  try {
    const user = await axios.get(
      process.env.NEXT_PUBLIC_API_URL + "/auth/currentUser",
      {
        headers: {
          Accept: "application/json",
          Authorization: "Bearer " + cookies.token,
        },
      }
    );

    return user.data.data;
  } catch (err) {
    nookies.destroy(ctx, "token");
    ctx.res.statusCode = 302;
    ctx.res.setHeader("Location", `/auth/login`);
    return;
  }
}