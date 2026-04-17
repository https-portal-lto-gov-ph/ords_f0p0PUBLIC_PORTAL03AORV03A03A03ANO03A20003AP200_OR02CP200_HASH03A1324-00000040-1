/**
 *
 * Copyright: DERMALOG Identification Systems GmbH, Hamburg - Germany, 2013-2020.
 *
 * WWirns   06.01.2020  Initial version
 * WWirns   24.03.2021  Add default handler function for "unhandledrejection" events of promises
 * WWirns   20.07.2021  Check also against ".Message"
 * WWirns   05.08.2021  Polyfill "Object.is"
 * WWirns   02.09.2021  Fix typo x => window
 * WWirns   21.01.2022  Polyfill "Array.prototype.includes"
 * WWirns   13.06.2022  Add use strict and shorten the source
 * WWirns   01.08.2022  Add version object to namespace
 * WWirns   27.10.2022  User String(...) instead of .toString()
 * WWirns   11.01.2023  Extend version object of namespace
 **/

"use strict";

var dermalog = (typeof dermalog === "object" && dermalog !== null ? dermalog : {});
dermalog.version = {
    toString: function () {
        return String(this.major) + "." + String(this.minor) + "." + ("0000" + this.patch).slice(-4);
    }
    , major: 1, minor: 0, patch: 30
};

// Polyfill "Object.is"
if (!Object.is) {
    Object.is = function (x, y) {
        "use strict";
        // SameValue algorithm
        if (x === y) { // Steps 1-5, 7-10
            // Steps 6.b-6.e: +0 != -0
            return x !== 0 || 1 / x === 1 / y;
        } else {
            // Step 6.a: NaN == NaN
            return x !== x && y !== y;
        }
    };
}

// Polyfill "Array.prototype.includes"
// https://tc39.github.io/ecma262/#sec-array.prototype.includes
if (!Array.prototype.includes) {
    Object.defineProperty(Array.prototype, "includes", {
        value: function (searchElement, fromIndex) {
            "use strict";
            if (this == null) {
                throw new TypeError("\"this\" is null or not defined");
            }
            // 1. Let O be ? ToObject(this value).
            var o = Object(this);
            // 2. Let len be ? ToLength(? Get(O, "length")).
            var len = o.length >>> 0;
            // 3. If len is 0, return false.
            if (len === 0) {
                return false;
            }
            // 4. Let n be ? ToInteger(fromIndex).
            //    (If fromIndex is undefined, this step produces the value 0.)
            var n = fromIndex | 0;
            // 5. If n ≥ 0, then
            //  a. Let k be n.
            // 6. Else n < 0,
            //  a. Let k be len + n.
            //  b. If k < 0, let k be 0.
            var k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

            function sameValueZero(x, y) {
                return x === y || (typeof x === "number" && typeof y === "number" && isNaN(x) && isNaN(y));
            }

            // 7. Repeat, while k < len
            while (k < len) {
                // a. Let elementK be the result of ? Get(O, ! ToString(k)).
                // b. If SameValueZero(searchElement, elementK) is true, return true.
                if (sameValueZero(o[k], searchElement)) {
                    return true;
                }
                // c. Increase k by 1.
                k++;
            }
            // 8. Return false
            return false;
        }
    });
}

dermalog.defErrorHandler = function (pEventOrMessage /*, pURL, pLineNumber, pColNumber, pError*/) {
    "use strict";
    let result, msg, preventMsg;
    result = true;
    msg = "Script Error:<br>Perhaps you should reload the page!?";
    preventMsg = false;

    if (typeof pEventOrMessage === "string") {
        if (pEventOrMessage.toLowerCase().indexOf("script error") > -1) {
            msg = "Cross Side Script Error:<br>Perhaps you should reload the page!?";
        }
        msg = pEventOrMessage;
    } else {
        // It is an Event
        if (false || ( /* pEventOrMessage.bubbles && */ pEventOrMessage.cancelable)) {
            if (pEventOrMessage.stopPropagation) {
                try {
                    pEventOrMessage.stopPropagation();
                } catch (e) {
                    console.log("\".stopPropagation()\" raises:" + e.message);
                }
            }
        }
        if (false || (pEventOrMessage.defaultPrevented)) {
            if (pEventOrMessage.preventDefault) {
                try {
                    pEventOrMessage.preventDefault();
                } catch (e) {
                    console.log("\".preventDefault()\" raises:" + e.message);
                }
            }
        }
        pEventOrMessage.returnValue = result;
        msg = pEventOrMessage.message;
        if (pEventOrMessage.error instanceof EvalError) {
            if (pEventOrMessage.error.message === "Possible side-effect in debug-evaluate") {
                preventMsg = true;
            }
        }
    }
    try {
        if (!preventMsg) {
            dermalog.dl_common.apps.ApexShowError(msg, {unsafe: false});
        }
    } catch (e) {
        alert(e.message);
    }
    return result;
};

dermalog.defUnhandledRejectionHandler = function (pEventOrMessage) {
    "use strict";
    //
    // pEventOrMessage.promise
    // pEventOrMessage.type: "unhandledrejection"
    // pEventOrMessage.reason.stack
    // pEventOrMessage.reason.message
    let result, msg;
    result = true;
    msg = "Script Error:<br>Perhaps you should reload the page!?";
    if (typeof pEventOrMessage === "string") {
        if (pEventOrMessage.toLowerCase().indexOf("script error") > -1) {
            msg = "Cross Side Script Error:<br>Perhaps you should reload the page!?";
        }
        msg = pEventOrMessage;
    } else {
        // It is an Event of "PromiseRejectionEvent"
        if (true || (/* pEventOrMessage.bubbles && */ pEventOrMessage.cancelable)) {
            if (pEventOrMessage.stopPropagation) {
                try {
                    pEventOrMessage.stopPropagation();
                } catch (e) {
                    console.log("\".stopPropagation()\" raises:" + e.message);
                }
            }
        }
        if (true || (pEventOrMessage.defaultPrevented)) {
            if (pEventOrMessage.preventDefault) {
                try {
                    pEventOrMessage.preventDefault();
                } catch (e) {
                    console.log("\".preventDefault()\" raises:" + e.message);
                }
            }
        }
        pEventOrMessage.returnValue = result;
        if (pEventOrMessage instanceof PromiseRejectionEvent) {
            msg = "Promise rejected with value[" + String(pEventOrMessage.reason) + "]!";
        } else {
            if (typeof pEventOrMessage.reason.Message === "string") {
                msg = pEventOrMessage.reason.Message;
            } else if (typeof pEventOrMessage.reason.message === "string") {
                msg = pEventOrMessage.reason.message;
            } else if (typeof pEventOrMessage.reason === "string") {
                msg = pEventOrMessage.reason;
            } else {
                console.log("dermalog.defUnhandledRejectionHandler", arguments);
                throw new Error("Message for exception not found!");
            }
        }
    }
    try {
        dermalog.dl_common.apps.ApexShowError(msg, {unsafe: false});
    } catch (e) {
        alert(e.message);
    }
    return result;
};

if (window.addEventListener) {
    // For all major browsers, except IE 8 and earlier
    window.addEventListener("error", dermalog.defErrorHandler);
    window.addEventListener("unhandledrejection", dermalog.defUnhandledRejectionHandler);
} else if (window.attachEvent) {
    // For IE 8 and earlier versions
    window.attachEvent("on" + "error", dermalog.defErrorHandler);
    window.attachEvent("on" + "unhandledrejection", dermalog.defUnhandledRejectionHandler);
}
