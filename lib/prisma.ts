import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.POSTGRESQL_POSTGRES_URL })
});

export { prisma };