chrome.runtime.onMessage.addListener(
    function({message}, sender, sendResponse) {

});

chrome.extension.onConnect.addListener(function(port) {

    port.onMessage.addListener(function({message}) {

        if (message === "getSelection"){

            try{
                chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                    chrome.tabs.sendMessage(tabs[0].id, {message: "checkLoading"}, function(response) {
                        let lastError = chrome.runtime.lastError;
                        if (lastError) {
                            chrome.tabs.executeScript(tabs[0].id, {file: 'scripts/content-script.js'});
                            return
                        }

                        chrome.tabs.sendMessage(tabs[0].id, {message: "getTextSelector"});

                    });


                });

            }catch (e) {
                port.postMessage({ message: 'Error' });
            }

            return true
        }

    });



    chrome.runtime.onMessage.addListener(
        function({message, data}, sender, sendResponse) {
            console.log(message)
            if (message === "variableValue"){
                port.postMessage({message: 'variableValueFromPage',  data: data });
            }else if(message === 'Error'){
                port.postMessage({message: 'Error' });
            }

        });

});


chrome.runtime.onMessage.addListener(
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
            }
            )
            .then(result =>{

               
                let test = Number(result.expiration_date);
        
                let date = new Date(+test); //NB: use + before variable name
                
                console.log(test);
                let expD = date.toLocaleDateString("en", {year:"numeric", day:"2-digit", month:"2-digit"})
                console.log(expD);

                chrome.storage.local.set({expirationDate:expD});
                
            }) 
            
            .catch(error => console.log('error'));


      }
      return true
});