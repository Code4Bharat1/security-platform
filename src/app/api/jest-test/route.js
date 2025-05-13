import { exec } from "child_process";

export async function POST(req) {
  const { code } = await req.json();

  return new Promise((resolve) => {
    exec("npm test --coverage", (error, stdout) => {
      if (error) return resolve(Response.json({ error: error.message }, { status: 500 }));
      resolve(Response.json({ report: stdout }));
    });
  });
}
