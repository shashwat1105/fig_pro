import { useBroadcastEvent, useEventListener, useMyPresence } from "@/liveblocks.config"
import LiveCursor from "./cursor/LiveCursor"
import { useCallback, useEffect, useState } from "react";
import CursorChat from "./cursor/CursorChat";
import { CursorMode, CursorState, Reaction } from "@/types/type";
import ReactionSelector from "./ReactionButton";
import FlyingReaction from "./reactions/FlyingReaction";
import useInterval from "@/hooks/useInterval";
import { Comments } from "./comments/Comments";
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
  } from "@/components/ui/context-menu"
import { shortcuts } from "@/constants";
  


type Props={
    canvasRef:React.MutableRefObject<HTMLCanvasElement |null>;
    undo:()=>void;
    redo:()=>void;
}

const Live = ({canvasRef,undo,redo}:Props) => {
    // const others=useOthers();
    const [{cursor},updateMyPresence]=useMyPresence() ;
    const [cursorState,setCursorState]=useState<CursorState>({
  mode:CursorMode.Hidden,

    });
 const [reaction,setReaction]=useState<Reaction[]>([])

const broadcast=useBroadcastEvent();

useInterval(()=>{
setReaction((reaction)=>
    reaction.filter((r)=>r.timestamp>Date.now()-4000 )
)
},1000)
 useInterval(()=>{
    if(cursorState.mode===CursorMode.Reaction 
        && cursorState.isPressed && cursor){
            setReaction((reactions)=>reactions.concat([
                {
                    point:{x:cursor.x,y:cursor.y},
                    value:cursorState.reaction,
                    timestamp:Date.now(),
                }
            ]))

         broadcast({
            x:cursor.x,
            y:cursor.y,
            value:cursorState.reaction
         })   
        }
 },100)

useEventListener((eventData)=>{
    const event=eventData.event ;
    setReaction((reactions)=>reactions.concat([
        {
            point:{x:event.x, y:event.y},
            value:event.value,
            timestamp:Date.now(),
        }
    ]))
})

 const handlePOinterMove= useCallback((event:React.PointerEvent)=>{
event.preventDefault();


if(cursor==null || cursorState.mode!==CursorMode.ReactionSelector){

    const x=event.clientX-event.currentTarget.getBoundingClientRect().x;
    const y=event.clientY-event.currentTarget.getBoundingClientRect().y;
    
    updateMyPresence({cursor:{x,y}});
    
}
},[])


const handlePOinterLeave=useCallback((event:React.PointerEvent)=>{
setCursorState({mode:CursorMode.Hidden})    
    
    updateMyPresence({cursor:null,message:null});
    
    },[])


const handlePointerUp=useCallback((event:React.PointerEvent)=>{
        setCursorState((state:CursorState)=>
            cursorState.mode===CursorMode.Reaction?
        {...state,isPresed:true}:state
        )

    },[cursorState.mode,setCursorState])
   
 const handlePOinterDown=useCallback((event:React.PointerEvent)=>{
        
        const x=event.clientX-event.currentTarget.getBoundingClientRect().x;
        const y=event.clientY-event.currentTarget.getBoundingClientRect().y;
        
        updateMyPresence({cursor:{x,y}});
        setCursorState((state:CursorState)=>
            cursorState.mode===CursorMode.Reaction?
        {...state,isPresed:true}:state
        )
        
        },[cursorState.mode,setCursorState,updateMyPresence])

        useEffect(()=>{
        
            const onKeyUp=(e:KeyboardEvent)=>{
                if(e.key==='/'){
                      setCursorState({
                        mode:CursorMode.Chat,
                        previousMessage:null,
                        message:'',
                      })
                }else if(e.key==='Escape'){
                    updateMyPresence({message:''})
                    setCursorState({
                        mode:CursorMode.Hidden,
                    })
                }else if(e.key==='e'){
                    setCursorState({
                        mode:CursorMode.ReactionSelector,
                    })
                }
            }


            const onKeyDown=(e:KeyboardEvent)=>{
                if(e.key==='/'){
                    e.preventDefault();
                }
            }

            window.addEventListener('keydown',onKeyDown);
            window.addEventListener('keyup',onKeyUp);

            return ()=>{
                
            window.removeEventListener('keydown',onKeyDown);
            window.removeEventListener('keyup',onKeyUp);
            }
        },[updateMyPresence]);


 const setReactions=useCallback((reaction:string)=>{
            setCursorState({mode:CursorMode.Reaction,
                reaction,isPressed:true
            })
        },[])

        const handleContextMenuClick=useCallback((key:string)=>{
     
            switch(key){
                case 'Chat':
                    setCursorState({
                        mode:CursorMode.Chat,
                        previousMessage:null,
                        message:'',

                    })
                    break;

                case "Reactions":
                 setCursorState({
                    mode:CursorMode.ReactionSelector,
                 })
                 break;
                 
                case 'Undo':
                    undo();
                    break;
                case 'Redo':
                    redo();
                        break;

                    default:
                        break;
            }
        },[])

  return (

<ContextMenu>
<ContextMenuTrigger>


<div
id="canvas"
onPointerMove={handlePOinterMove}
onPointerDown={handlePOinterDown}
onPointerLeave={handlePOinterLeave}
onPointerUp={handlePointerUp}
className="relative h-full w-full flex flex-1 justify-center
items-center">


<canvas  ref={canvasRef}/>
{reaction.map((r)=>(
    <FlyingReaction key={r.timestamp.toString()}
    x={r.point.x}
    y={r.point.y}
    timestamp={r.timestamp}
    value={r.value}/>
))}

{cursor&& (<CursorChat 
cursor={cursor}
cursorState={cursorState}
setCursorState={setCursorState}
updateMyPresence={updateMyPresence}

/>)}

{cursorState.mode===CursorMode.ReactionSelector && (
    <ReactionSelector setReaction={ setReactions}/>
)}
<LiveCursor/>

<Comments/>
</div>
</ContextMenuTrigger>
<ContextMenuContent className="right-menu-content">
{shortcuts.map((item)=>(
    <ContextMenuItem className="right-menu-item"
    key={item.key} onClick={()=>handleContextMenuClick(item.name)}>
        <p>{item.name}</p>
        <p className="text-xs text-primary-grey-300 ">
            {item.shortcut}
        </p>
    </ContextMenuItem>
))}
</ContextMenuContent>
</ContextMenu>
)
}

export default Live