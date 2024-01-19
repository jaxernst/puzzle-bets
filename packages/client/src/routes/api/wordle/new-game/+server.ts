/**
 * Create a new game entry for a userAddress + gameId, or just   a userAddress
 */

/** @type {import('./$types').RequestHandler} */
export const POST = async ({ request }) => {
  const params = request.body;
  console.log(params?.gameId);
  console.log(params?.user);
  console.log("yo");

  return new Response("good");
};
