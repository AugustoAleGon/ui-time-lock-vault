"use client";
import { useState, useRef, useEffect } from 'react'
import abiJson from '../../abi/TimeLockVaultFactory.json'
import type { Abi } from 'viem'
import VaultCreation from '@/components/VaultCreation';
import VaultList from '@/components/VaultList';

const abi = abiJson.abi as Abi;

export default function Home() {

  const [isClient, setIsClient] = useState(false)

  // Refs para mantener clientes viem, solo se establecen en cliente
  const walletClient = useRef<any>(null)
  const publicClient = useRef<any>(null)

  useEffect(() => {
      setIsClient(true)
      // Importación dinámica para evitar SSR
      import('../lib/viem').then(({ walletClient: wc, publicClient: pc }) => {
          walletClient.current = wc
          publicClient.current = pc
        }).catch(() => setIsClient(false))
  }, [])

    // Agregar estado de cuenta
  const [account, setAccount] = useState<string>()


  const [balance, setBalance] = useState<string>('0')

  // Función de obtención de saldo
  async function fetchBalance(address: string) {
      if (!publicClient.current) return
      const balanceWei = await publicClient.current.getBalance({ address })
      const balanceCelo = Number(balanceWei) / 1e18
      setBalance(balanceCelo.toFixed(4))
}

  // Función de conexión de wallet
  async function onConnect() {
      if (!walletClient.current) return
      const addresses = await walletClient.current.requestAddresses()
      setAccount(addresses[0])
      await fetchBalance(addresses[0])
  }

  // Mostrar estado de carga hasta que se complete la hidratación del lado del cliente
  if (!isClient) {
      return (
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
              <div className="max-w-md w-full mx-auto p-6">
                  <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
                      <div className="animate-pulse">
                          <div className="h-12 bg-gray-200 rounded-lg mb-4"></div>
                          <div className="text-center text-gray-500">Cargando...</div>
                      </div>
                  </div>
              </div>
          </div>
      )
  }

return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
                {/* Encabezado */}
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Wallet Web3</h1>
                    <p className="text-gray-600">Conecta tu wallet para comenzar</p>
                </div>
                {/* Estado de conexión */}
            {account ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-sm text-green-800 font-medium">Conectada</p>
                    <p className="text-xs text-green-600 font-mono break-all">{account}</p>
                </div>
            ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <p className="text-sm text-gray-800 font-medium">No conectada</p>
                    <p className="text-xs text-gray-600">Haz clic en el botón de arriba para conectar tu wallet</p>
                </div>
            )}
            {/* Visualización de saldo */}
            {account && balance && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800 font-medium">Saldo de cuenta</p>
                    <p className="text-lg text-blue-900 font-bold">{balance} CELO</p>
                </div>
            )}
            {account ? (
              <>
                <VaultCreation 
                  account={account} 
                  walletClient={walletClient.current} 
                  publicClient={publicClient.current} 
                  balance={balance} 
                />
              </>
            ) : (
              <div className="space-y-3">
                  <button 
                      onClick={onConnect}
                      disabled={!!account}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 font-medium flex items-center justify-center space-x-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <span>{account ? 'Wallet Conectada' : 'Conectar Wallet'}</span>
                  </button>
              </div>
            ) }
          <VaultList 
            account={account} 
            publicClient={publicClient.current} 
            walletClient={walletClient.current}
          />
            </div>
        </div>
    </div>
  )
}