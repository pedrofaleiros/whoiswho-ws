import { Router } from "express";
import prismaClient from "./utils/prismaClient";

const router = Router();

router.get("/", (req, res) => {
    res.json({ status: "Ok" })
})

router.get("/rooms", async (req, res) => {
    const rooms = await prismaClient.room.findMany()
    res.json({ rooms: rooms })
})

export { router };