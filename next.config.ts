import type { NextConfig } from "next";
import path from "node:path";
const config:NextConfig={output:"export",trailingSlash:true,images:{unoptimized:true},outputFileTracingRoot:path.resolve(".")};
export default config;
