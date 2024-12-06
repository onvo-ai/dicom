
import { parseDicom } from "./parser.ts";
import { writeJsonArrayToCsv } from "./utils.ts";
import unzipper from "npm:unzipper";
import { walk } from "https://deno.land/std/fs/mod.ts";
import { resolve } from "https://deno.land/std/path/mod.ts";
import { Buffer } from "node:buffer";

async function extractZip(zipFile: string, csvFile: string) {
  const directory = await unzipper.Open.file(zipFile);

  let array: any[] = [];
  for (const file of directory.files) {
    if (
      file.path.endsWith(".dcm") &&
      !file.path.includes("__MACOSX") &&
      file.type === "File"
    ) {
      const content = await file.buffer();
      array.push(await parseDicom(content));
    }
  }

  await writeJsonArrayToCsv(array, csvFile);
}

async function extractDir(directory: string, csvFile: string) {
  let array: any[] = [];
  const resolvedDir = resolve(directory)
  for await (const entry of walk(resolvedDir)) {
    if (entry.isFile && entry.path.endsWith(".dcm") && !entry.path.includes("__MACOSX")) {
      const content = await Deno.readFile(entry.path);
      array.push(await parseDicom(Buffer.from(content)));
    }
  }

  await writeJsonArrayToCsv(array, csvFile);
}

function showHelp() {
  console.log(`
Usage: ./main.ts <input> <output>

Arguments:
  <input>   Path to a ZIP file or a directory containing DICOM files.
  <output>  Path to the output CSV file.

Options:
  --help    Show this help message.

Examples:
  # Process a ZIP file
  ./main.ts data.zip output.csv

  # Process a directory
  ./main.ts /path/to/directory output.csv
  `);
}

if (import.meta.main) {
  const args = Deno.args;

  if (args.length === 0 || args.includes("--help") || args.length < 2) {
    showHelp();
    Deno.exit(0);
  }

  const input = args[0];
  const output = args[1];

  if (!output.endsWith(".csv")) {
    console.error("Error: Output file must have a .csv extension.");
    Deno.exit(1);
  }

  try {
    const stat = await Deno.stat(input);
    if (stat.isFile && input.endsWith(".zip")) {
      console.log("Processing ZIP file...");
      await extractZip(input, output);
    } else if (stat.isDirectory) {
      console.log("Processing directory...");
      await extractDir(input, output);
    } else {
      console.error("Error: Input must be a valid ZIP file or directory.");
      Deno.exit(1);
    }

    console.log(`Successfully wrote to ${output}`);
  } catch (err: any) {
    console.error("Error:", err.message);
    Deno.exit(1);
  }
}
