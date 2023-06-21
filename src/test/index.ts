import {createHistoryManager} from "../main";


const historyManager = createHistoryManager()
console.log(historyManager);
historyManager.$on('back',(e)=>{
    console.log('back',historyManager.stack);
})

historyManager.$on('forward',(e)=>{
    console.log('forward',historyManager.stack);
})
// history.pushState(null, '', '')
// history.replaceState(null, '', '')

window['h'] = historyManager
console.log(history);


window.onload = () => {
    console.log('open new page', location.href, '\ncur history');
}

