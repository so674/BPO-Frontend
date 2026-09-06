// import { Navigate, Outlet } from "react-router-dom";
// import type { CurrentUser } from "./types";

// interface RoleRouteProps {
//   allowedRoles: CurrentUser["role"][];
//   user: CurrentUser;
// }

// export default function RoleRoute({
//   allowedRoles,
//   user,
// }: RoleRouteProps) {
//   if (!allowedRoles.includes(user.role)) {
//     const home = {
//       HR: "/hr",
//       MANAGER: "/manager",
//       CEO: "/ceo",
//       EMPLOYEE: "/employee",
//     }[user.role];

//     return <Navigate to={home} replace />;
//   }

//   return <Outlet />;
// }

import { Navigate, Outlet } from "react-router-dom";
import type { CurrentUser } from "./types";

interface RoleRouteProps {
  allowedRoles: CurrentUser["role"][];
  user: CurrentUser;
}

export default function RoleRoute({
  allowedRoles,
  user,
}: RoleRouteProps) {
  if (!allowedRoles.includes(user.role)) {
    const homeRoutes: Record<CurrentUser["role"], string> = {
      HR: "/hr",
      MANAGER: "/manager",
      CEO: "/ceo",
      EMPLOYEE: "/employee",
    };

    return (
      <Navigate
        to={homeRoutes[user.role]}
        replace
      />
    );
  }

  return <Outlet />;
}