
import jwt from "jsonwebtoken";

export async function POST(request) {
  try {
    const { token, secret } = await request.json();

    if (!token || !secret) {
      return new Response(JSON.stringify({ error: "Token and secret are required" }), {
        status: 400,
      });
    }

    const decoded = jwt.verify(token, secret);
    return new Response(
      JSON.stringify({ valid: true, decoded }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ valid: false, error: error.message }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
}
