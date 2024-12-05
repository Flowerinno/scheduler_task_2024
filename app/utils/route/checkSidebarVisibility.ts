import { ROUTES } from "~/constants/routes";

const routesWithoutSidebar = [ROUTES.login, ROUTES.register];

export const checkSidebarVisibility = (path: ROUTES) => {
	return !routesWithoutSidebar.includes(path);
};
