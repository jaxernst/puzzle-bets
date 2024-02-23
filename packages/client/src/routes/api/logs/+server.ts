import { PUBLIC_CHAIN_ID } from "$env/static/public";
import { indexerClient, supabase } from "$lib/server/supabaseClient.js";
import { decodeDynamicField } from "@latticexyz/protocol-parser";

const fallbackHex = (str?: string) => {
  return (str ?? "0x").replace("\\x", "0x") as `0x${string}`;
};

export const GET = async ({ request }) => {
  if (PUBLIC_CHAIN_ID !== "4242") {
    return new Response("Not on public chain", { status: 400 });
  }

  const { data: indexBlockNumber, error: metadataError } = await indexerClient
    .from("config")
    .select("block_number")
    .single();

  const { data, error } = await indexerClient
    .from("records")
    .select(
      "address, table_id, key_bytes, static_data, encoded_lengths, dynamic_data, block_number, log_index"
    );

  if (error || metadataError) {
    return new Response("Error fetching records", { status: 500 });
  }

  const logRecords = data.map(
    (row) =>
      ({
        address: fallbackHex(row.address),
        eventName: "Store_SetRecord",
        args: {
          tableId: fallbackHex(row.table_id),
          keyTuple: decodeDynamicField("bytes32[]", fallbackHex(row.key_bytes)),
          staticData: fallbackHex(row.static_data),
          encodedLengths: fallbackHex(row.encoded_lengths),
          dynamicData: fallbackHex(row.dynamic_data),
        },
      } as const)
  );

  return new Response(
    JSON.stringify({
      blockNumber: indexBlockNumber.block_number.toString(),
      logs: logRecords,
    }),
    { status: 200 }
  );
};
