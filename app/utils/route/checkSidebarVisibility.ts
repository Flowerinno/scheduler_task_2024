import { ROUTES } from "~/constants/routes";

const routesWithoutSidebar = [ROUTES.login, ROUTES.logout, ROUTES.register];

export const checkSidebarVisibility = (path: ROUTES) => {
	return !routesWithoutSidebar.includes(path);
};
