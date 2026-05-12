import { Id } from "../../convex/_generated/dataModel";

export interface Work {
  id: string;
  _id: Id<"works">;
  title: string;
  client?: string;
  clientId?: string;
  category: string;
  url: string;
  published: boolean;
  phone?: string;
  instagram?: string;
  location?: string;
  isPrivate?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  planId?: string;
  planStatus?: string;
  planExpiry?: string | null;
}

export interface Setting {
  _id: Id<"settings">;
  general?: {
    siteName?: string;
    tagline?: string;
    email?: string;
    whatsapp?: string;
    instagram?: string;
    facebook?: string;
    youtube?: string;
  };
  home?: {
    h1?: string;
    h2?: string;
    cta1?: string;
    cta2?: string;
  };
}