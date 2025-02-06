import { prisma } from "@/utils/prisma";
import FlagClient from "./FlagClient";

async function getFlags() {
    try {
        const flags = await prisma.flags.findMany();
        return flags;
    } finally {
        await prisma.$disconnect();
    }
}

export default async function Page() {
    const flags = await getFlags();
    return <FlagClient flags={flags} />;
}