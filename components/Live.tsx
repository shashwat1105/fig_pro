import { useMyPresence, useOthers } from "@/liveblocks.config"
import LiveCursor from "./cursor/LiveCursor"
import { useCallback } from "react";



const Live = () => {
    const others=useOthers();
    const [{cursor},updateMyPresence]=useMyPresence() as any;

const handlePOinterMove=useCallback((event:React.PointerEvent)=>{
event.preventDefault();

const x=event.clientX-event.currentTarget.getBoundingClientRect().x;
const y=event.clientY-event.currentTarget.getBoundingClientRect().y;

updateMyPresence({cursor:{x,y}});

},[])


const handlePOinterLeave=useCallback((event:React.PointerEvent)=>{
    event.preventDefault();
    
    
    updateMyPresence({cursor:null,message:null});
    
    },[])

   
 const handlePOinterDown=useCallback((event:React.PointerEvent)=>{
        
        const x=event.clientX-event.currentTarget.getBoundingClientRect().x;
        const y=event.clientY-event.currentTarget.getBoundingClientRect().y;
        
        updateMyPresence({cursor:{x,y}});
        
        },[])

  return (
<div onPointerMove={handlePOinterMove}
onPointerDown={handlePOinterDown}
onPointerLeave={handlePOinterLeave}
className=" h-[100vh] w-full flex justify-center
items-center text-center">
<h1 className="font-2xl text-white">Hello there</h1>

<LiveCursor others={others}/>
</div>
)
}

export default Live