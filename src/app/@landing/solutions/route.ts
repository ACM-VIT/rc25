import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";

interface SolutionInput {
  problemId: string;
  code: string;
  explanation: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const solutions: SolutionInput[] = Array.isArray(body) ? body : [body];

    for (const sol of solutions) {
      if (!sol.problemId || !sol.code || !sol.explanation) {
        return NextResponse.json(
          { error: "Invalid input. Each record must include problemId, code, and explanation." },
          { status: 400 }
        );
      }
      const problemExists = await prisma.problem.findUnique({
        where: { id: sol.problemId },
      });
      if (!problemExists) {
        return NextResponse.json(
          { error: `Problem with id ${sol.problemId} not found.` },
          { status: 404 }
        );
      }
    }

    const upsertPromises = solutions.map((sol) =>
      prisma.solution.upsert({
        where: { problemId: sol.problemId },
        update: { code: sol.code, explanation: sol.explanation },
        create: { problemId: sol.problemId, code: sol.code, explanation: sol.explanation },
      })
    );

    const upsertedSolutions = await Promise.all(upsertPromises);

    return NextResponse.json({ success: true, solutions: upsertedSolutions });
  } catch (error) {
    console.error("Error upserting solutions:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
