import { ConnectButton } from "web3uikit"
import Link from "next/link" // Dynamic routing
import { useChain, useMoralis } from "react-moralis"

export default function Header() {
  const { switchNetwork, chainId, chain, account } = useChain()
  const { isWeb3Enabled } = useMoralis()
  return (
    <nav className="p-5 border-b-2 flex flex-row justify-between items-center">
      <h3 className="py-4 px-4 font-bold text-3xl">
        <a href="http://localhost:3000/">
          <img src="/cfc-logo.png" alt="cfclogo" />
        </a>
      </h3>

      {isWeb3Enabled ? (
        <div className="flex flex-row items-center">
          <Link href={`/dashboard`}>
            <a className="mr-4 p-6">Dashboard</a>
          </Link>
          <Link href={`/depositForm`}>
            <a className="mr-4 p-6">CrowdFund</a>
          </Link>
          <Link href={`/createNFTPort`}>
            <a className="mr-4 p-6">Create NFT</a>
          </Link>
          <Link href={`/showNFT`}>
            <a className="mr-4 p-6">view NFT</a>
          </Link>
        </div>
      ) : (
        <div>No Metamask detected .....</div>
      )}
      <div className="ml-auto py-2 px-4">
        <ConnectButton moralisAuth={false} />
        <button className="border-b-2" onClick={() => switchNetwork("0x4")}>
          Switch Network
        </button>
      </div>
    </nav>
  )
}
