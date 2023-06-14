import {createHistoryManager} from "../main";


const history = createHistoryManager();
history.mount()

window.onload = ()=>{
    console.log('open new page',location.href,'\ncur history',history.history);
}

history?.onBack((state)=>{
    console.log('onBack',state);
})

history?.onForward((state)=>{
    console.log('onForward',state);
})
