import express, { Request, Response } from "express";
import { currentUser, requireAuth } from "@nkticketing/common";

const router = express.Router();

router.get(
  "/api/user/currentUser",
  currentUser,
  // requireAuth,
  (req: Request, res: Response) => {
    res.send({ currentUser: req.currentUser || null });
  }
);

export { router as currentUserRouter };
