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

       fetch('http://localhost:5000')
        .then(
          function(response) {
              let maxRandom = Math.floor(Math.random() * 2) + 1;
              console.log(maxRandom)
            if (maxRandom === 2) {
              console.log('success:' +
              response.status)
              let todaysDate = new Date();
              tDate = new Date(todaysDate.getFullYear(), todaysDate.getMonth()+1, 1);
              console.log(tDate)
              nowDate = tDate.toLocaleDateString("en", {year:"numeric", day:"2-digit", month:"2-digit"})
              stringDate = nowDate.toString()
              chrome.storage.local.set({actDate: stringDate});
              console.log(nowDate)
              sendResponse({answer: "activeMode"})
            }
            else{
                console.log('not true key')
                sendResponse({answer: "problem"})
            }

      })
        .catch(function(err) {
          console.log('Fetch Error :-S', err);
        });

        return true; 
      }
       
});