import { Boxes, ChevronDown, Copy} from 'lucide-react'
import { useEffect, useState , useRef} from 'react'
import { Input } from './components/ui/input'
import { Button } from './components/ui/button'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import {generateMnemonic , mnemonicToSeed , mnemonicToSeedSync} from "bip39"
import { derivePath } from 'ed25519-hd-key'
import nacl from 'tweetnacl'
import { Keypair, PublicKey } from '@solana/web3.js'
import { ethers, HDNodeWallet } from 'ethers'
import { Wallet } from 'ethers'
import type { Wallets } from './types'
import WalletContainer from './components/wallets'
import * as bip39 from 'bip39';
import { Toaster } from './components/ui/sonner'
import { toast } from "sonner"
import bs58 from 'bs58' 

function App() {

  const [ currentIndex , setCurrentIndex ] = useState<number>(1)

  const [ showPrivateKey , setShowPrivateKey ] = useState<boolean>(false)

  const [ existingMn , setExistingMn ] = useState<string>()
  
  const [ blockChain , setBlockChain ] = useState<undefined | "sol" | "eth">()
  
  const [ wallets , setWallets ] = useState<Wallets[]>([])
  
  const [ dropDown , setDropdown ] = useState<boolean>(false)
  
  const mnemonicDiv = useRef<HTMLDivElement | null>(null) 
  const secretPhraseDiv = useRef<HTMLDivElement | null>(null)
  
  const [mnemonic , setMnemonic] = useState<string[]>()

  const [isLoading, setIsLoading] = useState<boolean>(true)


  useEffect(() => {

    const mn = localStorage.getItem("mnemonic")
    const bc = localStorage.getItem("blockChain")
    const userWallets = localStorage.getItem("wallets")

    if(mn)setMnemonic(() => mn.split(" "))

    if(bc && bc === "sol" || bc === "eth")setBlockChain(() => bc)

    if(userWallets != null){

      try{
        
        const parsedWallet : Wallets[] = JSON.parse(userWallets)
        setWallets(() => parsedWallet)

      }
      catch(e){
        toast("Unable to parse wallets")
      }

    }

    setIsLoading(false)


  } , [])

  useEffect(() => {
    if(!isLoading)localStorage.setItem("wallets" , JSON.stringify(wallets))
  } , [wallets , isLoading])
  
  const {contextSafe} = useGSAP(() => {

    gsap.from( secretPhraseDiv.current , {
      opacity : 0,
      duration : 1,
      y : 75
    })

    if( mnemonic && mnemonic.length > 0){
      gsap.from( mnemonicDiv.current , {
        opacity : 0, 
        duration : 1,
        y : 75
      })
    }
  } , [mnemonic])

  const handleGeneration = () => {
    const mnemonic = generateMnemonic()
    localStorage.setItem("mnemonic" , mnemonic)
    setMnemonic(mnemonic.split(" "))
    toast("Generated a recovery phrase for your wallets")
  }

  const handleSolWallet = async () => {

    if(!mnemonic)return

    if(!blockChain){

      setBlockChain(() => "sol")
      localStorage.setItem("blockChain" , "sol")
    }

    const seed = await mnemonicToSeed(mnemonic.join(" "))
    const path = `m/44'/501'/${currentIndex}'/0'`
    const derivedSeed = derivePath(path , seed.toString("hex")).key
    const secret = nacl.sign.keyPair.fromSeed(derivedSeed).secretKey
    const keyPair = Keypair.fromSecretKey(secret)

    setWallets( () => [...wallets , {
      mnemonic : mnemonic.join(" "),
      path,
      privateKey : bs58.encode(keyPair.secretKey),
      publicKey : keyPair.publicKey.toBase58(),
      index : currentIndex
    }])
    setCurrentIndex(() => currentIndex + 1)

    
    toast("Wallet created")

  }

  const removeWallet = (wallet : Wallets) => {

    if(wallets.length - 1  == 0){
      setCurrentIndex(1)
    }

    setWallets(() => wallets.filter(item => item != wallet))

    toast("Wallet deleted")

  }

  const handleEthWallet = async () => {

    if(!mnemonic)return
    
    if(!blockChain){

      setBlockChain(() => "eth")
      localStorage.setItem("blockChain" , "eth")
    }

    const seed = await mnemonicToSeed(mnemonic.join(" "))
    const path = `m/44'/60'/${currentIndex}'/0'`
    const hdNode = HDNodeWallet.fromSeed(seed)
    const child = hdNode.derivePath(path)
    const privateKey = child.privateKey
    const wallet = new Wallet(privateKey)

    setCurrentIndex(() => currentIndex + 1)

    setWallets(() => [...wallets , {
      mnemonic : mnemonic.join(" "),
      path,
      privateKey : wallet.privateKey,
      publicKey : wallet.address,
      index : currentIndex
    }])
  
    toast("Wallet created")

  }

  const handleExistingWallets = () => {

    if(!existingMn)return

    if( existingMn && bip39.validateMnemonic(existingMn) ){

      setMnemonic(() => existingMn.split(" "))      
      localStorage.setItem("mnemonic" , existingMn)
      
      
    }
    else{
      toast("Invalid Phrase")
    }
    
  }

  return (
    <> 
    <Toaster theme='system'/>
    <nav className='mx-auto p-4 max-w-7xl py-8 text-white '> 
      <div className='flex items-center gap-2'> 
        <Boxes className='size-9' /> 
        <h1 className='text-3xl font-mono font-semibold select-none'> 
          MARSYN 
        </h1> 
      </div> 
    </nav> 
    <main className='mx-auto p-4 max-w-7xl flex flex-col gap-4 pb-11' ref={mnemonicDiv}> 
      { mnemonic && mnemonic.length > 0 ? <div className='flex flex-col gap-4'>
          <div className='border py-7 px-5 rounded-2xl border-muted-foreground space-x-7'>
            <div className='flex items-center justify-between'>
              <h1 className='font-semibold text-2xl sm:text-3xl md:text-4xl font-manrope text-white select-none '>
                Your Secret Phrase
              </h1>
              <Button variant={"secondary"}  onClick={() => setDropdown(!dropDown)}>
                <ChevronDown className={` ${dropDown ? "rotate-180 duration-400"  : "duration-400" } `} />
              </Button>
            </div>
            <div className={`${ !dropDown ? "hidden duration-400" : ""} `}>
              <div className={`grid grid-cols-4 py-4 gap-4`}>
              {mnemonic.map(( mn , index ) => <p key={index} className='bg-neutral-900 select-none text-white text-lg p-4 rounded-lg '>
                {mn}
                </p>  )} 
              </div>
              <div className='flex items-center gap-3'>
                <Button onClick={() => navigator.clipboard.writeText(mnemonic.join(" "))} variant={"secondary"}>
                    <Copy/>
                </Button>
                <p className='text-lg text-neutral-500'>
                      Click Here To Copy
                </p>
              </div>
            </div>
        </div>
        <div>
          {blockChain ? <div className='flex flex-col gap-4'>
              <div className='flex justify-between items-center'>
                <h1 className='font-manrope font-semibold text-2xl sm:text-3xl md:text-4xl text-white select-none'>
                  {blockChain === "sol" ? "Solana" : "Ethereum"} Wallet
                </h1>
                <div className='flex gap-4'>
                  <Button className='select-none' onClick={() => blockChain === "sol" ? handleSolWallet() : handleEthWallet()} variant={"secondary"} size={"lg"} >Add Wallet</Button>
                  <Button className='select-none' variant={"destructive"} onClick={() => { 
                    setCurrentIndex(1) 
                    setWallets([])
                    }} size={"lg"}>Clear Wallets</Button>
                </div>
              </div>
              <div className='grid sm:grid-cols-1  md:grid-cols-2 gap-6'>
                {wallets && wallets.length > 0 ? wallets.map(( wallet , index) => <WalletContainer key={index} removeWallet={removeWallet} wallet={wallet} />) : undefined }
              </div>
            </div> : <div>
            <div className='flex flex-col gap-2'>
              <div className='flex flex-col gap-1'>
                <h1 className='text-white font-bold text-2xl sm:text-3xl md:text-4xl font-manrope select-none'>
                  Forge Your Wallet on the Chain of Your Choice 
                </h1>
                <p className='text-muted/80 text-lg select-none '>
                  Choose a blockchain to generate a wallet
                </p>
              </div>
              <div className='flex gap-4'>
                <Button variant={"secondary"} size={"lg"} className='font-semibold font-manrope select-none' onClick={handleSolWallet} >
                  Solana
                </Button>
                <Button variant={"secondary"} size={"lg"} className='font-semibold font-manrope select-none' onClick={handleEthWallet} >
                  Ethereum
                </Button>
              </div>
            </div>
          </div>}
        </div>
      </div> : <div className='space-y-3' ref={secretPhraseDiv}>
        <div className='flex flex-col gap-2'> 
          <h1 className='text-2xl md:text-4xl sm:text-3xl font-manrope font-bold text-white select-none'> 
            Set Up Your Secret Recovery Phrase 
          </h1> 
          <span className='text-zinc-500 text-sm md:text-lg font-manrope select-none'>
            Secure your wallet by entering your existing recovery phrase, or generate a new one in just one click. 
          </span> 
        </div> 
        <div className='flex gap-6'>
          <Input placeholder='Enter your seed phrase....' className='text-white' onChange={(e :React.ChangeEvent<HTMLInputElement>) =>   setExistingMn(e.currentTarget.value)} >
          </Input> 
          <Button onClick={existingMn ? handleExistingWallets : handleGeneration} size={"lg"} variant={"outline"} className='font-manrope font-bold select-none'> 
            { !existingMn ? 'Generate Wallet' : "Add Wallets"} 
          </Button> 
        </div>
      </div>}
    </main> 
  </>
  )
}

export default App
