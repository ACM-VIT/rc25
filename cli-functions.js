import * as readline from "node:readline/promises";
import { PrismaClient } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import fs from "node:fs/promises";

const prisma = new PrismaClient();
const adminTeamId = process.env.ADMIN_TEAM_ID;
const CSV_FILE_PATH = "./whitelist_test.csv";

if (!adminTeamId) {
    throw new Error("Set ADMIN_TEAM_ID in .env");
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

async function createRound({ start, end, result }) {
    try {
        const round = await prisma.$transaction(async (prisma) => {
            const createdRound = await prisma.round.create({
                data: { start, end, result, number: 999 },
            });

            await prisma.teamRound.create({
                data: {
                    teamId: adminTeamId,
                    roundId: createdRound.id,
                },
            });

            const rounds = await prisma.round.findMany({
                relationLoadStrategy: 'join',
                select: {
                    id: true,
                    start: true,
                },
                orderBy: {
                    start: 'asc',
                },
            });

            const updatePromises = rounds.map((r, index) => {
                if (r.id === createdRound.id) {
                    createdRound.number = index + 1;
                }
                return prisma.round.update({
                    where: { id: r.id },
                    data: { number: index + 1 }, // Set the round number in sequence starting from 1
                });
            });

            // Wrap the updates in a transaction to ensure atomicity
            await Promise.all(updatePromises);


            return createdRound;
        });

        console.log(`Round #${round.number} inserted successfully with admin team round.`);
    } catch (e) {
        console.error("Error creating round:", e);
    }
}

async function deleteRound(roundId) {
    try {
        await prisma.$transaction(async (prisma) => {
            await prisma.teamRound.deleteMany({ where: { roundId } });
            await prisma.round.delete({ where: { number: roundId } });
        });

        const rounds = await prisma.round.findMany({
            relationLoadStrategy: 'join',
            select: {
                id: true,
                start: true,
            },
            orderBy: {
                start: 'asc',
            },
        });

        const updatePromises = rounds.map((round, index) => {
            return prisma.round.update({
                where: { id: round.id },
                data: { number: index + 1 }, // Set the round number in sequence starting from 1
            });
        });

        // Wrap the updates in a transaction to ensure atomicity
        await prisma.$transaction(updatePromises);

        console.log(`Round #${roundId} and associated team rounds deleted successfully.`);
    } catch (e) {
        console.error("Error deleting round:", e);
    }
}

async function createAdmin({ email }) {
    if (!email) {
        throw new Error("Provide an email as a CLI argument.");
    }

    try {
        await prisma.$transaction([
            prisma.admin.create({
                data: {
                    user: { connect: { email } },
                },
            }),
            prisma.user.update({
                where: { email },
                data: {
                    Team: { connect: { id: adminTeamId } },
                },
            }),
        ]);
        console.log(`Admin with email ${email} successfully created.`);
    } catch (e) {
        if (e instanceof PrismaClientKnownRequestError) {
            if (e.code === "P2002") {
                return console.error("Admin already exists.");
            }
            if (e.code === "P2025") {
                return console.error("User not found.");
            }
        }
        console.error("An unexpected error occurred:", e);
    }
}

async function deleteAdmin({ email }) {
    if (!email) {
        throw new Error("Provide an email as a CLI argument.");
    }

    try {
        const admin = await prisma.admin.findFirstOrThrow({
            relationLoadStrategy: 'join',
            where: { user: { email } },
        });

        if (!admin) {
            return console.error("Admin not found.");
        }

        await prisma.$transaction([
            prisma.admin.delete({ where: { id: admin.id } }),
            prisma.user.update({
                where: { email },
                data: { Team: { disconnect: true } },
            }),
        ]);
        console.log(`Admin with email ${email} successfully deleted.`);
    } catch (e) {
        console.error("An error occurred:", e);
    }
}

async function whitelist() {
    try {
        const data = await fs.readFile(CSV_FILE_PATH, "utf-8");
        const lines = data.split("\n").filter((line) => line.trim() !== "");
        const rows = lines.slice(1);

        await prisma.$transaction(async (tx) => {
            for (const line of rows) {
                const fields = line.split(",").map((f) => f.trim());
                
                const regNo = fields[1];
                const name = fields[2];
                const phone = fields[5];
                const email = fields[6];

                if (!regNo || !name || !phone || !email) {
                    console.error(`Skipping invalid row: ${line}`);
                    continue;
                }

                try {
                    await tx.uniReg.upsert({
                        where: { email },
                        update: { regNo, name, phone },
                        create: { regNo, name, phone, email }
                    });
                    console.log(`Processed: ${email}`);
                } catch (err) {
                    console.error(`Error processing row: ${line}`, err);
                }
            }
        });

        console.log("Whitelist data processed successfully.");
    } catch (e) {
        console.error("Error processing whitelist data:", e);
    }
}

// MODIFY main() to include option 5 for whitelist
async function main() {
    const args = process.argv.slice(2);
    const action = args[0];
    const email = args[1];

    if (!action) {
        console.log("No action specified. Choose an option:");
        console.log("1. Add Round");
        console.log("2. Delete Round");
        console.log("3. Add Admin");
        console.log("4. Delete Admin");
        console.log("5. Whitelist");

        const choice = await rl.question("Enter your choice (1-5): ");

        if (choice === "1") {
            const start = new Date();
            const end = new Date();
            const result = new Date();

            await createRound({ start, end, result });
        } else if (choice === "2") {
            const roundId = Number.parseInt(await rl.question("Enter round ID to delete: "), 10);

            if (Number.isNaN(roundId)) {
                console.error("Invalid round ID.");
                return;
            }

            await deleteRound(roundId);
        } else if (choice === "3") {
            const emailInput = await rl.question("Enter email: ");
            await Promise.all(emailInput.split(',').map(i=>createAdmin({ email: i.trim() })));
        } else if (choice === "4") {
            const emailInput = await rl.question("Enter email: ");
            await deleteAdmin({ email: emailInput });
        } else if (choice === "5") {
            await whitelist();
        } else if (choice === "6") {
            console.log("Invalid choice.");
        }
    } else if (action === "round_add") {
        const start = new Date();
        const end = new Date();
        const result = new Date();

        await createRound({ start, end, result });
    } else if (action === "round_delete") {
        const roundId = Number.parseInt(await rl.question("Enter round ID to delete: "), 10);

        if (Number.isNaN(roundId)) {
            console.error("Invalid round ID.");
            return;
        }
        await deleteRound(roundId);
    } else if (action === "admin_add" && email) {
        await Promise.all(email.split(',').map(i=>createAdmin({ email: i.trim() })));
    } else if (action === "admin_delete" && email) {
        await deleteAdmin({ email });
    } else if (action === "whitelist") {
        await whitelist();
    } else {
        console.error(
            "Invalid command. Use:\n  ROUND \"round_add\" - to add a round\n  \"round_delete\" - to delete a round\n  \"admin_add\" <email> - to add admin\n  \"admin_delete\" <email> - to delete admin\n  \"whitelist\" - to process whitelist CSV"
        );
    }
}

main()
    .then(() => {
        prisma.$disconnect();
        rl.close();
    })
    .catch((e) => {
        console.error("An error occurred during execution:", e);
        prisma.$disconnect();
        rl.close();
    });
