/// <reference types="vite/client" />
/// <reference types="react-dom" />

interface ImportMetaEnv {
  readonly VITE_ADMIN_EMAIL: string;
  readonly VITE_ADMIN_PASSWORD_HASH: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}