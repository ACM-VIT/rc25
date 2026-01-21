import { db } from "@/db";
import { flags } from "@/db/schema";
import FlagClient from "./FlagClient";

async function getFlags() {
    try {
        return await db.select().from(flags);
    } catch (error) {
        console.error("Error fetching flags:", error);
        return [];
    }
}

export default async function Page() {
    const flags = await getFlags();
    return <FlagClient flags={flags} />;
}
