import { createHash } from "node:crypto";
import {
  copyFileSync,
  cpSync,
  existsSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, join, relative, resolve, sep } from "node:path";
import { spawnSync } from "node:child_process";

const repoRoot = resolve(new URL("..", import.meta.url).pathname);
const flowrRoot = resolve(repoRoot, "../flowr");
const flowrPackageDir = join(flowrRoot, "dist/sdk-packages");
const packageOutputDir = join(repoRoot, "vendor/flowr/sdk-packages");
const runtimeOutputDir = join(
  repoRoot,
  "public/vendor/flowr/sdk-recorder-local",
);
const hydrateFromVendor = process.argv.includes("--from-vendor");
const sourcePackageDir = hydrateFromVendor ? packageOutputDir : flowrPackageDir;

const recorderLocalPackage = {
  packageName: "@flowr/sdk-recorder-local",
  filePattern: /^flowr-sdk-recorder-local-.*\.tgz$/,
};

const bundledSourcePackages = [
  {
    packageName: "@flowr/sdk-core",
    filePattern: /^flowr-sdk-core-.*\.tgz$/,
    packArgs: [
      "pack",
      "--workspace",
      "@flowr/sdk-core",
      "--pack-destination",
      flowrPackageDir,
    ],
  },
  {
    packageName: "@flowr/sdk-ui",
    filePattern: /^flowr-sdk-ui-.*\.tgz$/,
    packArgs: [
      "pack",
      "--workspace",
      "@flowr/sdk-ui",
      "--pack-destination",
      flowrPackageDir,
    ],
  },
  {
    packageName: "@flowr/sdk-recorder-kernel",
    filePattern: /^flowr-sdk-recorder-kernel-.*\.tgz$/,
    packArgs: [
      "pack",
      "--workspace",
      "@flowr/sdk-recorder-kernel",
      "--pack-destination",
      flowrPackageDir,
    ],
  },
];

function run(command, args, cwd) {
  const result = spawnSync(command, args, {
    cwd,
    stdio: "inherit",
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(
      `${command} ${args.join(" ")} exited with status ${result.status}`,
    );
  }
}

function repoRelative(path) {
  return relative(repoRoot, path).split(sep).join("/");
}

function sha256(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function findLatestPackage({ packageName, filePattern }, directory) {
  if (!existsSync(directory)) {
    throw new Error(`Missing SDK package directory: ${directory}`);
  }

  const packages = readdirSync(directory)
    .filter((name) => filePattern.test(name))
    .map((name) => {
      const path = join(directory, name);
      return { name, path, mtimeMs: statSync(path).mtimeMs };
    })
    .sort((left, right) => right.mtimeMs - left.mtimeMs);

  const latest = packages[0];
  if (!latest) {
    throw new Error(
      `No ${packageName} package found in ${directory}. Run npm run sync:sdk:local to refresh local SDK packages.`,
    );
  }

  return latest.path;
}

function describePackage(packagePath, packageName) {
  return {
    packageName,
    sourcePackage: basename(packagePath),
    sourcePackageSha256: sha256(packagePath),
    vendoredPackage: repoRelative(packagePath),
  };
}

function copyPackage(packagePath, packageName) {
  const outputPath = join(packageOutputDir, basename(packagePath));
  copyFileSync(packagePath, outputPath);
  return describePackage(outputPath, packageName);
}

function runTar(packagePath, tempDir) {
  const result = spawnSync("tar", ["-xzf", packagePath, "-C", tempDir], {
    stdio: "inherit",
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(`tar exited with status ${result.status}`);
  }
}

await mkdir(packageOutputDir, { recursive: true });
await mkdir(runtimeOutputDir, { recursive: true });

if (hydrateFromVendor) {
  console.log("Hydrating @flowr/sdk-recorder-local from vendor packages");
} else {
  await mkdir(flowrPackageDir, { recursive: true });

  console.log("Packaging @flowr/sdk-recorder-local from ../flowr");
  run("npm", ["run", "package:sdk:recorder-local"], flowrRoot);

  for (const sourcePackage of bundledSourcePackages) {
    console.log(`Packing ${sourcePackage.packageName} from ../flowr`);
    run("npm", sourcePackage.packArgs, flowrRoot);
  }
}

const packagePath = findLatestPackage(recorderLocalPackage, sourcePackageDir);
const vendoredRuntimePackage = hydrateFromVendor
  ? describePackage(packagePath, recorderLocalPackage.packageName)
  : copyPackage(packagePath, recorderLocalPackage.packageName);
const vendoredBundledSourcePackages = bundledSourcePackages.map(
  (sourcePackage) => {
    const sourcePackagePath = findLatestPackage(
      sourcePackage,
      sourcePackageDir,
    );
    return hydrateFromVendor
      ? describePackage(sourcePackagePath, sourcePackage.packageName)
      : copyPackage(sourcePackagePath, sourcePackage.packageName);
  },
);
const tempDir = mkdtempSync(join(tmpdir(), "flowr-sdk-local-"));

try {
  runTar(packagePath, tempDir);

  const extractedRoot = join(tempDir, "package");
  const sourceDist = join(extractedRoot, "dist");
  const sourceIndex = join(extractedRoot, "dist/index.js");
  const sourcePackageJson = join(extractedRoot, "package.json");

  if (!existsSync(sourceIndex)) {
    throw new Error(`Package did not contain ${sourceIndex}`);
  }

  const browserEntrySha256 = sha256(sourceIndex);
  rmSync(runtimeOutputDir, { recursive: true, force: true });
  await mkdir(runtimeOutputDir, { recursive: true });
  cpSync(sourceDist, runtimeOutputDir, { recursive: true });

  const packageJson = existsSync(sourcePackageJson)
    ? JSON.parse(readFileSync(sourcePackageJson, "utf8"))
    : {};

  writeFileSync(
    join(runtimeOutputDir, "metadata.json"),
    `${JSON.stringify(
      {
        packageName: packageJson.name ?? "@flowr/sdk-recorder-local",
        version: packageJson.version ?? null,
        sourcePackage: vendoredRuntimePackage.sourcePackage,
        sourcePackageSha256: vendoredRuntimePackage.sourcePackageSha256,
        vendoredPackage: vendoredRuntimePackage.vendoredPackage,
        bundledSourcePackages: vendoredBundledSourcePackages,
        browserEntrySha256,
        syncedAt: new Date().toISOString(),
      },
      null,
      2,
    )}\n`,
  );

  if (!hydrateFromVendor) {
    console.log(`Copied packages to ${packageOutputDir}`);
  }
  console.log(`Synced ${basename(packagePath)} to ${runtimeOutputDir}`);
} finally {
  rmSync(tempDir, { recursive: true, force: true });
}
