import { createClient } from "@supabase/supabase-js";
import { PUBLIC_SUPA_API_URL } from "$env/static/public";
import { PRIVATE_SUPA_SERVICE_KEY } from "$env/static/private";

export const supabase = createClient(
  PUBLIC_SUPA_API_URL,
  PRIVATE_SUPA_SERVICE_KEY,
);

export const indexerClient = createClient(
  PUBLIC_SUPA_API_URL,
  PRIVATE_SUPA_SERVICE_KEY,
  {
    db: {
      schema: "mud",
    },
  },
);
