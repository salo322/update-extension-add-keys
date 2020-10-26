var browser = chrome || browser
console.log(browser)
$( document ).ready(function() {
    browser.storage.local.get(['active', 'exp', 'expirationDate', 'correctDate', 'wrongDate'], function(result) {
        console.log(result.actDate)
        console.log(result.expirationDate)
        let todaysDate = new Date();
        let toNum1 = todaysDate.toDateString()
        console.log(toNum1)
        let test = result.expirationDate;
        console.log(test)
        let newDate = new Date(+test); 
        console.log(test);
        let toNum2  = newDate.toDateString()
        console.log(toNum2)
        const date1 = new Date(`${toNum1}`);
        const date2 = new Date(`${toNum2}`);
        const diffTime = Math.abs(date2 - date1);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        console.log(diffTime + " milliseconds");
        let daysLeft = "(" +  diffDays + ' ' +"days left)";

            if(result.active === 'true' && result.correctDate === 'true'){
                console.log('works...')      
                $('.active-page-tool').css('color', 'blue')
                $('.inactive-menu-Activation span').css('color','#686d76')
                $('.inactive-page-main-container').addClass('hide-element')
                $('.inactive-menu-Activation').click(()=>{
                $('.popup-data-success').addClass('hide-element') 
                $('.inactive-page-main-container').removeClass('hide-element')
                $('.inactive-menu-Activation span').css('color', 'blue')
                $('.active-page-tool').css('color','#686d76')
                $('.inactive-page-status').text('Active')
                $('.inactive-page-status').css('color', 'green')
                $('.inactive-status-container').css('width', '99px') 
                let expirationDate = $(`<div class="active-expDate"> Expiration Date: ${toNum2 }      ${  daysLeft} </div>`)
                $(expirationDate).css('color', '#686d76')
                $('.inactive-main-div').append(expirationDate)
                $('.active-expDate').nextAll('div').remove();
                $('.licence-key').css('display', 'none')
                $('.inactive-page-input').prop('disabled', true);
                $('.inactive-page-input').val('') 
                $('.inactive-page-input').css('background', 'gainsboro');
                $('.inactive-button').css('background', '#686d76')
               })
               $('.active-page-tool').click(()=>{
                   $('.popup-data-success').removeClass('hide-element') 
                   $('.inactive-page-main-container').addClass('hide-element')
                   $('.inactive-menu-Activation span').css('color','#686d76')
                   $('.active-page-tool').css('color', 'blue')
           
               })
               const $errorContainer = $('.popup-data-error'),
               $successContainer = $('.popup-data-success'),
               $codeOutput = $('.generate-code-output-value code'),
               $replaceCheckBox = $('#find-and-replace-checkbox'),
               $findAndReplaceInputs = $('#find-and-replace-find,#find-and-replace-replace');
     
         let receivedValue;
     
         let port = browser.runtime.connect({
             name: "VariableBuilder"
         });
     
         jQuery.fn.selectText = function(){
             let doc = document;
             let element = this[0];
             console.log(this, element);
             if (doc.body.createTextRange) {
                 let range = document.body.createTextRange();
                 range.moveToElementText(element);
                 range.select();
             } else if (window.getSelection) {
                 let selection = window.getSelection();
                 let range = document.createRange();
                 range.selectNodeContents(element);
                 selection.removeAllRanges();
                 selection.addRange(range);
             }
         };
     
         port.postMessage({message: 'getSelection'});
     
         port.onMessage.addListener(function({message, data = null}) {
             console.log("message recieved" + message);
             if (message === 'variableValueFromPage'){
                 showPopupDataSuccess();
                 receivedValue = data;
                 $codeOutput.text(data)
             }else if(message === 'Error'){
                 showPopupDataError()
             }
     
         });
     
         const showPopupDataSuccess = () => {
             $successContainer.removeClass('hide-element');
             $errorContainer.addClass('hide-element');
         };
     
         const showPopupDataError = () => {
             $errorContainer.removeClass('hide-element');
             $successContainer.addClass('hide-element');
         };
     
         $codeOutput.click(() => {
             /* Select the text field */
             $codeOutput.selectText();
             /* Copy the text inside the text field */
             document.execCommand("copy");
         });
     
         $replaceCheckBox.change(() => {
     
             if ($replaceCheckBox.is(":checked")){
                 let findText = $('#find-and-replace-find').val();
                 let replaceText = $('#find-and-replace-replace').val();
                 let updatedText = $codeOutput.text().replace('.trim()', `.trim().replace(/${findText ? findText : '(?:)'}/g,"${replaceText}")`);
                 $codeOutput.text(updatedText)
             }else{
                 $codeOutput.text(receivedValue)
             }
     
         });
     
         const $findAndReplaceInputsEvent = () => {
             let findText = $('#find-and-replace-find').val();
             let replaceText = $('#find-and-replace-replace').val();
             let updatedText = receivedValue.replace('.trim()', `.trim().replace(/${findText ? findText : '(?:)'}/g,"${replaceText}")`);
             $codeOutput.text(updatedText)
         };
     
         $findAndReplaceInputs.on('keyup change', $findAndReplaceInputsEvent);
           }else if(result.exp === 'over' && result.wrongDate === 'false'){
            browser.storage.local.remove(['active', 'correctDate', 'licenseKey','expirationDate']);    
               console.log('not correct date')
                $('.licence-key').text('Your license key has expired, contact us to buy new License')
                $('.licence-key').css('color', 'red')
            
           }

            $('.popup-data-error').addClass('hide-element')
            $('.popup-data-success').addClass('hide-element')
    })
 
    $(".inactive-button" ).click(function() {
        if($('.inactive-page-input').val().length > 1){
            let value = $('.inactive-page-input').val();
            browser.runtime.sendMessage({messageRequest: value}, function(response) {
            if(response.answer === 'activeMode'){

            $('.active-page-tool').click(()=>{
            $('.inactive-page-main-container').addClass('hide-element')
            $('.popup-data-error').removeClass('hide-element')
            browser.storage.local.set({active: 'true', exp : 'over'});
            })
            $('.active-page-tool').trigger('click')
            } else if(response.answer === 'problem'){
                console.log('activation problem')
                $('.licence-key').text('Your Key is not valid, Please try again')
                $('.licence-key').css('color', 'red')
                $('.inactive-page-input').val('')
            }
            });
        }
        else{
            console.log('empty input')
        }
       
    });

});

