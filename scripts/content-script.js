
    const init = () => {
        const windowGetSelection = window.getSelection();

        let parent = windowGetSelection.getRangeAt(0)
                .commonAncestorContainer,
            selectedText = windowGetSelection.toString();

        if (selectedText.trim() === ''){
                throw new Error('not selected')
        }

        if (parent.nodeType !== 1) {
            parent = parent.parentNode;
        }

        const elemSelector = findQuerySelector(parent),
            matches = document.querySelectorAll(elemSelector),
            start = parent.innerText.indexOf(selectedText);
        let  substrJs = "";

        if (parent.innerText !== selectedText) {
            substrJs = ".match(/^" + (start ? ".{" + start + "}" : "") + "(.*).{" +
                (parent.innerText.length - start - selectedText.length) + "}/i)[1]";
        }
        if (matches.length === 1) {
            const data = 'document.querySelector("' + elemSelector + '").innerText' + substrJs + '.trim()';
            const functionVariable = "function(){ var capturedText = " + data + "; return capturedText; }";

            chrome.runtime.sendMessage({message: "variableValue", data: functionVariable});
            return
        }
        for (let i = 0; i < matches.length; ++i) {
            if (matches[i] === parent) {
                const data = 'document.querySelectorAll("' + elemSelector + '")[' + i + "].innerText" + substrJs + '.trim()';
                const functionVariable = "function(){ var capturedText = " + data + "; return capturedText; }";
                chrome.runtime.sendMessage({message: "variableValue", data: functionVariable});
                break;
            }
        }
    };

    function findQuerySelector(node) {
        let elemSelector = "";
        while (node.parentNode.nodeName !== "BODY") {
            let elemNodeSelector = getSelectorValue(node);
            if (node.nodeType === Node.ELEMENT_NODE) {
                elemSelector = elemNodeSelector + (elemSelector ? ">" : "") + elemSelector;
                if (document.querySelectorAll(elemSelector).length === 1) {
                    break;
                }
            }
            node = node.parentNode;
        }
        return elemSelector;
    }
    function getSelectorValue(selectorId) {
        if (selectorId.id) {
            return "#" + selectorId.id;
        }
        if (selectorId.className) {
           return "." + selectorId.className.trim()
                .replace(/ +/g, ".");
        }
        return selectorId.nodeName.toLowerCase();
    }
    try{
        init();
    }catch (e) {
        chrome.runtime.sendMessage({message: "Error"});
    }


    chrome.runtime.onMessage.addListener(
        function({message}, sender, sendResponse) {
            if (message === "checkLoading"){
                sendResponse('Ok')
            }else if(message === 'getTextSelector'){
                try{
                    init();
                }catch (e) {
                    chrome.runtime.sendMessage({message: "Error"});
                }
            }
    });




