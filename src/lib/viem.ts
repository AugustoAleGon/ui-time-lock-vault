declare global {
  interface Window {
    ethereum?: unknown;
  }
}

import { createPublicClient, createWalletClient, custom } from 'viem'
import { celoAlfajores } from 'viem/chains'

function getTransport() {
  if (typeof window === 'undefined') {
    throw new Error('No window.ethereum: debe ejecutarse en navegador');
  }
  if (!window.ethereum) {
    throw new Error('No wallet inyectada encontrada');
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return custom(window.ethereum as any);
}

export const publicClient = createPublicClient({
  chain: celoAlfajores,
  transport: getTransport(),
})

export const walletClient = createWalletClient({
  chain: celoAlfajores,
  transport: getTransport(),
})