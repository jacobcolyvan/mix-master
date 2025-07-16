import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import prettierConfig from "eslint-config-prettier";
import pluginReact from "eslint-plugin-react";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import tseslint from "typescript-eslint";

export default defineConfig([
    js.configs.recommended,
    ...tseslint.configs.recommended,
    pluginReact.configs.flat.recommended,
    // Prettier compatibility
    prettierConfig,

    // React web project configuration
    {
        settings: {
            react: { version: "detect" },
        },
        plugins: {
            "simple-import-sort": simpleImportSort,
        },
        rules: {
            "react/react-in-jsx-scope": "off", // Not needed with React 17+
            "@typescript-eslint/no-explicit-any": "off",
            // Turn off unused vars rule for _
            "@typescript-eslint/no-unused-vars": [
                "error",
                {
                    argsIgnorePattern: "^_",
                    varsIgnorePattern: "^_",
                },
            ],
            "no-var": "error",
            eqeqeq: ["error", "always"], // Require === instead of ==
            "no-unreachable": "error",
            "simple-import-sort/imports": "error",
            "simple-import-sort/exports": "error",
        },
    },
    // Ignore build artifacts and config files
    {
        ignores: ["node_modules/", "build/", "dist/", "*.config.js", "*.config.mjs", "public/"],
    },
]);
