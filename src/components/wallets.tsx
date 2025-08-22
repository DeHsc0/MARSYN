import { Copy, Eye, EyeOff, Trash } from "lucide-react"
import type { Wallets } from "../types"
import { Button } from "./ui/button"
import { useState , useRef } from "react"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./ui/hover-card"
import { toast } from "sonner"



const WalletContainer = ( props : {wallet : Wallets , removeWallet : (wallet : Wallets) => void}) => {

    const [showPrivateKey , setShowPrivateKey] = useState<boolean>(false)

    const walletDiv = useRef<HTMLDivElement>(null)

    useGSAP(() => {
        gsap.from( walletDiv.current , {
            y : 70,
            duration : 0.8,

        })
    })
              
    return <div ref={walletDiv} className='rounded-xl border border-primary/80'>
      <div className='flex justify-between px-5 py-7 items-center'>
        <h1 className='text-white text-2xl sm:text-3xl md:text-4xl font-manrope font-semibold'>
          Wallet {props.wallet.index}
        </h1>
        <Button variant={"link"} size={"icon"} onClick={() => props.removeWallet(props.wallet)}>
          <Trash className='text-red-500/90 size-5'/>
        </Button>
      </div>        
      <div className='px-5 py-7 bg-primary/80 rounded-xl flex flex-col gap-3 '>
        <div className='flex flex-col gap-1.5'>
          <h1 className='font-semibold font-manrope sm:text-lg md:text-2xl text-white'>Public Key</h1>
          <div className='flex justify-between items-center'>
            <span className='text-white text-sm sm:text-lg font-manrope break-all line-clamp-1 flex-1' >{props.wallet.publicKey}</span>  
            <Button variant={"secondary"} size={"icon"} onClick={() => {
              navigator.clipboard.writeText(props.wallet.publicKey)
              toast("Copied to Clipboard")
            }}>
              <Copy/>
            </Button>
          </div>
        </div>
        <div className='flex flex-col gap-1.5'>
          <h1 className='font-semibold font-manrope sm:text-lg md:text-2xl text-white'>Private Key</h1>
              <div className='flex justify-between gap-8 items-center'>
                <HoverCard>
                <HoverCardTrigger>
                  <span className={`text-white text-sm sm:text-lg font-manrope break-all line-clamp-1 flex-1  ${showPrivateKey ? "" : "text-2xl" }`} onClick={() => {
                navigator.clipboard.writeText(props.wallet.privateKey)
                toast("Copied to Clipboard")
              }} >{showPrivateKey ? props.wallet.privateKey : ".".repeat(props.wallet.privateKey.length) }</span>
                </HoverCardTrigger>
                <HoverCardContent className="bg-primary/80 border-muted-foreground/23 ">
                  <div >
                    <h1 className="text-white font-semibold font-manrope">
                      Click to copy 
                    </h1>
                  </div>
                </HoverCardContent>
              </HoverCard>
                <Button variant={"secondary"} size={"icon"} onClick={() => setShowPrivateKey(!showPrivateKey)} >
                  {showPrivateKey ? <Eye/> : <EyeOff/>}
                </Button>
              </div>
        </div>
      </div> 
    </div>
  }

export default WalletContainer