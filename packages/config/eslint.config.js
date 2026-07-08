/**
 * Base ESLint flat config shared across the monorepo.
 * Consumers spread `baseConfig` and append their own (e.g. Next.js) rules.
 */
export const baseConfig = [
  {
    ignores: ["**/dist/**", "**/.next/**", "**/.turbo/**", "**/node_modules/**"],
  },
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      "no-unused-vars": "off",
    },
  },
  // Clean Architecture boundary: domain layer must stay framework/IO free.
  {
    files: ["**/features/*/domain/**/*.{ts,tsx}", "**/packages/domain/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            { group: ["**/repository/**"], message: "domain/ cannot import repository/ (Clean Architecture boundary)." },
            { group: ["**/app/**"], message: "domain/ cannot import from app/ (Clean Architecture boundary)." },
            { group: ["**/hooks/**"], message: "domain/ cannot import hooks/ (Clean Architecture boundary)." },
            { group: ["react", "next", "next/*", "@supabase/*"], message: "domain/ must stay framework/IO free." },
          ],
        },
      ],
    },
  },
];

export default baseConfig;
