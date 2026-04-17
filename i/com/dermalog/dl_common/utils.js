/**
 *
 * Copyright: DERMALOG Identification Systems GmbH, Hamburg - Germany, 2013-2020.
 *
 * WWirns   20.08.2020  Initial version
 * WWirns   15.02.2021  Add function chooseItem4SetFocus
 * WWirns   22.03.2021  Add object ipaddr
 * WWirns   02.06.2021  Change escapeHtml and add unescapeHtml
 * WWirns   29.06.2021  Add String.prototype.toCamelCase
 * WWirns   09.08.2021  Add functions hasAudioCtx and beep
 * WWirns   16.02.2022  Add functions findInFrames and findFunctionInFrames
 * WWirns   10.08.2022  Add "use strict;"
 * WWirns   12.08.2022  Add function isPassedNeededVersion
 * WWirns   11.01.2023  Extend version object of namespace
 * WWirns   13.01.2023  Add getCookie and setCookie
 **/

"use strict";

dermalog.dl_common.utils = {};
dermalog.dl_common.utils.version = {
    toString: function () {
        return String(this.major) + "." + String(this.minor) + "." + ("0000" + this.patch).slice(-4);
    }, major: 1, minor: 0, patch: 68
};

dermalog.dl_common.simpleObserver = {};
dermalog.dl_common.simpleObserver.version = {
    toString: function () {
        return String(this.major) + "." + String(this.minor) + "." + ("0000" + this.patch).slice(-4);
    }, major: 1, minor: 0, patch: 64
};

/**
 * @public
 * @function
 */
Date.prototype.toYYMMDD = function () {
    let mm = this.getMonth() + 1; // getMonth() is zero-based
    let dd = this.getDate();

    return [this.getFullYear() % 100, (mm > 9 ? "" : "0") + mm, (dd > 9 ? "" : "0") + dd].join("");
};

/**
 * @public
 * @function
 */
Date.prototype.toYYYYMMDD = function () {
    let mm = this.getMonth() + 1; // getMonth() is zero-based
    let dd = this.getDate();

    return [this.getFullYear(), (mm > 9 ? "" : "0") + mm, (dd > 9 ? "" : "0") + dd].join("");
};

/**
 * @public
 * @function
 */
Date.prototype.addYears = function (amount) {
    this.setFullYear(this.getFullYear() + amount);
    return this;
};

/**
 * @public
 * @function
 */
String.prototype.toCamelCase = function () {
    return this.replace(/(^| |_|-)+([^ _-])([^ _-]*)/g, function (match, g1, g2, g3 /*, offset, string*/) {
        return g2.toUpperCase() + g3.toLowerCase();
    });
};

/**
 * @public
 * @function InlineUtilsFactory
 */
(function (pUtils) {
    "use strict";

    /**
     * @private
     * @const
     * @memberOf pUtils
     */
    const _translationsNamespaceKey = "dermalog.dl_common.translations";


    /**
     * @private
     * @const
     * @memberOf pUtils
     */
    const AUDIO_CTX_NAME = (window["AudioContext"] || window["webkitAudioContext"] || window["audioContext"]);
    let audioCtx = undefined;

    /**
     * @public
     * @memberOf pUtils
     */
    pUtils.PARAMETER_LOG = 0;

    /**
     * @public
     * @memberOf pUtils
     */
    pUtils.chooseItem4SetFocus = function (pOrderedItemIds, pStart) {
        /*
        aStartItem.isDisabled() =>  .prop( "disabled" )
        $("#biometricLoginButton").css("visibility")
        //$("#biometricLoginButton").attr( "style" ).match(/display: +none/)
        $("#biometricLoginButton").is(":hidden")
        $("#biometricLoginButton").is(":visible")
         */
        if (!Array.isArray(pOrderedItemIds)) {
            console.error("pOrderedItemIds is not an array!");
            return;
        }
        if (dermalog.dl_common.utils.isEmpty(pStart)) {
            console.error("pStart is empty!");
            return;
        }

        let startIdx;
        //let aStartItem; // = apex.item(pStart);
        let jStartItem; // = $("#" + pStart)

        switch (typeof pStart) {
            case "string":
                startIdx = pOrderedItemIds.indexOf(pStart);
                if (startIdx < 0) {
                    console.error("pStart[" + pStart + "] does not exist into pOrderedItemIds!");
                    return;
                }
                jStartItem = $("#" + pStart);
                break;
            case "number":
                if (pStart < 0) {
                    console.error("pStart[" + pStart + "] as number is too less!");
                    return;
                } else if (pStart < pOrderedItemIds.length) {
                    startIdx = pStart;
                } else {
                    startIdx = 0;
                }
                jStartItem = $("#" + pOrderedItemIds[startIdx]);
                break;
            default:
                console.error("pStart is not a string nor a number!");
                return;
                break;
        }


        if (jStartItem.prop("disabled") || jStartItem.is(":hidden")) {
            // Find the next item for set focus on it
            let nextElemId;
            let jNextItem;
            for (let j = 0; j < pOrderedItemIds.length; j++) {
                startIdx++;
                nextElemId = pOrderedItemIds[startIdx];
                if (nextElemId === undefined) {
                    startIdx = 0;
                    nextElemId = pOrderedItemIds[startIdx];
                    if (nextElemId === undefined) {
                        console.error("nextElemId is undefined!");
                        return;
                    }
                }
                jNextItem = $("#" + nextElemId);
                if (!(jNextItem.prop("disabled") || jNextItem.is(":hidden"))) {
                    jNextItem.focus();
                    break;
                }
            }
        } else {
            if (!jStartItem.is(":focus")) {
                jStartItem.focus();
            }
        }
    };

    /**
     *
     * shift   16
     * ctrl    17
     * alt     18
     *
     * @public
     * @memberOf pUtils
     */
    pUtils.isKeyCodeDown = function (pKeyCode) {
        if (keyCodeStates[pKeyCode] === true) {
            return true;
        } else {
            return false;
        }
    };

    /**
     * @public
     * @memberOf pUtils
     */
    pUtils.uuid_v4 = function () {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
            let r = Math.random() * 16 | 0, v = c === "x" ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    };

    /**
     * @public
     * @memberOf pUtils
     */
    pUtils.isEmpty = function (pValue) {
        return (pValue === undefined || pValue == null || pValue.length <= 0) ? true : false;
    };

    /**
     * @public
     * @memberOf pUtils
     */
    pUtils.blockJsEngine = function (milliseconds) {
        const date = Date.now();
        let currentDate = null;
        do {
            currentDate = Date.now();
        } while (currentDate - date < milliseconds);
    };

    /**
     * @public
     * @memberOf pUtils
     */
    pUtils.getFormattedDate = function () {
        let dateCurr = new Date();

        let nMonth = dateCurr.getMonth() + 1;
        let nDay = dateCurr.getDate();
        let nHour = dateCurr.getHours();
        let nMinute = dateCurr.getMinutes();
        let nSecond = dateCurr.getSeconds();

        let sMonth = (nMonth < 10 ? "0" : "") + nMonth;
        let sDay = (nDay < 10 ? "0" : "") + nDay;
        let sHour = (nHour < 10 ? "0" : "") + nHour;
        let sMin = (nMinute < 10 ? "0" : "") + nMinute;
        let sSec = (nSecond < 10 ? "0" : "") + nSecond;

        return dateCurr.getFullYear() + "-" + sMonth + "-" + sDay + "_" + sHour + ":" + sMin + ":" + sSec;
    };

    /**
     * @public
     * @memberOf pUtils
     */
    pUtils.Base64Image2UrlImage = function (imageData, imageType) {
        // .match(/^[^:]+:[^/]+\/[^;]+;base64,/gim)
        if (imageData.match(/^data:image\/[^;]+;base64,/gim)) {
            return imageData;
        } else if (imageType.match(/^data:image\/[^;]+;base64,/gim)) {
            return imageType + imageData;
        } else if (imageType.match(/^data:image\/[^;]+;base64/gim)) {
            return imageType + "," + imageData;
        } else {
            return "data:image/" + (pUtils.isEmpty(imageType) ? "*" : imageType.toLowerCase()) + ";base64," + imageData;
        }
    };

    /**
     * @public
     * @memberOf pUtils
     */
    pUtils.UrlImage2Base64Image = function (imageData) {
        return imageData.replace(/^data:image\/[^;]+;base64,/gim, "");
    };

    /**
     * @public
     * @memberOf pUtils
     */
    pUtils.LogMessage = function (principal, message) {
        if (pUtils.PARAMETER_LOG == 1) {
            var textarea = $("#ITEM_LOGARCHIVE")[0];
            textarea.value = textarea.value + "\n" + pUtils.getFormattedDate() + ", " + principal + ":" + message;
            textarea.scrollTop = textarea.scrollHeight;
        }
    };

    /**
     * @public
     * @memberOf pUtils
     */
    pUtils.PlaySound = function (file) {
        let audio = new Audio(file);
        audio.play();
    };

    /**
     * @public
     * @memberOf pUtils
     */
    pUtils.escapeHtml = function (pValue) {
        /*
        return text.replace(/[\"&<>]/g, function (a) {
            return {'"': '&quot;', '&': '&amp;', '<': '&lt;', '>': '&gt;'}[a];
        });
         */
        return pValue.replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#x27;")
            .replace(/\//g, "&#x2F;");
    };

    /**
     * @public
     * @memberOf pUtils
     */
    pUtils.unescapeHtml = function (pValue) {
        return pValue.replace(/&#x2F;/g, "/")
            .replace(/&#x27;/g, "'")
            .replace(/&quot;/g, "\"")
            .replace(/&gt;/g, ">")
            .replace(/&lt;/g, "<")
            .replace(/&amp;/g, "&");
    };

    /**
     * @public
     * @memberOf pUtils
     */
    pUtils.hasAudioCtx = function () {
        if (audioCtx === undefined) {
            try {
                audioCtx = (AUDIO_CTX_NAME ? new AUDIO_CTX_NAME() : null);
            } catch (e) {
                audioCtx = null;
            }
        }
        if (audioCtx) {
            return true;
        } else {
            return false;
        }
    };

    /**
     * @public
     * @memberOf pUtils
     */
    pUtils.getAudioCtxState = function () {
        if (pUtils.hasAudioCtx()) {
            return audioCtx.state;
        } else {
            return undefined;
        }
    };

    /**
     * All arguments are optional:
     *
     * pDuration of the tone in milliseconds. Default is 500
     * pFrequency of the tone in hertz. default is 440
     * pVolume of the tone. Default is 1, off is 0.
     * pType of tone. Possible values are sine, square, sawtooth, triangle, and custom. Default is sine.
     *
     * @public
     * @memberOf pUtils
     */
    pUtils.beep = function (pDuration, pFrequency, pVolume, pType, pIgnoreErrors) {
        let oResult = $.Deferred();
        if (pUtils.hasAudioCtx()) {
            // audioCtx.state: "suspended"
            // audioCtx.state: "running"
            // audioCtx.resume()
            if (audioCtx.state === "running") {
                let oscillator = audioCtx.createOscillator();
                let gain = audioCtx.createGain();
                if (pVolume) {
                    gain.gain.value = pVolume;
                }
                oscillator.connect(gain);
                gain.connect(audioCtx.destination);
                if (pFrequency) {
                    oscillator.frequency.value = pFrequency;
                }
                if (pType) {
                    oscillator.type = pType;
                }
                oscillator.onended = () => {
                    oResult.resolve({Result: 0, Message: ""});
                };
                oscillator.start(audioCtx.currentTime);
                oscillator.stop(audioCtx.currentTime + ((pDuration || 500) / 1000));
            } else {
                if (pIgnoreErrors === true) {
                    oResult.resolve({
                        Result: -1, Message: "The Audio-Context state is not [running], it is [" + audioCtx.state + "]!"
                    });
                } else {
                    oResult.reject({
                        Result: -2, Message: "The Audio-Context state is not [running], it is [" + audioCtx.state + "]!"
                    });
                }
            }
        } else {
            if (pIgnoreErrors === true) {
                oResult.resolve({Result: -1, Message: "No Audio-Context available!"});
            } else {
                oResult.reject({Result: -2, Message: "No Audio-Context available!"});
            }
        }
        return oResult.promise();
    };

    /**
     * @public
     * @memberOf pUtils
     */
    pUtils.findInFrames = function (pName, pTypename = "^.+$") {
        if (!pName) {
            return [];
        }
        let sCode = "\"use strict\";\n" + "let aResult = [];\n" + "let reType = new RegExp('" + pTypename + "');\n" + "let t;\n" + "try {\n" + "    t = typeof window.top." + pName + ";\n" + "    if (t.match(reType) && t !== 'undefined') {\n" + "        aResult.push(window.top." + pName + ");\n" + "    }\n" + "} catch (e) {\n" + "}\n" + "for (let i = 0; i < window.top.frames.length; i++) {\n" + "    try {\n" + "        t = typeof window.top.frames[i]." + pName + ";\n" + "        if (t.match(reType) && t !== 'undefined' && !aResult.includes(window.top.frames[i]." + pName + ")) {\n" + "            aResult.push(window.top.frames[i]." + pName + ");\n" + "        }\n" + "    } catch (e) {\n" + "    }\n" + "}\n" + "return aResult;";
        //return sCode;
        return Function(sCode)();
    };

    /**
     * @public
     * @memberOf pUtils
     */
    pUtils.findFunctionInFrames = function (pName) {
        return pUtils.findInFrames(pName, "^function$");
    };

    /**
     * @public
     * @memberOf pUtils
     */
    pUtils.saveTranslationIntoSessionStorage = function (jsonString) {
        // clear customTranslations from sessionStorage before inserting new datasets
        //let sessionStorageValues = sessionStorage;
        //let deleteEntries = Object.keys(sessionStorageValues)
        let deleteEntries = Object.keys(sessionStorage)
            .filter(key => key.indexOf(_translationsNamespaceKey) > -1);

        jQuery.each(deleteEntries, function (index, value) {
            sessionStorage.removeItem(value);
        });

        // add new values to sessionStorage
        jQuery.each(jsonString, function (index, value) {
            sessionStorage.setItem(_translationsNamespaceKey + "." + index, value);
        });
    };

    /**
     * searchString should be something like APP_ID.APP_PAGE_ID
     *
     * @public
     * @memberOf pUtils
     */
    pUtils.translateElements = function (searchString) {
        //let sessionStorageValues = sessionStorage;
        //let translateElements = Object.keys(sessionStorageValues)
        let translateElements = Object.keys(sessionStorage)
            .filter(key => key.indexOf(_translationsNamespaceKey) > -1);

        // set items
        let itemKey = _translationsNamespaceKey + "." + searchString + ".Item.";
        let translateItems = translateElements.filter(key => key.indexOf(".Item.") > -1 && key.indexOf(searchString) > -1)
            .map(key => key.replace(itemKey, ""));

        jQuery.each(translateItems, function (index, value) {
            $("#" + value).text(sessionStorage.getItem(itemKey + value));
        });

        // set reports
        let reportKey = _translationsNamespaceKey + "." + searchString + ".Report.";
        let translateReports = translateElements.filter(key => key.indexOf(".Report.") > -1 && key.indexOf(searchString) > -1)
            .map(key => key.replace(reportKey, ""));

        jQuery.each(translateReports, function (index, value) {
            //console.log(index, value);
            $("#" + value).find("a.a-IRR-headerLink").first().text(sessionStorage.getItem(reportKey + value));
            $("#" + value).find("span.a-IRR-headerLabel").first().text(sessionStorage.getItem(reportKey + value));
            $("#" + value + "_HDR").text(sessionStorage.getItem(reportKey + value));
        });
    };

    /**
     * searchString should be something like APP_ID.APP_PAGE_ID
     *
     * @function
     * @memberOf pUtils
     */
    pUtils.getTransparentImage = function (imageUrl) {
        //function transparentSignature(imageUrl) {
        return new Promise(function (done, error) {
            function imageLoaded(ev) {
                imageToTransparent(ev).then(done, error);
            }

            function imageToTransparent(ev) {
                // The image, assumed to be 512x512
                var im = ev.target;

                var element = document.createElement("canvas"); //document.getElementById("cancan");
                element.width = im.width;
                element.height = im.height;

                var c = element.getContext("2d");
                // Read the width and height of the canvas
                var width = element.width;
                var height = element.height;

                // Stamp the image on the left of the canvas.
                c.drawImage(im, 0, 0);

                // Get all canvas pixel data
                var imageData = c.getImageData(0, 0, width, height);

                // The width index is output position.
                var w2 = width / 2;

                var minX = width, minY = height, maxX = 0, maxY = 0;

                // Run through the image.
                // The height of the image.
                for (var y = 0; y < height; y++) {
                    /*
                      // *4 for 4 ints per pixel.
                      // This is an input index.
                        let inpos = y * width * 4;
                      // This is an output index.
                        let outpos = inpos + w2 * 4
                      // The width of the image.
                     */
                    let p = y * width * 4;
                    for (var x = 0; x < width; x++) {
                        let o = p;
                        // Get the pixel of the red channel.
                        let r = imageData.data[p++];
                        // Get the pixel of the green channel.
                        let g = imageData.data[p++];
                        // Get the pixel of the blue channel.
                        let b = imageData.data[p++];
                        // Get the pixel of the alpha channel.
                        let a = imageData.data[p++];
                        // Transform RGB color space to gray scale.
                        //gray =  (0.299 * r + 0.587 * g + 0.114 * b)
                        let c = r; // < 255 ? 0 : 255;
                        a = 255 - c;
                        c = (c < 255) ? 0 : 255;
                        imageData.data[o++] = c;
                        imageData.data[o++] = c;
                        imageData.data[o++] = c;
                        imageData.data[o++] = a;

                        /*if (a > 0)
                        console.log(c, a);*/

                        if (a > 0) {
                            minX = Math.min(minX, x);
                            maxX = Math.max(maxX, x);
                            minY = Math.min(minY, y);
                            maxY = Math.max(maxY, y);
                        }
                    } // The closing "The width of the image".
                } // The closing "The height of the image".

                var extractROI = function (rgba, srcW, srcH, dest, x, y, w, h) {
                    var res = dest;
                    let d = 0;
                    for (let i = y; i < y + h; i++) {
                        for (let a = x; a < x + w; a++) {
                            let idx = (i * srcW + a) * 4;
                            res.data[d++] = rgba.data[idx++];
                            res.data[d++] = rgba.data[idx++];
                            res.data[d++] = rgba.data[idx++];
                            res.data[d++] = rgba.data[idx++];
                        }
                    }
                    return res;
                };

                return new Promise(function (done) {
                    if (maxX - minX < 1 || maxY - minY < 1) {
                        return null;
                    }

                    var w = maxX - minX + 1;
                    var h = maxY - minY + 1;

                    //console.log(minX, minY, w, h);

                    var destCanvas = document.createElement("canvas");
                    destCanvas.width = w;
                    destCanvas.height = h;

                    var cDest = destCanvas.getContext("2d");

                    //console.log(imageData);

                    var iDest = cDest.getImageData(0, 0, w, h);

                    let transImage = extractROI(imageData, width, height, iDest, minX, minY, w, h);

                    //console.log(transImage);

                    cDest.putImageData(transImage, 0, 0);

                    // Put pixel data on canvas.
                    //c.putImageData(imageData, 0, 0);

                    done(destCanvas.toDataURL());
                });
            }

            // Establish an image object.
            var im = new Image();
            // Load the javascript function.
            im.onload = imageLoaded;
            // Code assumes this image is 512x512.
            im.src = imageUrl;
        });
        //}
    };

    /**
     * @function
     * @memberOf pUtils
     */
    pUtils.isPassedNeededVersion = function (pNeededVersion, pCurrVersion) {
        if (!(Array.isArray(pNeededVersion) && Array.isArray(pCurrVersion) /*&& pCurrVersion.length >= pNeededVersion.length*/)) {
            return false;
        }
        for (let i = 0; i < Math.min(pNeededVersion.length, pCurrVersion.length); i++) {
            if (pCurrVersion[i] > pNeededVersion[i]) {
                return true;
            } else if (pCurrVersion[i] < pNeededVersion[i]) {
                return false;
            }
            if ((pCurrVersion[i] === pNeededVersion[i]) && (i === pNeededVersion.length - 1)) {
                return true;
            }
        }
        return false;
    };

    /**
     * @function
     * @memberOf pUtils
     */
    pUtils.getCookie = function (pName) {
        let sFindName = pName + "=";
        let sDecodedCookie = decodeURIComponent(document.cookie);
        let aCookies = sDecodedCookie.split(";");
        for (let i = 0; i < aCookies.length; i++) {
            let sCookie = aCookies[i];
            while (sCookie.charAt(0) == " ") {
                sCookie = sCookie.substring(1);
            }
            if (sCookie.indexOf(sFindName) == 0) {
                return {
                    name: pName
                    , value: sCookie.substring(sFindName.length, sCookie.length)
                    , expires: null
                    , path: null
                    , domain: null
                    , secure: null
                    , httpOnly: null
                };
            }
        }
        return null;
    };

    /**
     * @function
     * @memberOf pUtils
     */
    pUtils.getCookieValue = function (pName) {
        let aCookie = pUtils.getCookie(pName);
        if (aCookie) {
            return aCookie.value;
        }
        return "";
    };

    /**
     * @function
     * @memberOf pUtils
     */
    pUtils.setCookie = function (pName, pValue, pExpires = null, pPath = null, pDomain = null, pSecure = null, pHttpOnly = null) {
        let sExpires = "";
        let sPath = "";
        let sDomain = "";
        let sSecure = "";
        let sHttpOnly = "";
        if (!dermalog.dl_common.utils.isEmpty(pExpires)) {
            sExpires = ";Expires=";
            if (typeof pExpires === "number") {
                const dNow = new Date();
                dNow.setTime(dNow.getTime() + (pExpires * 24 * 60 * 60 * 1000));
                sExpires += dNow.toUTCString();
            } else {
                sExpires += pExpires;
            }
        }
        if (!dermalog.dl_common.utils.isEmpty(pPath)) {
            sPath = ";Path=" + pPath;
        }
        if (!dermalog.dl_common.utils.isEmpty(pDomain)) {
            sDomain = ";Domain=" + pDomain;
        }
        if (!dermalog.dl_common.utils.isEmpty(pSecure)) {
            sSecure = ";Secure";
        }
        if (!dermalog.dl_common.utils.isEmpty(pHttpOnly)) {
            sHttpOnly = ";HttpOnly";
        }
        document.cookie = pName + "=" + pValue + sExpires + sPath + sDomain + sSecure + sHttpOnly;
    };

    /**
     * Document ready logic
     */
    $(document).ready(function () {
    });

})(dermalog.dl_common.utils);

/**
 * @public
 * @function InlineSimpleObserverFactory
 */
(function (pSimpleObserver) {
    "use strict";

    /**
     * @private
     * @var
     * @memberOf pSimpleObserver
     */
    let _subscribers = [];


    /**
     * @public
     * @memberOf pSimpleObserver
     */
    pSimpleObserver.init = function () {
        _subscribers = [];
    };


    /**
     * Registers a new subscriber for communication with other modules
     *
     * @public
     * @memberOf pSimpleObserver
     * @param {function} func
     */
    pSimpleObserver.subscribe = function (pCallbackImplementor) {
        let result;
        if (typeof pCallbackImplementor.observerCallback !== "function") throw "Parameter \"pCallbackImplementor\" does not implement function \"observerCallback\"!";

        result = dermalog.dl_common.utils.uuid_v4();
        _subscribers.push({implementor: pCallbackImplementor, uuid: result});
        return result;
    };

    /**
     * Removes the given subscriber from the subscribers list
     *
     * @public
     * @memberOf pSimpleObserver
     * @param {function} func
     */
    pSimpleObserver.unsubscribe = function (pCallbackImplementor) {
        _subscribers = _subscribers.filter(subscriber => subscriber.implementor !== pCallbackImplementor);
    };

    /**
     * Calls the subscriber functions
     *
     * @public
     * @memberOf pSimpleObserver
     * @param {string} action
     * @param {object} options
     */
    pSimpleObserver.notify = function (senderName, action, options, senderUUID) {
        _subscribers.forEach(function (subscriber) {
            if (senderUUID !== null) {
                if (subscriber.uuid !== senderUUID) subscriber.implementor.observerCallback(senderName, action, options, senderUUID);
            } else {
                subscriber.implementor.observerCallback(senderName, action, options, senderUUID);
            }
        });
    };


    /**
     * Document ready logic
     *
     */
    $(document).ready(function () {
    });

})(dermalog.dl_common.simpleObserver);

/**
 * This is a copy of "https://github.com/whitequark/ipaddr.js"
 *
 * @public
 * @function InlineIpaddrFactory
 */
(function (root) {
    "use strict";
    // A list of regular expressions that match arbitrary IPv4 addresses,
    // for which a number of weird notations exist.
    // Note that an address like 0010.0xa5.1.1 is considered legal.
    const ipv4Part = "(0?\\d+|0x[a-f0-9]+)";
    const ipv4Regexes = {
        fourOctet: new RegExp(`^${ipv4Part}\\.${ipv4Part}\\.${ipv4Part}\\.${ipv4Part}$`, "i"),
        threeOctet: new RegExp(`^${ipv4Part}\\.${ipv4Part}\\.${ipv4Part}$`, "i"),
        twoOctet: new RegExp(`^${ipv4Part}\\.${ipv4Part}$`, "i"),
        longValue: new RegExp(`^${ipv4Part}$`, "i")
    };

    // Regular Expression for checking Octal numbers
    const octalRegex = new RegExp(`^0[0-7]+$`, "i");
    const hexRegex = new RegExp(`^0x[a-f0-9]+$`, "i");

    const zoneIndex = "%[0-9a-z]{1,}";

    // IPv6-matching regular expressions.
    // For IPv6, the task is simpler: it is enough to match the colon-delimited
    // hexadecimal IPv6 and a transitional variant with dotted-decimal IPv4 at
    // the end.
    const ipv6Part = "(?:[0-9a-f]+::?)+";
    const ipv6Regexes = {
        zoneIndex: new RegExp(zoneIndex, "i"),
        "native": new RegExp(`^(::)?(${ipv6Part})?([0-9a-f]+)?(::)?(${zoneIndex})?$`, "i"),
        deprecatedTransitional: new RegExp(`^(?:::)(${ipv4Part}\\.${ipv4Part}\\.${ipv4Part}\\.${ipv4Part}(${zoneIndex})?)$`, "i"),
        transitional: new RegExp(`^((?:${ipv6Part})|(?:::)(?:${ipv6Part})?)${ipv4Part}\\.${ipv4Part}\\.${ipv4Part}\\.${ipv4Part}(${zoneIndex})?$`, "i")
    };

    // Expand :: in an IPv6 address or address part consisting of `parts` groups.
    function expandIPv6(string, parts) {
        // More than one '::' means invalid adddress
        if (string.indexOf("::") !== string.lastIndexOf("::")) {
            return null;
        }

        let colonCount = 0;
        let lastColon = -1;
        let zoneId = (string.match(ipv6Regexes.zoneIndex) || [])[0];
        let replacement, replacementCount;

        // Remove zone index and save it for later
        if (zoneId) {
            zoneId = zoneId.substring(1);
            string = string.replace(/%.+$/, "");
        }

        // How many parts do we already have?
        while ((lastColon = string.indexOf(":", lastColon + 1)) >= 0) {
            colonCount++;
        }

        // 0::0 is two parts more than ::
        if (string.substr(0, 2) === "::") {
            colonCount--;
        }

        if (string.substr(-2, 2) === "::") {
            colonCount--;
        }

        // The following loop would hang if colonCount > parts
        if (colonCount > parts) {
            return null;
        }

        // replacement = ':' + '0:' * (parts - colonCount)
        replacementCount = parts - colonCount;
        replacement = ":";
        while (replacementCount--) {
            replacement += "0:";
        }

        // Insert the missing zeroes
        string = string.replace("::", replacement);

        // Trim any garbage which may be hanging around if :: was at the edge in
        // the source strin
        if (string[0] === ":") {
            string = string.slice(1);
        }

        if (string[string.length - 1] === ":") {
            string = string.slice(0, -1);
        }

        parts = (function () {
            const ref = string.split(":");
            const results = [];

            for (let i = 0; i < ref.length; i++) {
                results.push(parseInt(ref[i], 16));
            }

            return results;
        })();

        return {
            parts: parts, zoneId: zoneId
        };
    }

    // A generic CIDR (Classless Inter-Domain Routing) RFC1518 range matcher.
    function matchCIDR(first, second, partSize, cidrBits) {
        if (first.length !== second.length) {
            throw new Error("ipaddr: cannot match CIDR for objects with different lengths");
        }

        let part = 0;
        let shift;

        while (cidrBits > 0) {
            shift = partSize - cidrBits;
            if (shift < 0) {
                shift = 0;
            }

            if (first[part] >> shift !== second[part] >> shift) {
                return false;
            }

            cidrBits -= partSize;
            part += 1;
        }

        return true;
    }

    function parseIntAuto(string) {
        // Hexadedimal base 16 (0x#)
        if (hexRegex.test(string)) {
            return parseInt(string, 16);
        }
        // While octal representation is discouraged by ECMAScript 3
        // and forbidden by ECMAScript 5, we silently allow it to
        // work only if the rest of the string has numbers less than 8.
        if (string[0] === "0" && !isNaN(parseInt(string[1], 10))) {
            if (octalRegex.test(string)) {
                return parseInt(string, 8);
            }
            throw new Error(`ipaddr: cannot parse ${string} as octal`);
        }
        // Always include the base 10 radix!
        return parseInt(string, 10);
    }

    function padPart(part, length) {
        while (part.length < length) {
            part = `0${part}`;
        }

        return part;
    }

    const ipaddr = {};

    // An IPv4 address (RFC791).
    ipaddr.IPv4 = (function () {
        // Constructs a new IPv4 address from an array of four octets
        // in network order (MSB first)
        // Verifies the input.
        function IPv4(octets) {
            if (octets.length !== 4) {
                throw new Error("ipaddr: ipv4 octet count should be 4");
            }

            let i, octet;

            for (i = 0; i < octets.length; i++) {
                octet = octets[i];
                if (!((0 <= octet && octet <= 255))) {
                    throw new Error("ipaddr: ipv4 octet should fit in 8 bits");
                }
            }

            this.octets = octets;
        }

        // Special IPv4 address ranges.
        // See also https://en.wikipedia.org/wiki/Reserved_IP_addresses
        IPv4.prototype.SpecialRanges = {
            unspecified: [[new IPv4([0, 0, 0, 0]), 8]], broadcast: [[new IPv4([255, 255, 255, 255]), 32]], // RFC3171
            multicast: [[new IPv4([224, 0, 0, 0]), 4]], // RFC3927
            linkLocal: [[new IPv4([169, 254, 0, 0]), 16]], // RFC5735
            loopback: [[new IPv4([127, 0, 0, 0]), 8]], // RFC6598
            carrierGradeNat: [[new IPv4([100, 64, 0, 0]), 10]], // RFC1918
            "private": [[new IPv4([10, 0, 0, 0]), 8], [new IPv4([172, 16, 0, 0]), 12], [new IPv4([192, 168, 0, 0]), 16]], // Reserved and testing-only ranges; RFCs 5735, 5737, 2544, 1700
            reserved: [[new IPv4([192, 0, 0, 0]), 24], [new IPv4([192, 0, 2, 0]), 24], [new IPv4([192, 88, 99, 0]), 24], [new IPv4([198, 51, 100, 0]), 24], [new IPv4([203, 0, 113, 0]), 24], [new IPv4([240, 0, 0, 0]), 4]]
        };

        // The 'kind' method exists on both IPv4 and IPv6 classes.
        IPv4.prototype.kind = function () {
            return "ipv4";
        };

        // Checks if this address matches other one within given CIDR range.
        IPv4.prototype.match = function (other, cidrRange) {
            let ref;
            if (cidrRange === undefined) {
                ref = other;
                other = ref[0];
                cidrRange = ref[1];
            }

            if (other.kind() !== "ipv4") {
                throw new Error("ipaddr: cannot match ipv4 address with non-ipv4 one");
            }

            return matchCIDR(this.octets, other.octets, 8, cidrRange);
        };

        // returns a number of leading ones in IPv4 address, making sure that
        // the rest is a solid sequence of 0's (valid netmask)
        // returns either the CIDR length or null if mask is not valid
        IPv4.prototype.prefixLengthFromSubnetMask = function () {
            let cidr = 0;
            // non-zero encountered stop scanning for zeroes
            let stop = false;
            // number of zeroes in octet
            const zerotable = {
                0: 8, 128: 7, 192: 6, 224: 5, 240: 4, 248: 3, 252: 2, 254: 1, 255: 0
            };
            let i, octet, zeros;

            for (i = 3; i >= 0; i -= 1) {
                octet = this.octets[i];
                if (octet in zerotable) {
                    zeros = zerotable[octet];
                    if (stop && zeros !== 0) {
                        return null;
                    }

                    if (zeros !== 8) {
                        stop = true;
                    }

                    cidr += zeros;
                } else {
                    return null;
                }
            }

            return 32 - cidr;
        };

        // Checks if the address corresponds to one of the special ranges.
        IPv4.prototype.range = function () {
            return ipaddr.subnetMatch(this, this.SpecialRanges);
        };

        // Returns an array of byte-sized values in network order (MSB first)
        IPv4.prototype.toByteArray = function () {
            return this.octets.slice(0);
        };

        // Converts this IPv4 address to an IPv4-mapped IPv6 address.
        IPv4.prototype.toIPv4MappedAddress = function () {
            return ipaddr.IPv6.parse(`::ffff:${this.toString()}`);
        };

        // Symmetrical method strictly for aligning with the IPv6 methods.
        IPv4.prototype.toNormalizedString = function () {
            return this.toString();
        };

        // Returns the address in convenient, decimal-dotted format.
        IPv4.prototype.toString = function () {
            return this.octets.join(".");
        };

        return IPv4;
    })();

    // A utility function to return broadcast address given the IPv4 interface and prefix length in CIDR notation
    ipaddr.IPv4.broadcastAddressFromCIDR = function (string) {

        try {
            const cidr = this.parseCIDR(string);
            const ipInterfaceOctets = cidr[0].toByteArray();
            const subnetMaskOctets = this.subnetMaskFromPrefixLength(cidr[1]).toByteArray();
            const octets = [];
            let i = 0;
            while (i < 4) {
                // Broadcast address is bitwise OR between ip interface and inverted mask
                octets.push(parseInt(ipInterfaceOctets[i], 10) | parseInt(subnetMaskOctets[i], 10) ^ 255);
                i++;
            }

            return new this(octets);
        } catch (e) {
            throw new Error("ipaddr: the address does not have IPv4 CIDR format");
        }
    };

    // Checks if a given string is formatted like IPv4 address.
    ipaddr.IPv4.isIPv4 = function (string) {
        return this.parser(string) !== null;
    };

    // Checks if a given string is a valid IPv4 address.
    ipaddr.IPv4.isValid = function (string) {
        try {
            new this(this.parser(string));
            return true;
        } catch (e) {
            return false;
        }
    };

    // Checks if a given string is a full four-part IPv4 Address.
    ipaddr.IPv4.isValidFourPartDecimal = function (string) {
        if (ipaddr.IPv4.isValid(string) && string.match(/^(0|[1-9]\d*)(\.(0|[1-9]\d*)){3}$/)) {
            return true;
        } else {
            return false;
        }
    };

    // A utility function to return network address given the IPv4 interface and prefix length in CIDR notation
    ipaddr.IPv4.networkAddressFromCIDR = function (string) {
        let cidr, i, ipInterfaceOctets, octets, subnetMaskOctets;

        try {
            cidr = this.parseCIDR(string);
            ipInterfaceOctets = cidr[0].toByteArray();
            subnetMaskOctets = this.subnetMaskFromPrefixLength(cidr[1]).toByteArray();
            octets = [];
            i = 0;
            while (i < 4) {
                // Network address is bitwise AND between ip interface and mask
                octets.push(parseInt(ipInterfaceOctets[i], 10) & parseInt(subnetMaskOctets[i], 10));
                i++;
            }

            return new this(octets);
        } catch (e) {
            throw new Error("ipaddr: the address does not have IPv4 CIDR format");
        }
    };

    // Tries to parse and validate a string with IPv4 address.
    // Throws an error if it fails.
    ipaddr.IPv4.parse = function (string) {
        const parts = this.parser(string);

        if (parts === null) {
            throw new Error("ipaddr: string is not formatted like an IPv4 Address");
        }

        return new this(parts);
    };

    // Parses the string as an IPv4 Address with CIDR Notation.
    ipaddr.IPv4.parseCIDR = function (string) {
        let match;

        if ((match = string.match(/^(.+)\/(\d+)$/))) {
            const maskLength = parseInt(match[2]);
            if (maskLength >= 0 && maskLength <= 32) {
                const parsed = [this.parse(match[1]), maskLength];
                Object.defineProperty(parsed, "toString", {
                    value: function () {
                        return this.join("/");
                    }
                });
                return parsed;
            }
        }

        throw new Error("ipaddr: string is not formatted like an IPv4 CIDR range");
    };

    // Classful variants (like a.b, where a is an octet, and b is a 24-bit
    // value representing last three octets; this corresponds to a class C
    // address) are omitted due to classless nature of modern Internet.
    ipaddr.IPv4.parser = function (string) {
        let match, part, value;

        // parseInt recognizes all that octal & hexadecimal weirdness for us
        if ((match = string.match(ipv4Regexes.fourOctet))) {
            return (function () {
                const ref = match.slice(1, 6);
                const results = [];

                for (let i = 0; i < ref.length; i++) {
                    part = ref[i];
                    results.push(parseIntAuto(part));
                }

                return results;
            })();
        } else if ((match = string.match(ipv4Regexes.longValue))) {
            value = parseIntAuto(match[1]);
            if (value > 0xffffffff || value < 0) {
                throw new Error("ipaddr: address outside defined range");
            }

            return ((function () {
                const results = [];
                let shift;

                for (shift = 0; shift <= 24; shift += 8) {
                    results.push((value >> shift) & 0xff);
                }

                return results;
            })()).reverse();
        } else if ((match = string.match(ipv4Regexes.twoOctet))) {
            return (function () {
                const ref = match.slice(1, 4);
                const results = [];

                value = parseIntAuto(ref[1]);
                if (value > 0xffffff || value < 0) {
                    throw new Error("ipaddr: address outside defined range");
                }

                results.push(parseIntAuto(ref[0]));
                results.push((value >> 16) & 0xff);
                results.push((value >> 8) & 0xff);
                results.push(value & 0xff);

                return results;
            })();
        } else if ((match = string.match(ipv4Regexes.threeOctet))) {
            return (function () {
                const ref = match.slice(1, 5);
                const results = [];

                value = parseIntAuto(ref[2]);
                if (value > 0xffff || value < 0) {
                    throw new Error("ipaddr: address outside defined range");
                }

                results.push(parseIntAuto(ref[0]));
                results.push(parseIntAuto(ref[1]));
                results.push((value >> 8) & 0xff);
                results.push(value & 0xff);

                return results;
            })();
        } else {
            return null;
        }
    };

    // A utility function to return subnet mask in IPv4 format given the prefix length
    ipaddr.IPv4.subnetMaskFromPrefixLength = function (prefix) {
        prefix = parseInt(prefix);
        if (prefix < 0 || prefix > 32) {
            throw new Error("ipaddr: invalid IPv4 prefix length");
        }

        const octets = [0, 0, 0, 0];
        let j = 0;
        const filledOctetCount = Math.floor(prefix / 8);

        while (j < filledOctetCount) {
            octets[j] = 255;
            j++;
        }

        if (filledOctetCount < 4) {
            octets[filledOctetCount] = Math.pow(2, prefix % 8) - 1 << 8 - (prefix % 8);
        }

        return new this(octets);
    };

    // An IPv6 address (RFC2460)
    ipaddr.IPv6 = (function () {
        // Constructs an IPv6 address from an array of eight 16 - bit parts
        // or sixteen 8 - bit parts in network order(MSB first).
        // Throws an error if the input is invalid.
        function IPv6(parts, zoneId) {
            let i, part;

            if (parts.length === 16) {
                this.parts = [];
                for (i = 0; i <= 14; i += 2) {
                    this.parts.push((parts[i] << 8) | parts[i + 1]);
                }
            } else if (parts.length === 8) {
                this.parts = parts;
            } else {
                throw new Error("ipaddr: ipv6 part count should be 8 or 16");
            }

            for (i = 0; i < this.parts.length; i++) {
                part = this.parts[i];
                if (!((0 <= part && part <= 0xffff))) {
                    throw new Error("ipaddr: ipv6 part should fit in 16 bits");
                }
            }

            if (zoneId) {
                this.zoneId = zoneId;
            }
        }

        // Special IPv6 ranges
        IPv6.prototype.SpecialRanges = {
            // RFC4291, here and after
            unspecified: [new IPv6([0, 0, 0, 0, 0, 0, 0, 0]), 128],
            linkLocal: [new IPv6([0xfe80, 0, 0, 0, 0, 0, 0, 0]), 10],
            multicast: [new IPv6([0xff00, 0, 0, 0, 0, 0, 0, 0]), 8],
            loopback: [new IPv6([0, 0, 0, 0, 0, 0, 0, 1]), 128],
            uniqueLocal: [new IPv6([0xfc00, 0, 0, 0, 0, 0, 0, 0]), 7],
            ipv4Mapped: [new IPv6([0, 0, 0, 0, 0, 0xffff, 0, 0]), 96], // RFC6145
            rfc6145: [new IPv6([0, 0, 0, 0, 0xffff, 0, 0, 0]), 96], // RFC6052
            rfc6052: [new IPv6([0x64, 0xff9b, 0, 0, 0, 0, 0, 0]), 96], // RFC3056
            "6to4": [new IPv6([0x2002, 0, 0, 0, 0, 0, 0, 0]), 16], // RFC6052, RFC6146
            teredo: [new IPv6([0x2001, 0, 0, 0, 0, 0, 0, 0]), 32], // RFC4291
            reserved: [[new IPv6([0x2001, 0xdb8, 0, 0, 0, 0, 0, 0]), 32]]
        };

        // Checks if this address is an IPv4-mapped IPv6 address.
        IPv6.prototype.isIPv4MappedAddress = function () {
            return this.range() === "ipv4Mapped";
        };

        // The 'kind' method exists on both IPv4 and IPv6 classes.
        IPv6.prototype.kind = function () {
            return "ipv6";
        };

        // Checks if this address matches other one within given CIDR range.
        IPv6.prototype.match = function (other, cidrRange) {
            let ref;

            if (cidrRange === undefined) {
                ref = other;
                other = ref[0];
                cidrRange = ref[1];
            }

            if (other.kind() !== "ipv6") {
                throw new Error("ipaddr: cannot match ipv6 address with non-ipv6 one");
            }

            return matchCIDR(this.parts, other.parts, 16, cidrRange);
        };

        // returns a number of leading ones in IPv6 address, making sure that
        // the rest is a solid sequence of 0's (valid netmask)
        // returns either the CIDR length or null if mask is not valid
        IPv6.prototype.prefixLengthFromSubnetMask = function () {
            let cidr = 0;
            // non-zero encountered stop scanning for zeroes
            let stop = false;
            // number of zeroes in octet
            const zerotable = {
                0: 16,
                32768: 15,
                49152: 14,
                57344: 13,
                61440: 12,
                63488: 11,
                64512: 10,
                65024: 9,
                65280: 8,
                65408: 7,
                65472: 6,
                65504: 5,
                65520: 4,
                65528: 3,
                65532: 2,
                65534: 1,
                65535: 0
            };
            let part, zeros;

            for (let i = 7; i >= 0; i -= 1) {
                part = this.parts[i];
                if (part in zerotable) {
                    zeros = zerotable[part];
                    if (stop && zeros !== 0) {
                        return null;
                    }

                    if (zeros !== 16) {
                        stop = true;
                    }

                    cidr += zeros;
                } else {
                    return null;
                }
            }

            return 128 - cidr;
        };


        // Checks if the address corresponds to one of the special ranges.
        IPv6.prototype.range = function () {
            return ipaddr.subnetMatch(this, this.SpecialRanges);
        };

        // Returns an array of byte-sized values in network order (MSB first)
        IPv6.prototype.toByteArray = function () {
            let part;
            const bytes = [];
            const ref = this.parts;
            for (let i = 0; i < ref.length; i++) {
                part = ref[i];
                bytes.push(part >> 8);
                bytes.push(part & 0xff);
            }

            return bytes;
        };

        // Returns the address in expanded format with all zeroes included, like
        // 2001:0db8:0008:0066:0000:0000:0000:0001
        IPv6.prototype.toFixedLengthString = function () {
            const addr = ((function () {
                const results = [];
                for (let i = 0; i < this.parts.length; i++) {
                    results.push(padPart(this.parts[i].toString(16), 4));
                }

                return results;
            }).call(this)).join(":");

            let suffix = "";

            if (this.zoneId) {
                suffix = `%${this.zoneId}`;
            }

            return addr + suffix;
        };

        // Converts this address to IPv4 address if it is an IPv4-mapped IPv6 address.
        // Throws an error otherwise.
        IPv6.prototype.toIPv4Address = function () {
            if (!this.isIPv4MappedAddress()) {
                throw new Error("ipaddr: trying to convert a generic ipv6 address to ipv4");
            }

            const ref = this.parts.slice(-2);
            const high = ref[0];
            const low = ref[1];

            return new ipaddr.IPv4([high >> 8, high & 0xff, low >> 8, low & 0xff]);
        };

        // Returns the address in expanded format with all zeroes included, like
        // 2001:db8:8:66:0:0:0:1
        //
        // Deprecated: use toFixedLengthString() instead.
        IPv6.prototype.toNormalizedString = function () {
            const addr = ((function () {
                const results = [];

                for (let i = 0; i < this.parts.length; i++) {
                    results.push(this.parts[i].toString(16));
                }

                return results;
            }).call(this)).join(":");

            let suffix = "";

            if (this.zoneId) {
                suffix = `%${this.zoneId}`;
            }

            return addr + suffix;
        };

        // Returns the address in compact, human-readable format like
        // 2001:db8:8:66::1
        // in line with RFC 5952 (see https://tools.ietf.org/html/rfc5952#section-4)
        IPv6.prototype.toRFC5952String = function () {
            const regex = /((^|:)(0(:|$)){2,})/g;
            const string = this.toNormalizedString();
            let bestMatchIndex = 0;
            let bestMatchLength = -1;
            let match;

            while ((match = regex.exec(string))) {
                if (match[0].length > bestMatchLength) {
                    bestMatchIndex = match.index;
                    bestMatchLength = match[0].length;
                }
            }

            if (bestMatchLength < 0) {
                return string;
            }

            return `${string.substring(0, bestMatchIndex)}::${string.substring(bestMatchIndex + bestMatchLength)}`;
        };

        // Returns the address in compact, human-readable format like
        // 2001:db8:8:66::1
        //
        // Deprecated: use toRFC5952String() instead.
        IPv6.prototype.toString = function () {
            // Replace the first sequence of 1 or more '0' parts with '::'
            return this.toNormalizedString().replace(/((^|:)(0(:|$))+)/, "::");
        };

        return IPv6;

    })();

    // Checks if a given string is formatted like IPv6 address.
    ipaddr.IPv6.isIPv6 = function (string) {
        return this.parser(string) !== null;
    };

    // Checks to see if string is a valid IPv6 Address
    ipaddr.IPv6.isValid = function (string) {

        // Since IPv6.isValid is always called first, this shortcut
        // provides a substantial performance gain.
        if (typeof string === "string" && string.indexOf(":") === -1) {
            return false;
        }

        try {
            const addr = this.parser(string);
            new this(addr.parts, addr.zoneId);
            return true;
        } catch (e) {
            return false;
        }
    };

    // Tries to parse and validate a string with IPv6 address.
    // Throws an error if it fails.
    ipaddr.IPv6.parse = function (string) {
        const addr = this.parser(string);

        if (addr.parts === null) {
            throw new Error("ipaddr: string is not formatted like an IPv6 Address");
        }

        return new this(addr.parts, addr.zoneId);
    };

    ipaddr.IPv6.parseCIDR = function (string) {
        let maskLength, match, parsed;

        if ((match = string.match(/^(.+)\/(\d+)$/))) {
            maskLength = parseInt(match[2]);
            if (maskLength >= 0 && maskLength <= 128) {
                parsed = [this.parse(match[1]), maskLength];
                Object.defineProperty(parsed, "toString", {
                    value: function () {
                        return this.join("/");
                    }
                });
                return parsed;
            }
        }

        throw new Error("ipaddr: string is not formatted like an IPv6 CIDR range");
    };

    // Parse an IPv6 address.
    ipaddr.IPv6.parser = function (string) {
        let addr, i, match, octet, octets, zoneId;

        if ((match = string.match(ipv6Regexes.deprecatedTransitional))) {
            return this.parser(`::ffff:${match[1]}`);
        }
        if (ipv6Regexes.native.test(string)) {
            return expandIPv6(string, 8);
        }
        if ((match = string.match(ipv6Regexes.transitional))) {
            zoneId = match[6] || "";
            addr = expandIPv6(match[1].slice(0, -1) + zoneId, 6);
            if (addr.parts) {
                octets = [parseInt(match[2]), parseInt(match[3]), parseInt(match[4]), parseInt(match[5])];
                for (i = 0; i < octets.length; i++) {
                    octet = octets[i];
                    if (!((0 <= octet && octet <= 255))) {
                        return null;
                    }
                }

                addr.parts.push(octets[0] << 8 | octets[1]);
                addr.parts.push(octets[2] << 8 | octets[3]);
                return {
                    parts: addr.parts, zoneId: addr.zoneId
                };
            }
        }

        return null;
    };

    // Try to parse an array in network order (MSB first) for IPv4 and IPv6
    ipaddr.fromByteArray = function (bytes) {
        const length = bytes.length;

        if (length === 4) {
            return new ipaddr.IPv4(bytes);
        } else if (length === 16) {
            return new ipaddr.IPv6(bytes);
        } else {
            throw new Error("ipaddr: the binary input is neither an IPv6 nor IPv4 address");
        }
    };

    // Checks if the address is valid IP address
    ipaddr.isValid = function (string) {
        return ipaddr.IPv6.isValid(string) || ipaddr.IPv4.isValid(string);
    };

    // Attempts to parse an IP Address, first through IPv6 then IPv4.
    // Throws an error if it could not be parsed.
    ipaddr.parse = function (string) {
        if (ipaddr.IPv6.isValid(string)) {
            return ipaddr.IPv6.parse(string);
        } else if (ipaddr.IPv4.isValid(string)) {
            return ipaddr.IPv4.parse(string);
        } else {
            throw new Error("ipaddr: the address has neither IPv6 nor IPv4 format");
        }
    };

    // Attempt to parse CIDR notation, first through IPv6 then IPv4.
    // Throws an error if it could not be parsed.
    ipaddr.parseCIDR = function (string) {
        try {
            return ipaddr.IPv6.parseCIDR(string);
        } catch (e) {
            try {
                return ipaddr.IPv4.parseCIDR(string);
            } catch (e2) {
                throw new Error("ipaddr: the address has neither IPv6 nor IPv4 CIDR format");
            }
        }
    };

    // Parse an address and return plain IPv4 address if it is an IPv4-mapped address
    ipaddr.process = function (string) {
        const addr = this.parse(string);

        if (addr.kind() === "ipv6" && addr.isIPv4MappedAddress()) {
            return addr.toIPv4Address();
        } else {
            return addr;
        }
    };

    // An utility function to ease named range matching. See examples below.
    // rangeList can contain both IPv4 and IPv6 subnet entries and will not throw errors
    // on matching IPv4 addresses to IPv6 ranges or vice versa.
    ipaddr.subnetMatch = function (address, rangeList, defaultName) {
        let i, rangeName, rangeSubnets, subnet;

        if (defaultName === undefined || defaultName === null) {
            defaultName = "unicast";
        }

        for (rangeName in rangeList) {
            if (Object.prototype.hasOwnProperty.call(rangeList, rangeName)) {
                rangeSubnets = rangeList[rangeName];
                // ECMA5 Array.isArray isn't available everywhere
                if (rangeSubnets[0] && !(rangeSubnets[0] instanceof Array)) {
                    rangeSubnets = [rangeSubnets];
                }

                for (i = 0; i < rangeSubnets.length; i++) {
                    subnet = rangeSubnets[i];
                    if (address.kind() === subnet[0].kind() && address.match.apply(address, subnet)) {
                        return rangeName;
                    }
                }
            }
        }

        return defaultName;
    };

    // Export for both the CommonJS and browser-like environment
    if (typeof module !== "undefined" && module.exports) {
        module.exports = ipaddr;

    } else {
        root.ipaddr = ipaddr;
    }

})(dermalog.dl_common);
