import fs from "fs/promises";

async function debug() {
  const content = await fs.readFile("2025-11-10/ai-programming.md", "utf-8");

  console.log("=== File Info ===");
  console.log("Length:", content.length);
  console.log("First 300 chars:", content.substring(0, 300));
  console.log();

  console.log("=== Title Extraction ===");
  const titleMatch = content.match(/^#\s+\S+\s+(.+?)$/m);
  console.log("Match result:", titleMatch);
  console.log("Title:", titleMatch ? titleMatch[1].trim() : "NO MATCH");
  console.log();

  console.log("=== Validation ===");
  const title = titleMatch ? titleMatch[1].trim() : "未命名资讯";
  console.log("Final title:", title);
  console.log("Content length > 100:", content.trim().length > 100);
  console.log("Has title:", !!title);
  console.log("Not unnamed:", title !== "未命名资讯");
  console.log(
    "Should pass filter:",
    content.trim().length > 100 && title && title !== "未命名资讯"
  );
}

debug().catch(console.error);
