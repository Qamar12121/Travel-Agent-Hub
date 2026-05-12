import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import packagesRouter from "./packages";
import flightsRouter from "./flights";
import bookingsRouter from "./bookings";
import ticketsRouter from "./tickets";
import ledgerRouter from "./ledger";
import banksRouter from "./banks";
import dashboardRouter from "./dashboard";
import adminRouter from "./admin";
import agentsRouter from "./agents";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(packagesRouter);
router.use(flightsRouter);
router.use(bookingsRouter);
router.use(ticketsRouter);
router.use(ledgerRouter);
router.use(banksRouter);
router.use(dashboardRouter);
router.use(adminRouter);
router.use(agentsRouter);

export default router;
