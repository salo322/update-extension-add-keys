var browser = chrome || browser

console.log(browser)
browser.runtime.onConnect.addListener(function(port) {
    port.onMessage.addListener(function({message}) {
        if (message === "getSelection"){

            try{
                browser.tabs.query({active: true, currentWindow: true}, function(tabs) {
                    browser.tabs.sendMessage(tabs[0].id, {message: "checkLoading"}, function(response) {
                        let lastError = browser.runtime.lastError;
                        if (lastError) {
                            browser.tabs.executeScript(tabs[0].id, {file: 'scripts/content-script.js'});
                            return
                        }

                        browser.tabs.sendMessage(tabs[0].id, {message: "getTextSelector"});

                    });

                });

            }catch (e) {
                port.postMessage({ message: 'Error' });
            }

            return true
        }

    });



    browser.runtime.onMessage.addListener(
        function({message, data}, sender, sendResponse) {
            console.log(message)
            if (message === "variableValue"){
                port.postMessage({message: 'variableValueFromPage',  data: data });
            }else if(message === 'Error'){
                port.postMessage({message: 'Error' });
            }

        });

});



browser.runtime.onMessage.addListener(
    function({messageRequest}, sender, sendResponse) {
     
      if (messageRequest){
         requestOptions = {
            method: 'GET',
            redirect: 'follow'
          };
          
          fetch(`http://54.216.102.117/key/check-key-valid?key=${messageRequest}`, requestOptions)
            .then(response =>{
                if(response.status === 200){  
                    sendResponse({answer: "activeMode"})
                }
                else{
                    console.log('not true key')
                    sendResponse({answer: "problem"})
                }
                return response.json()
            })

            .then(result =>{
                const sucKey = result.key;
                console.log(sucKey)
                browser.storage.local.set({licenseKey:sucKey});
                const expD = result.expiration_date
                console.log(expD);

                browser.storage.local.set({expirationDate:expD});
                let todaysDate = new Date();
                let toNum1 = todaysDate.toLocaleDateString("en", {year:"numeric", day:"2-digit", month:"2-digit"})
                console.log(toNum1) 
                let date = new Date(+expD); 
                let toNum2 = date.toLocaleDateString("en", {year:"numeric", day:"2-digit", month:"2-digit"})
                console.log(toNum2)  
                console.log(toNum1)
                toNum1 = new Date(toNum1);
                toNum2 = new Date(toNum2);
                console.log(toNum1)
                console.log(toNum2)

                if(toNum2 >= toNum1){
                    console.log('works')
                    browser.storage.local.set({correctDate:"true"});
                    
                }else {
                    console.log('not works')
                    browser.storage.local.set({wrongDate:"false"});
                    browser.storage.local.set({active:"false"});
                    let secRequestOptions = {
                        method: 'GET',
                        redirect: 'follow'
                      };
                      fetch(`http://54.216.102.117/key/disable?key=${sucKey}`, secRequestOptions)
                        .then(response => response)
                        .catch(error => console.log('error', error));
                }
               
            }) 
            .catch(error => console.log('error'));
      }
      return true

});


const mainFunc =()=>{

browser.storage.local.get(['expirationDate', 'licenseKey'], function(result) {
  
        let todaysDate = new Date();
        let toNum1 = todaysDate.toLocaleDateString("en", {year:"numeric", day:"2-digit", month:"2-digit"})
        let test = result.expirationDate;
        console.log(test)
        let newDate = new Date(+test); 
        console.log(test);
        let toNum2  = newDate.toLocaleDateString("en", {year:"numeric", day:"2-digit", month:"2-digit"})
        console.log(toNum1) 
        console.log(toNum2) 
        toNum1 = new Date(toNum1);
        toNum2 = new Date(toNum2); 
        if(toNum2 >= toNum1){
            console.log('works')
            browser.storage.local.set({correctDate:"true"});
            
        }else{
            console.log('not works')
            browser.storage.local.set({wrongDate:"false"});
            browser.storage.local.remove(['active', 'correctDate', 'licenseKey','expirationDate']);
            let secRequestOptions = {
                method: 'GET',
                redirect: 'follow'
              };
              fetch(`http://54.216.102.117/key/disable?key=${result.licenseKey}`, secRequestOptions)
                .then(response => response)
                .catch(error => console.log('error', error));
                clearInterval(func)
        }
    

});
}
mainFunc();

let dayInMilliseconds = 1000 * 60 * 60 * 24;
 
let func = setInterval(interval, dayInMilliseconds, true);
function interval(){
  
        mainFunc();

}
 

