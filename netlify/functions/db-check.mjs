import { neon } from "@neondatabase/serverless";

export default async () => {
  try {
    const sql = neon(process.env.DATABASE_URL);
    const result = await sql`SELECT 1 AS connected`;

    return Response.json({
      success: true,
      database: result[0].connected === 1
        ? "connected"
        : "unknown",
    });
  } catch (error) {
    console.error("Database connection failed");

    return Response.json(
      { success: false, error: "Database connection failed" },
      { status: 500 }
    );
  }
};
