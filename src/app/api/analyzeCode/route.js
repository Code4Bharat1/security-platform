import { exec } from 'child_process';
import { writeFile, unlink } from 'fs/promises';
import path from 'path';
import { nanoid } from 'nanoid';

export async function POST(req) {
  try {
    const { code } = await req.json();

    if (!code || typeof code !== 'string') {
      return new Response("Invalid code submitted", { status: 400 });
    }

    const fileName = `user-code-${nanoid(6)}.test.js`;
    const filePath = path.join(process.cwd(), fileName);

    // 🧪 Wrap user code with a sample Jest test
    const wrappedCode = `
      ${code}

      // You must define a function called "add" for this test
      test('add(2, 3) should return 5', () => {
        expect(add(2, 3)).toBe(5);
      });
    `;

    await writeFile(filePath, wrappedCode);

    const command = `npx jest ${fileName} --json --silent --testTimeout=3000`;

    const result = await new Promise((resolve) => {
      exec(command, { cwd: process.cwd(), timeout: 5000, maxBuffer: 1024 * 500 }, async (err, stdout, stderr) => {
        await unlink(filePath); // Clean up file

        if (err) {
          return resolve({
            message: 'Jest failed',
            error: stderr || err.message,
            passed: 0,
            failed: 1
          });
        }

        try {
          const parsed = JSON.parse(stdout);
          const testResults = parsed.testResults[0]?.assertionResults || [];

          const passed = testResults.filter(t => t.status === 'passed').length;
          const failed = testResults.filter(t => t.status === 'failed').length;

          resolve({
            message: 'Jest ran successfully',
            passed,
            failed,
            results: testResults.map(t => `${t.title}: ${t.status}`)
          });
        } catch (e) {
          resolve({
            message: 'Failed to parse Jest output',
            error: e.message
          });
        }
      });
    });

    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.error("Jest API Error:", err);
    return new Response("Server error during code analysis: " + err.message, { status: 500 });
  }
}
