import { withAuth } from "next-auth/middleware";
import envConfig from "./config/config";

export default withAuth({
    pages: {
        signIn: "/",
    },
    secret: envConfig.NEXTAUTH_SECRET
});

export const config = {
    matcher: ["/dashboard/:path*"],
};
