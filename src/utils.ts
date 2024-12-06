import { uids } from "./uids.ts";
import fs from "node:fs";

export function isASCII(str: string) {
  return /^[\x00-\x7F]*$/.test(str);
}

export function mapUid(str: string) {
  var uid = uids[str];
  if (uid) {
    return uid;
  }
  return str;
}

export function isStringVr(vr: string) {
  if (
    vr === "AT" ||
    vr === "FL" ||
    vr === "FD" ||
    vr === "OB" ||
    vr === "OF" ||
    vr === "OW" ||
    vr === "SI" ||
    vr === "SQ" ||
    vr === "SS" ||
    vr === "UL" ||
    vr === "US"
  ) {
    return false;
  }
  return true;
}

export function writeJsonArrayToCsv(
  jsonArray: any[],
  outputPath: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (jsonArray.length === 0) {
      reject(new Error("JSON array is empty"));
      return;
    }

    const writeStream = fs.createWriteStream(outputPath);
    const allKeys = new Set<string>();

    // Collect all unique keys
    jsonArray.forEach((obj) => {
      Object.keys(obj).forEach((key) => allKeys.add(key));
    });

    // Write header
    writeStream.write(Array.from(allKeys).join(",") + "\n");

    // Write data
    jsonArray.forEach((obj, index) => {
      const row = Array.from(allKeys)
        .map((key) => {
          const value = obj[key] !== undefined ? obj[key] : "";
          return typeof value === "string" && value.includes(",")
            ? `"${value}"`
            : value;
        })
        .join(",");

      if (index === jsonArray.length - 1) {
        writeStream.write(row);
      } else {
        writeStream.write(row + "\n");
      }
    });

    writeStream.on("finish", () => {
      resolve();
    });

    writeStream.on("error", (error) => {
      reject(error);
    });

    writeStream.end();
  });
}
