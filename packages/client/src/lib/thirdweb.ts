import { createThirdwebClient, defineChain } from "thirdweb"
import { PUBLIC_THIRDWEB_CLIENT_ID } from "$env/static/public"
import { createWallet, type Account as TwAccount } from "thirdweb/wallets"
import { viemAdapter } from "thirdweb/adapters/viem"
import { recoverAddress, recoverMessageAddress, type Chain } from "viem"
import type { Wallet } from "$lib/mud/setupNetwork"
import { createAuth, signLoginPayload } from "thirdweb/auth"
import { getBurnerPrivateKey } from "@latticexyz/common"
import { privateKeyToAccount } from "viem/accounts"

export const tw = createThirdwebClient({
  clientId: PUBLIC_THIRDWEB_CLIENT_ID,
})

export const twAuth = createAuth({
  domain: "localhost:5173",
  client: tw,
})

export const twWallet = createWallet("embedded")

export async function connect(
  chain: Chain,
  authMethod: "auto" | "google" | "apple" | "email",
  payload?: { email: string; verificationCode: string },
) {
  let account: TwAccount
  if (authMethod === "auto") {
    account = await twWallet.autoConnect({ client: tw })
  } else if (authMethod !== "email") {
    account = await twWallet.connect({
      client: tw,
      strategy: authMethod,
    })
  } else {
    if (!payload) throw new Error("Payload required for email auth")

    account = await twWallet.connect({
      client: tw,
      strategy: "email",
      email: payload.email,
      verificationCode: payload.verificationCode,
    })
  }

  const twWalletAccount = account

  const walletClient = viemAdapter.walletClient.toViem({
    client: tw,
    account,
    chain: defineChain(chain as any),
  }) as Wallet

  const message = "Hello"
  const twAccountSigned = await twWalletAccount.signMessage({ message })
  const twViemClientSigned = await walletClient.signMessage({ message })

  console.log("TW wallet account address", twWalletAccount.address)

  console.log(
    "TW wallet account signature recovery ",
    await recoverMessageAddress({ message, signature: twAccountSigned }),
  )

  console.log(
    "TW viem client adapter signed",
    await recoverMessageAddress({ message, signature: twViemClientSigned }),
  )

  return walletClient
}

export async function disconnect() {
  await twWallet.disconnect()
}
