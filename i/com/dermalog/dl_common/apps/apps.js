/**
 *
 * Copyright: DERMALOG Identification Systems GmbH, Hamburg - Germany, 2013-2020.
 *
 * WWirns   06.01.2020  Initial version
 * WWirns   11.03.2020  Add sessionTimeoutObserver
 * WWirns   26.08.2020  Do not start sessionTimeoutObserver on APEX-Version >= 19, because it has its own session timeout handling
 * WWirns   11.11.2020  Add option "isShowMsgInsteadReload4Idle" to sessionTimeoutObserver
 * WWirns   11.11.2020  Add function "ApexShowAlert"
 * WWirns   16.12.2020  Add functions "ApexUrlSplitParam" and "ApexUrlConcat"
 * WWirns   18.12.2020  Extend sessionTimeoutObserver
 * WWirns   20.12.2020  Change "isShowMsgInsteadReload4Idle" to "onExpiredActionFlag4*"
 * WWirns   21.12.2020  Add additional options to sessionTimeoutObserver for a better interface
 * WWirns   22.01.2021  Remove case differences from sessionTimeoutObserver if user is "nobody"
 * WWirns   15.02.2021  Ensure that pOptions.dataType has a value
 * WWirns   17.02.2021  Add error handling of failing server call to sessionTimeoutObserver
 * WWirns   18.02.2021  Cancel warn on unsaved data before reload
 * WWirns   24.03.2021  Change removing alert messages on session has expired
 * WWirns   25.03.2021  Alert-Messages are not removed
 * WWirns   25.03.2021  On failing set id of alertdialog try it by setTimeout
 * WWirns   26.03.2021  Add Hide-Option to ApexShowError
 * WWirns   02.08.2021  Extend ApexShowError to show an array of errors
 * WWirns   02.08.2021  Add function DefaultActionAfterShowError
 * WWirns   03.08.2021  Add function DefaultActionAfterShowSuccess
 * WWirns   05.08.2021  Add param pPreserveMsgCnt to ApexShowError
 * WWirns   09.09.2021  Return in "ApexServerProcess" an own promise
 * WWirns   10.09.2021  Return everywhere a JSON if JSON is requested as return type
 * WWirns   18.10.2021  Add function "DefaultOnPageLoad"
 * WWirns   21.10.2021  Do not fade out any "t_Alert_*", instead call click()
 * WWirns   22.10.2021  Remove function DefaultActionAfterShowError
 * WWirns   22.10.2021  Remove function DefaultActionAfterShowSuccess
 * WWirns   22.10.2021  Overwork "OnPageQryParamSuccessMsg", "ThemeHookBeforeShow" and "ThemeHookBeforeHide"
 * WWirns   10.11.2021  Check for error messages as JSON_STATUS_OBJECT
 * WWirns   13.01.2022  Change message
 * WWirns   13.01.2022  Check JQuery objects with its length attribute instead with the index operator
 * WWirns   14.01.2022  Add CreateOneZoomImage and MakeOneZoomImage
 * WWirns   18.01.2022  Change camel case
 * WWirns   23.02.2022  Add function dermalog.dl_common.apps.cancelPage
 * WWirns   23.02.2022  Some minor refactorings
 * WWirns   24.02.2022  Ask and repeat CheckUrlConnect
 * WWirns   03.03.2022  Overwork OneZoomImage, because of differences between APEX 5 and APEX 18.
 * WWirns   03.03.2022  Make OneZoomImage more robust
 * WWirns   07.03.2022  Prevent reinitializing of source for OneZoomImage
 * WWirns   09.05.2022  Add functions GetCheckedURL, getLocalizedMessage, setLocalizedMessages and getLuhnCheckDigit
 * WWirns   10.05.2022  Add parameter pOptions to function ApexUrlSplitParam
 * WWirns   18.05.2022  Embed all IF/ELSE into a block
 * WWirns   27.06.2022  Refactor anything
 * WWirns   11.08.2022  Add function closeUnneededAlertDlgs
 * WWirns   16.08.2022  Add function getApexUrlType and member apexUrlType
 * WWirns   16.08.2022  Add raise error to function reloadApexUrl
 * WWirns   16.08.2022  Check sTitle against emptyness
 * WWirns   16.08.2022  Check against pAPPS.apexUrlType
 * WWirns   15.09.2022  Extend function pAPPS.getApexUrlType and add urlType to result object and pOptions
 * WWirns   02.10.2022  Add callBacks option to ApexShowError
 * WWirns   11.10.2022  Support also img.href
 * WWirns   12.10.2022  Make "makeOneZoomImage" more robust and versatile
 * WWirns   24.10.2022  Check whether pJqParent is realy a JQuery object
 * WWirns   27.10.2022  Add functions confirm and alert as a copy from APEX version 21 and make fittings for APEX 21
 * WWirns   27.10.2022  Add function isVersionPassed
 * WWirns   27.10.2022  Replace functions apex.message.alert and .confirm with implementations of dermalog.dl_common.apps
 * WWirns   27.10.2022  User String(...) instead of .toString()
 * WWirns   09.11.2022  Message-Window does not fit to content, instead it scrolls!
 * WWirns   23.11.2022  On error of the calling procedure reject the returned promise
 * WWirns   23.11.2022  Catch undefined pErrorData
 * WWirns   11.01.2023  Add version object to namespace
 * WWirns   11.01.2023  Change handling of returned error code from the server process
 * WWirns   31.01.2023  Use internal "lTextStatus" in further callbacks, because of the "TextStatus" is reassigned
 * WWirns   28.03.2023  Change assignment of "location.href" to a call of "apex.navigation.redirect"
 * WWirns   17.07.2023  Extend REGEX_SESSION_EXPIRED
 * WWirns   17.07.2023  ApexShowError:Add support for items
 **/

"use strict";

dermalog.dl_common.sessionTimeoutObserver = {};
dermalog.dl_common.sessionTimeoutObserver.version = {
    toString: function () {
        return String(this.major) + "." + String(this.minor) + "." + ("0000" + this.patch).slice(-4);
    }
    , major: 1, minor: 1, patch: 454
};

dermalog.dl_common.apps = {};
dermalog.dl_common.apps.version = {
    toString: function () {
        return String(this.major) + "." + String(this.minor) + "." + ("0000" + this.patch).slice(-4);
    }
    , major: 1, minor: 2, patch: 0
};

/**
 * @public
 * @function dermalog.dl_common.makeSessionTimeoutObserver
 */
(function (pSessionTimeoutObserver) {
    "use strict";

    /* TODO:Consider APEX setting "Rejoin Session"
            Habe außerdem die LOGOUT_URL auf „Rejoin Session - Enabled for Public Sessions“ gesetzt.
            Nun wird beim neu laden keine neue Apex Session erzeugt.

    if (!dermalog.dl_common.utils.isPassedNeededVersion([20, 1], gApexVersion.match(/([0-9]+)/gim))) {
        dermalog.dl_common.sessionTimeoutObserver.Init(true, {
          reloadUrl4Idle : '&LOGOUT_URL.'
        , reloadUrl4Life : '&LOGOUT_URL.'
        });
    }

     */

    /**
     * @private
     * @constant
     * @type {object}
     * @memberOf pSessionTimeoutObserver
     */
    const _FLAGS = {
        SHOW_WARNING: 1, UPDATE_WARNING: 2, DO_REFRESH_DATA: 256, EXE_REFRESH_DATA: 512
    };

    /**
     * @private
     * @var
     * @type {object}
     * @memberOf pSessionTimeoutObserver
     */
    let _internalData = {};

    /**
     * @private
     * @var
     * @type {object}
     * @memberOf pSessionTimeoutObserver
     */
    let _options = {
        pFlowId: null,
        pFlowStepId: null,
        id: null,
        onWillExpire: null,
        onExpired: null,
        onReload: null,
        reloadUrl4Idle: null,
        reloadUrl4Life: null,
        fallbackUrl: null, // onWillExpireActionFlag4Idle: 0 => Nothing; 1 => Show Msg;
        onWillExpireActionFlag4Idle: 1,
        onWillExpireActionFlag4Life: 1, // onExpiredActionFlag: 0 => Nothing; 1 => Show Msg; 2 => Do reload
        onExpiredActionFlag4Idle: 2,
        onExpiredActionFlag4Life: 2,
        showWarningBeforeSeconds: null,
        willExpireCfmTitle4Idle: "Idle session will expire!",
        willExpireCfmMsg4Idle: "Your session will expire in %SECONDS_LEFT% seconds due to inactivity!\nDo you want to break the timeout?",
        willExpireAltTitle4Idle: "Idle session will expire!",
        willExpireAltMsg4Idle: "Please, break your session idle timeout by performing any action!",
        willExpireCfmTitle4Life: "Session lifetime will expire!",
        willExpireCfmMsg4Life: "Your session lifetime will expire in %SECONDS_LEFT% seconds!\nDo you want to login again?",
        willExpireAltTitle4Life: "Session lifetime will expire!",
        willExpireAltMsg4Life: "Please, finish your work and login again!",
        expiredCfmTitle4Idle: "Idle session has expired!",
        expiredCfmMsg4Idle: "Do you want to login again?",
        expiredAltTitle4Idle: "Idle session has expired!",
        expiredAltMsg4Idle: "Please, login again!",
        expiredCfmTitle4Life: "Session lifetime has expired!",
        expiredCfmMsg4Life: "Do you want to reload the page?",
        expiredAltTitle4Life: "Session lifetime has expired!",
        expiredAltMsg4Life: "Please, reload the page!",
        isDisabled: false
    };

    /**
     * @private
     * @var
     * @type {object}
     * @memberOf pSessionTimeoutObserver
     */
    let _intervalData = {
        intervalID: null,
        firstIntervalOn: null,
        intervalFlagMask: null,
        currIntervalSeconds: null,
        onIntervalCounter: null,
        isShowMsgWillExpire: false,
        isShowMsgExpired: false
    };

    /**
     * @private
     * @var
     * @type {object}
     * @memberOf pSessionTimeoutObserver
     */
    let _SESSION_INFOS = {
        CLIENT_DATE: null,
        SERVER_DATE: null,
        SERVER_CLIENT_DIFF: null,
        USER_NAME: null,
        REMOTE_ADDR: null,
        SESSION_CREATED: null,
        SESSION_IDLE_TIMEOUT_ON: null,
        SESSION_LIFE_TIMEOUT_ON: null,
        SESSION_MAX_IDLE_SEC: null,
        SECONDS_LEFT: null,
        SECONDS_LEFT_REASON: null
    };

    /**
     * @private
     * @function
     * @memberOf pSessionTimeoutObserver
     */
    function intervalFlagsHas(pFlag) {
        return (_intervalData.intervalFlagMask & pFlag) === pFlag;
    }

    /**
     * @private
     * @function
     * @memberOf pSessionTimeoutObserver
     */
    function intervalFlagsAdd(pFlag) {
        _intervalData.intervalFlagMask |= pFlag;
    }

    /**
     * @private
     * @function
     * @memberOf pSessionTimeoutObserver
     */
    function intervalFlagsDel(pFlag) {
        if ((_intervalData.intervalFlagMask & pFlag) === pFlag) {
            _intervalData.intervalFlagMask -= pFlag;
        }
    }

    /**
     * @private
     * @function
     * @memberOf pSessionTimeoutObserver
     */
    function refreshTIMEOUT_ON(pAddFlags) {
        /*
        let lTmp = Math.floor(Math.max(1, _SESSION_INFOS.SECONDS_LEFT - _options.showWarningBeforeSeconds - 1));
        if (_intervalData.currIntervalSeconds !== lTmp) {
            stopInterval();
            startInterval(lTmp);
        }
         */
        if (pSessionTimeoutObserver.GetPriorTIMEOUT_ON() !== true) {
            if (!intervalFlagsHas(_FLAGS.EXE_REFRESH_DATA)) {
                intervalFlagsAdd(_FLAGS.EXE_REFRESH_DATA);
                dermalog.dl_common.apps.ApexServerProcess("SESSION_INFOS", {
                    x01: $v("pInstance"), x02: "ONLY_TIMEOUT_ON"
                }, {
                    dataType: "json", success: function (pData) {
                        // TODO: pData["StatusCode"] !== 0
                        // TODO: Raise error on server
                        // TODO: Delete session on server
                        _SESSION_INFOS.SESSION_IDLE_TIMEOUT_ON = new Date(pData.SESSION_IDLE_TIMEOUT_ON);
                        _SESSION_INFOS.SESSION_LIFE_TIMEOUT_ON = new Date(pData.SESSION_LIFE_TIMEOUT_ON);

                        let currWinObj = null;
                        for (let i = 0; i < window.top.frames.length; i++) {
                            currWinObj = window.top.frames[i];
                            if (currWinObj.dermalog && currWinObj.dermalog.dl_common && currWinObj.dermalog.dl_common.sessionTimeoutObserver && currWinObj.dermalog.dl_common.sessionTimeoutObserver.IsEnabled() === true) {
                                // Most top sibling is in charge, so dispose it the handling
                                currWinObj.dermalog.dl_common.sessionTimeoutObserver.GetPriorTIMEOUT_ON();
                            }
                        }

                        intervalFlagsDel(_FLAGS.DO_REFRESH_DATA);
                        intervalFlagsDel(_FLAGS.EXE_REFRESH_DATA);
                        if (pAddFlags) {
                            intervalFlagsAdd(pAddFlags);
                        }
                    }, error: function (pjqXHR, pTextStatus, pErrorThrown) {
                        let isHandled = false;
                        pSessionTimeoutObserver.Stop();
                        if (isHandled !== true) {
                            dermalog.dl_common.apps.ApexShowAlert("Stop Session-Observer due to no connection to the server!");
                        }
                    }
                });
            }
        }
    }

    /**
     * @private
     * @function
     * @memberOf pSessionTimeoutObserver
     */
    function isInterval() {
        return !!_intervalData.intervalID;
    }

    /**
     * @private
     * @function
     * @memberOf pSessionTimeoutObserver
     */
    function startInterval(pIntervalSeconds) {
        if (!_intervalData.intervalID) {
            _intervalData.currIntervalSeconds = Math.floor(pIntervalSeconds);
            _intervalData.intervalID = setInterval(onInterval, _intervalData.currIntervalSeconds * 1000);
            _intervalData.firstIntervalOn = new Date(new Date().valueOf() + _intervalData.currIntervalSeconds * 1000);
        }
    }

    /**
     * @private
     * @function
     * @memberOf pSessionTimeoutObserver
     */
    function stopInterval() {
        if (_intervalData.intervalID) {
            clearInterval(_intervalData.intervalID);
            _intervalData.firstIntervalOn = null;
            _intervalData.intervalID = null;
        }
    }

    /**
     * @private
     * @function
     * @memberOf pSessionTimeoutObserver
     */
    function replacePlaceholders(pMsg) {
        let key, val, regexp;
        for (key in _SESSION_INFOS) {
            val = _SESSION_INFOS[key];
            regexp = new RegExp("%" + key + "%", "gim");
            pMsg = pMsg.replace(regexp, val);
        }
        return pMsg;
    }

    /**
     * @private
     * @function
     * @memberOf pSessionTimeoutObserver
     */
    function recalculateSECONDS_LEFT() {
        let currDate = new Date();
        let timeoutOn;
        //
        // !!! Any request does extend the idle timeout, but the life timeout is never extended !!!
        // !!! So, it could occur that life timeout is lesser than the idle timeout !!!
        /*if (_SESSION_INFOS.USER_NAME === "nobody") {
            timeoutOn = _SESSION_INFOS.SESSION_LIFE_TIMEOUT_ON.valueOf();
            _SESSION_INFOS.SECONDS_LEFT_REASON = "LIFE";
        } else*/
        {
            timeoutOn = Math.min(_SESSION_INFOS.SESSION_LIFE_TIMEOUT_ON.valueOf(), _SESSION_INFOS.SESSION_IDLE_TIMEOUT_ON.valueOf());
            if (_SESSION_INFOS.SESSION_LIFE_TIMEOUT_ON.valueOf() <= _SESSION_INFOS.SESSION_IDLE_TIMEOUT_ON.valueOf()) {
                _SESSION_INFOS.SECONDS_LEFT_REASON = "LIFE";
            } else {
                _SESSION_INFOS.SECONDS_LEFT_REASON = "IDLE";
            }
        }

        _SESSION_INFOS.SECONDS_LEFT = Math.floor((timeoutOn - _SESSION_INFOS.SERVER_CLIENT_DIFF - currDate.valueOf()) / 1000);

        if (apex.debug.getLevel() >= apex.debug.LOG_LEVEL.INFO) {
            console.log("recalculateSECONDS_LEFT", "_SESSION_INFOS.SECONDS_LEFT", _SESSION_INFOS.SECONDS_LEFT);
            console.log("recalculateSECONDS_LEFT", "_SESSION_INFOS.SECONDS_LEFT_REASON", _SESSION_INFOS.SECONDS_LEFT_REASON);
        }
    }

    /**
     * @private
     * @function
     * @memberOf pSessionTimeoutObserver
     */
    function onInterval() {
        let lTitle;
        let lMsg;
        let lTmp;
        let currWinObj;
        let lOnExpiredActionFlag;
        let lOnWillExpireActionFlag;
        let isHandled4OnExpired = false;
        let isHandled4OnWillExpire = false;
        let jQuery = apex.util.getTopApex().jQuery;

        function reloadApexUrl() {
            let oResult = {isHandled: false, jqPromise: null};
            let dfd = $.Deferred();
            let sReloadUrl;
            let url;
            let isHandled = false;

            function doCheckUrlAndConnect(pURL) {
                let waitPopup = apex.widget.waitPopup();
                let urlURL = dermalog.dl_common.apps.GetCheckedURL(pURL.href);
                dermalog.dl_common.apps.CheckUrlConnect(urlURL.href)
                    .then(function (pResp) {
                            //console.log("then.done",arguments);
                            waitPopup.remove();
                            dermalog.dl_common.apps.cancelPage();
                            apex.navigation.redirect(urlURL.href);
                            console.log("Location changed 3", urlURL.href);
                            dfd.resolve(pResp);
                            return pResp;
                        }
                        , function (pResp) {
                            //console.log("then.fail", pResp, urlURL.href);
                            waitPopup.remove();
                            if (dermalog.dl_common.apps.closeUnneededAlertDlgs() === 0) {
                                dermalog.dl_common.apps.confirm("The URL is not reachable!\n\nTry again?"
                                    , function (pIsOk) {
                                        if (pIsOk) {
                                            doCheckUrlAndConnect(urlURL);
                                        } else {
                                            dfd.reject(pResp);
                                        }
                                    }
                                    , {title: "Reload page"}
                                );
                                /*
                                $("[role=\"alertdialog\"]").last().prop("id", "idCucConfirm");
                                $("#idCucConfirm").addClass("ui-dialog-no-close-x");
                                $("#idCucConfirm").find(".ui-dialog-content.ui-widget-content").dialog("option", "title", "Reload page");
                                 */
                            }
                        });
            }

            if (_options.onReload) {
                isHandled = _options.onReload(_SESSION_INFOS.SECONDS_LEFT_REASON);
                if (typeof isHandled === "object") {
                    isHandled = isHandled.isHandled;
                }
            }
            if (isHandled !== true) {
                if (_SESSION_INFOS.SECONDS_LEFT_REASON === "LIFE") {
                    if (typeof _options.reloadUrl4Life === "function") {
                        sReloadUrl = _options.reloadUrl4Life();
                    } else {
                        sReloadUrl = _options.reloadUrl4Life;
                    }
                } else {
                    //_SESSION_INFOS.SECONDS_LEFT_REASON === "IDLE"
                    if (typeof _options.reloadUrl4Idle === "function") {
                        sReloadUrl = _options.reloadUrl4Idle();
                    } else {
                        sReloadUrl = _options.reloadUrl4Idle;
                    }
                }
                if (!sReloadUrl) {
                    let oApexUrl = null;
                    try {
                        oApexUrl = dermalog.dl_common.apps.ApexUrlSplitParam(window.location.href);
                    } catch (err) {
                        if (err.message !== "Not a valid APEX-Url!") {
                            throw err;
                        }
                        if (typeof _options.fallbackUrl === "function") {
                            sReloadUrl = _options.fallbackUrl();
                        } else {
                            sReloadUrl = _options.fallbackUrl;
                        }
                        if (!sReloadUrl) {
                            throw new Error("\"location.href\" is not a valid APEX-Url and \"fallbackUrl\" is empty!");
                        }
                        url = dermalog.dl_common.apps.GetCheckedURL(sReloadUrl);
                        oApexUrl = dermalog.dl_common.apps.ApexUrlSplitParam(url.href);
                    }
                    //oApexUrl.session_id = (_SESSION_INFOS.SECONDS_LEFT_REASON === "LIFE" ? "" : oApexUrl.session_id);
                    oApexUrl.session_id = "";
                    if (oApexUrl.post_part.indexOf("&cs=") > -1) {
                        oApexUrl.page_id = "";
                        //oApexUrl.session_id = "";
                        oApexUrl.request = "";
                        //oApexUrl.debug = "";
                        oApexUrl.clear_cache = "";
                        oApexUrl.item_names = "";
                        oApexUrl.item_values = "";
                        //oApexUrl.printer_friendly = "";
                        //oApexUrl.post_part = oApexUrl.post_part.replace(/(&cs=[^&#]*)/gim);
                        oApexUrl.post_part = "";
                    }
                    sReloadUrl = dermalog.dl_common.apps.ApexUrlConcat(oApexUrl);
                }
                url = new URL(sReloadUrl);
                doCheckUrlAndConnect(url);
                oResult.jqPromise = dfd.promise();
                oResult.isHandled = true;
            }
            return oResult;
        }

        _intervalData.onIntervalCounter++;

        recalculateSECONDS_LEFT();

        if (intervalFlagsHas(_FLAGS.DO_REFRESH_DATA) /*&& _SESSION_INFOS.USER_NAME !== "nobody"*/) {
            if ((_SESSION_INFOS.SECONDS_LEFT - _intervalData.currIntervalSeconds) < _SESSION_INFOS.SESSION_MAX_IDLE_SEC) {
                refreshTIMEOUT_ON();
                return;
            }
        }

        if (_SESSION_INFOS.SECONDS_LEFT <= 0) {
            // Session has expired, so stop interval and do something
            stopInterval();
            pSessionTimeoutObserver.RemoveMsgWillExpire();
            pSessionTimeoutObserver.RemoveMsgExpired();

            if (_options.onExpired) {
                isHandled4OnExpired = _options.onExpired(_SESSION_INFOS.SECONDS_LEFT_REASON);
                if (typeof isHandled4OnExpired === "object") {
                    isHandled4OnExpired = isHandled4OnExpired.isHandled;
                }
            }

            if (isHandled4OnExpired !== true) {
                if (_SESSION_INFOS.SECONDS_LEFT_REASON === "LIFE") {
                    if (typeof _options.onExpiredActionFlag4Life === "function") {
                        lOnExpiredActionFlag = _options.onExpiredActionFlag4Life();
                    } else {
                        lOnExpiredActionFlag = _options.onExpiredActionFlag4Life;
                    }
                } else {
                    //_SESSION_INFOS.SECONDS_LEFT_REASON === "IDLE"
                    if (typeof _options.onExpiredActionFlag4Idle === "function") {
                        lOnExpiredActionFlag = _options.onExpiredActionFlag4Idle();
                    } else {
                        lOnExpiredActionFlag = _options.onExpiredActionFlag4Idle;
                    }
                }
                /*
                let currWindow = window;
                if (currWindow !== currWindow.parent){
                    // This is NOT the most top window (root window of existing hierarchy of windows)
                    // let the root the message shown
                    lOnExpiredActionFlag = 0;
                }
                 */
                /*
                if (lOnExpiredActionFlag === 1) {
                    let iLvl;
                    currWinObj = window;
                    for (iLvl = 0; true; iLvl++) {
                        if (currWinObj === currWinObj.parent)
                            break;
                        currWinObj = currWinObj.parent;
                        if (currWinObj.dermalog
                            && currWinObj.dermalog.dl_common
                            && currWinObj.dermalog.dl_common.sessionTimeoutObserver
                            && currWinObj.dermalog.dl_common.sessionTimeoutObserver.IsEnabled() === true
                        ) {
                            // Parent is in charge, so let the parent disposing the handling
                            lOnExpiredActionFlag = 0;
                            break;
                        }
                    }
                }
                 */
                if (lOnExpiredActionFlag === 1) {
                    currWinObj = window.top;
                    if (currWinObj !== window) {
                        // window.top is not me
                        if (currWinObj.dermalog && currWinObj.dermalog.dl_common && currWinObj.dermalog.dl_common.sessionTimeoutObserver && currWinObj.dermalog.dl_common.sessionTimeoutObserver.IsEnabled() === true) {
                            // Parent is in charge, so dispose it the handling
                            lOnExpiredActionFlag = 0;
                        }
                        if (lOnExpiredActionFlag === 1) {
                            for (let i = 0; i < window.top.frames.length; i++) {
                                currWinObj = window.top.frames[i];
                                if (currWinObj.dermalog && currWinObj.dermalog.dl_common && currWinObj.dermalog.dl_common.sessionTimeoutObserver && currWinObj.dermalog.dl_common.sessionTimeoutObserver.IsEnabled() === true) {
                                    // Most top sibling is in charge, so dispose it the handling
                                    lOnExpiredActionFlag = 0;
                                    break;
                                }
                            }
                        }
                    }
                }
                if (lOnExpiredActionFlag === 1) {
                    // Show message
                    _intervalData.isShowMsgExpired = true;
                    if (_SESSION_INFOS.SECONDS_LEFT_REASON === "LIFE") {
                        lTitle = _options.expiredCfmTitle4Life;
                        lMsg = _options.expiredCfmMsg4Life;
                    } else {
                        //_SESSION_INFOS.SECONDS_LEFT_REASON === "IDLE"
                        lTitle = _options.expiredCfmTitle4Idle;
                        lMsg = _options.expiredCfmMsg4Idle;
                    }
                    //lTitle = replacePlaceholders(lTitle);
                    //lMsg = $v("pFlowId") + "." + $v("pFlowStepId") + ":\n" + lMsg;
                    lMsg = replacePlaceholders(lMsg);
                    try {
                        dermalog.dl_common.apps.confirm(lMsg
                            , function (pOkPressed) {
                                _intervalData.isShowMsgExpired = false;
                                if (pOkPressed) {
                                    reloadApexUrl();
                                }
                            }
                            , {title: lTitle}
                        );
                        /*
                        jQuery("[role=\"alertdialog\"]").last().prop("id", "idSsnTotOsrConfirmExpired");
                        if (jQuery("#idSsnTotOsrConfirmExpired").length > 0) {
                            jQuery("#idSsnTotOsrConfirmExpired").addClass("ui-dialog-no-close-x");
                            jQuery("#idSsnTotOsrConfirmExpired").find(".ui-dialog-content.ui-widget-content").dialog("option", "title", lTitle);
                        } else {
                            //console.log("Could not set id[idSsnTotOsrConfirmExpired] of alertdialog!");
                            // This happens minimum at APEX 20.2
                            setTimeout(function () {
                                jQuery("[role=\"alertdialog\"]").last().prop("id", "idSsnTotOsrConfirmExpired");
                                if (jQuery("#idSsnTotOsrConfirmExpired").length > 0) {
                                    jQuery("#idSsnTotOsrConfirmExpired").addClass("ui-dialog-no-close-x");
                                    jQuery("#idSsnTotOsrConfirmExpired").find(".ui-dialog-content.ui-widget-content").dialog("option", "title", lTitle);
                                } else {
                                    console.log("Could also not set id[idSsnTotOsrConfirmExpired] by setTimeout of alertdialog!");
                                }
                            }, 10);
                        }
                         */
                    } catch (err) {
                        if (_SESSION_INFOS.SECONDS_LEFT_REASON === "LIFE") {
                            lTitle = _options.expiredAltTitle4Life;
                            lMsg = _options.expiredAltMsg4Life;
                        } else {
                            lTitle = _options.expiredAltTitle4Idle;
                            lMsg = _options.expiredAltMsg4Idle;
                        }
                        //lTitle = replacePlaceholders(lTitle);
                        //lMsg = $v("pFlowId") + "." + $v("pFlowStepId") + ":\n" + lMsg;
                        lMsg = replacePlaceholders(lMsg);
                        alert(lTitle + "\n" + lMsg);
                        _intervalData.isShowMsgExpired = false;
                    }
                } else if (lOnExpiredActionFlag === 2) {
                    // Do reload
                    reloadApexUrl();
                } else {
                    // 0 => Nothing
                }
            }
        } else if (_SESSION_INFOS.SECONDS_LEFT <= _options.showWarningBeforeSeconds) {
            // Session will expiry in approx. 120 sec.; Change interval to 2 sec.
            if (_intervalData.currIntervalSeconds > 2) {
                stopInterval();
            }

            if (_SESSION_INFOS.SECONDS_LEFT_REASON === "LIFE") {
                if (typeof _options.onWillExpireActionFlag4Life === "function") {
                    lOnWillExpireActionFlag = _options.onWillExpireActionFlag4Life();
                    // Call function only once
                    _options.onWillExpireActionFlag4Life = lOnWillExpireActionFlag;
                } else {
                    lOnWillExpireActionFlag = _options.onWillExpireActionFlag4Life;
                }
            } else {
                if (typeof _options.onWillExpireActionFlag4Idle === "function") {
                    lOnWillExpireActionFlag = _options.onWillExpireActionFlag4Idle();
                    // Call function only once
                    _options.onWillExpireActionFlag4Idle = lOnWillExpireActionFlag;
                } else {
                    lOnWillExpireActionFlag = _options.onWillExpireActionFlag4Idle;
                }
            }

            if (_options.onWillExpire) {
                isHandled4OnWillExpire = _options.onWillExpire(_SESSION_INFOS.SECONDS_LEFT_REASON, _SESSION_INFOS.SECONDS_LEFT);
                if (typeof isHandled4OnWillExpire === "object") {
                    isHandled4OnWillExpire = isHandled4OnWillExpire.isHandled;
                }
            }

            if (isHandled4OnWillExpire !== true) {
                if (lOnWillExpireActionFlag === 1) {
                    currWinObj = window.top;
                    if (currWinObj !== window) {
                        // window.top is not me
                        if (currWinObj.dermalog && currWinObj.dermalog.dl_common && currWinObj.dermalog.dl_common.sessionTimeoutObserver && currWinObj.dermalog.dl_common.sessionTimeoutObserver.IsEnabled() === true) {
                            // Parent is in charge, so dispose it the handling
                            currWinObj.dermalog.dl_common.sessionTimeoutObserver.EnableShowMsgWillExpire();
                            /*
                            let maxIdx = 0;
                            currWinObj.$('.ui-dialog').each(function (idx, elem) {
                                    maxIdx = Math.max(maxIdx, $(elem).zIndex());
                                }
                            );
                            console.log("Parent: maxIdx", maxIdx);
                            //currWinObj.$('idSsnTotOsrConfirmWillExpire').zIndex(maxIdx + 1);
                             */
                            lOnWillExpireActionFlag = 0;
                        }
                        if (lOnWillExpireActionFlag === 1) {
                            for (let i = 0; i < window.top.frames.length; i++) {
                                currWinObj = window.top.frames[i];
                                if (currWinObj.dermalog && currWinObj.dermalog.dl_common && currWinObj.dermalog.dl_common.sessionTimeoutObserver && currWinObj.dermalog.dl_common.sessionTimeoutObserver.IsEnabled() === true) {
                                    // Most top sibling is in charge, so dispose it the handling
                                    currWinObj.dermalog.dl_common.sessionTimeoutObserver.EnableShowMsgWillExpire();
                                    lOnWillExpireActionFlag = 0;
                                    break;
                                }
                            }
                        }
                    }
                }
                if (lOnWillExpireActionFlag === 1) {
                    // 1 => Show Msg
                    if (intervalFlagsHas(_FLAGS.SHOW_WARNING) /*&& _SESSION_INFOS.USER_NAME !== "nobody"*/) {
                        _intervalData.isShowMsgWillExpire = true;
                        try {
                            if (_SESSION_INFOS.SECONDS_LEFT_REASON === "LIFE") {
                                lTitle = _options.willExpireCfmTitle4Life;
                                lMsg = _options.willExpireCfmMsg4Life;
                            } else {
                                //_SESSION_INFOS.SECONDS_LEFT_REASON === "IDLE"
                                lTitle = _options.willExpireCfmTitle4Idle;
                                lMsg = _options.willExpireCfmMsg4Idle;
                            }
                            //lTitle = replacePlaceholders(lTitle);
                            //lMsg = $v("pFlowId") + "." + $v("pFlowStepId") + ":\n" + lMsg;
                            lMsg = replacePlaceholders(lMsg);
                            if (intervalFlagsHas(_FLAGS.UPDATE_WARNING)) {
                                jQuery("#idSsnTotOsrConfirmWillExpire .ui-dialog-title").text(lTitle);
                                jQuery("#idSsnTotOsrConfirmWillExpire > .ui-dialog-content").html(lMsg.replace(/\r\n|\n/g, "<br>"));
                            } else {
                                try {
                                    if (_SESSION_INFOS.SECONDS_LEFT_REASON === "LIFE") {
                                        dermalog.dl_common.apps.confirm(lMsg
                                            , function (pOkPressed) {
                                                _intervalData.isShowMsgWillExpire = false;
                                                intervalFlagsDel(_FLAGS.UPDATE_WARNING);
                                                if (pOkPressed) {
                                                    reloadApexUrl();
                                                } else {
                                                    intervalFlagsDel(_FLAGS.SHOW_WARNING);
                                                }
                                            }
                                            , {title: lTitle}
                                        );
                                    } else {
                                        //_SESSION_INFOS.SECONDS_LEFT_REASON === "IDLE"
                                        dermalog.dl_common.apps.confirm(lMsg
                                            , function (pOkPressed) {
                                                _intervalData.isShowMsgWillExpire = false;
                                                intervalFlagsDel(_FLAGS.UPDATE_WARNING);
                                                if (pOkPressed) {
                                                    intervalFlagsDel(_FLAGS.SHOW_WARNING);
                                                    refreshTIMEOUT_ON(_FLAGS.SHOW_WARNING);
                                                } else {
                                                    intervalFlagsDel(_FLAGS.SHOW_WARNING);
                                                }
                                            }
                                            , {title: lTitle}
                                        );
                                    }
                                    /*
                                    jQuery("[role=\"alertdialog\"]").last().prop("id", "idSsnTotOsrConfirmWillExpire");
                                    if (jQuery("#idSsnTotOsrConfirmWillExpire").length > 0) {
                                        jQuery("#idSsnTotOsrConfirmWillExpire").addClass("ui-dialog-no-close-x");
                                        jQuery("#idSsnTotOsrConfirmWillExpire").find(".ui-dialog-content.ui-widget-content").dialog("option", "title", lTitle);
                                    } else {
                                        //console.log("Could not set id[idSsnTotOsrConfirmWillExpire] of alertdialog!");
                                        // This happens minimum at APEX 20.2
                                        setTimeout(function () {
                                            jQuery("[role=\"alertdialog\"]").last().prop("id", "idSsnTotOsrConfirmWillExpire");
                                            if (jQuery("#idSsnTotOsrConfirmWillExpire").length > 0) {
                                                jQuery("#idSsnTotOsrConfirmWillExpire").addClass("ui-dialog-no-close-x");
                                                jQuery("#idSsnTotOsrConfirmWillExpire").find(".ui-dialog-content.ui-widget-content").dialog("option", "title", lTitle);
                                            } else {
                                                console.log("Could also not set id[idSsnTotOsrConfirmWillExpire] by setTimeout of alertdialog!");
                                            }
                                        }, 0);
                                    }
                                     */
                                    // Add "Refresh Alert"
                                    intervalFlagsAdd(_FLAGS.UPDATE_WARNING);
                                } catch (err) {
                                    if (_SESSION_INFOS.SECONDS_LEFT_REASON === "LIFE") {
                                        lTitle = _options.willExpireAltTitle4Life;
                                        lMsg = _options.willExpireAltMsg4Life;
                                    } else {
                                        lTitle = _options.willExpireAltTitle4Idle;
                                        lMsg = _options.willExpireAltMsg4Idle;
                                    }
                                    //lTitle = replacePlaceholders(lTitle);
                                    //lMsg = $v("pFlowId") + "." + $v("pFlowStepId") + ":\n" + lMsg;
                                    lMsg = replacePlaceholders(lMsg);
                                    alert(lTitle + "\n" + lMsg);
                                    _intervalData.isShowMsgWillExpire = false;
                                }
                            }
                            startInterval(1);
                        } catch (err) {
                            // Remove "Show Warning" and "Refresh Alert"
                            intervalFlagsDel(_FLAGS.UPDATE_WARNING);
                            intervalFlagsDel(_FLAGS.SHOW_WARNING);
                            pSessionTimeoutObserver.RemoveMsgWillExpire();
                            throw err;
                        }
                    } else {
                        if (_options.onWillExpire) {
                            startInterval(1);
                        } else {
                            startInterval(2);
                        }
                    }
                } else {
                    // 0 => Nothing
                }
            } else {
                // lAbortHandlingOnWillExpire === true
                startInterval(1);
            }
        } else {
            // Out of show warning time range
            if (intervalFlagsHas(_FLAGS.UPDATE_WARNING)) {
                intervalFlagsDel(_FLAGS.UPDATE_WARNING);
                pSessionTimeoutObserver.RemoveMsgWillExpire();
            }
            lTmp = _SESSION_INFOS.SECONDS_LEFT - _options.showWarningBeforeSeconds - 1;
            if (_intervalData.currIntervalSeconds !== lTmp) {
                stopInterval();
                startInterval(lTmp);
            }
        }
    }

    /**
     * @public
     * @function
     * @memberOf pAPPS
     */
    pSessionTimeoutObserver.debugger = function () {
        debugger;
    };

    /**
     * @public
     * @function
     * @memberOf pSessionTimeoutObserver
     */
    pSessionTimeoutObserver.DoRefreshData = function () {
        if (_options.isDisabled === true) {
            return;
        }
        intervalFlagsAdd(_FLAGS.DO_REFRESH_DATA);
    };

    /**
     * @public
     * @function
     * @memberOf pSessionTimeoutObserver
     */
    pSessionTimeoutObserver._getINTERNALS = function () {
        return {"_options": _options, "_intervalData": _intervalData, "_internalData": _internalData};
    };

    /**
     * @public
     * @function
     * @memberOf pSessionTimeoutObserver
     */
    pSessionTimeoutObserver.GetSESSION_INFOS = function () {
        return _SESSION_INFOS;
    };

    /**
     * @public
     * @function
     * @memberOf pSessionTimeoutObserver
     */
    pSessionTimeoutObserver.Init = function (pDoStart, pOptions) {

        if (typeof pOptions !== "object" || pOptions === null) {
            pOptions = {};
        }

        stopInterval();

        _options.pFlowId = $v("pFlowId");
        _options.pFlowStepId = $v("pFlowStepId");
        _options.id = pOptions.id;
        _options.onWillExpire = (["function"].includes(typeof pOptions.onWillExpire) ? pOptions.onWillExpire : _options.onWillExpire);
        _options.onExpired = (["function"].includes(typeof pOptions.onExpired) ? pOptions.onExpired : _options.onExpired);
        _options.onReload = (["function"].includes(typeof pOptions.onReload) ? pOptions.onReload : _options.onReload);
        _options.reloadUrl4Idle = (["string", "function"].includes(typeof pOptions.reloadUrl4Idle) ? pOptions.reloadUrl4Idle : _options.reloadUrl4Idle);
        _options.reloadUrl4Life = (["string", "function"].includes(typeof pOptions.reloadUrl4Life) ? pOptions.reloadUrl4Life : _options.reloadUrl4Life);
        _options.fallbackUrl = (["string", "function"].includes(typeof pOptions.fallbackUrl) ? pOptions.fallbackUrl : _options.fallbackUrl);
        _options.onWillExpireActionFlag4Idle = (["number", "function"].includes(typeof pOptions.onWillExpireActionFlag4Idle) ? pOptions.onWillExpireActionFlag4Idle : _options.onWillExpireActionFlag4Idle);
        _options.onWillExpireActionFlag4Life = (["number", "function"].includes(typeof pOptions.onWillExpireActionFlag4Life) ? pOptions.onWillExpireActionFlag4Life : _options.onWillExpireActionFlag4Life);
        _options.onExpiredActionFlag4Idle = (["number", "function"].includes(typeof pOptions.onExpiredActionFlag4Idle) ? pOptions.onExpiredActionFlag4Idle : _options.onExpiredActionFlag4Idle);
        _options.onExpiredActionFlag4Life = (["number", "function"].includes(typeof pOptions.onExpiredActionFlag4Life) ? pOptions.onExpiredActionFlag4Life : _options.onExpiredActionFlag4Life);
        _options.showWarningBeforeSeconds = Math.max(30, (pOptions.showWarningBeforeSeconds || 120)); // Minimum 30
        _options.willExpireCfmTitle4Idle = (pOptions.willExpireCfmTitle4Idle || _options.willExpireCfmTitle4Idle);
        _options.willExpireCfmMsg4Idle = (pOptions.willExpireCfmMsg4Idle || _options.willExpireCfmMsg4Idle);
        _options.willExpireAltTitle4Idle = (pOptions.willExpireAltTitle4Idle || _options.willExpireAltTitle4Idle);
        _options.willExpireAltMsg4Idle = (pOptions.willExpireAltMsg4Idle || _options.willExpireAltMsg4Idle);
        _options.willExpireCfmTitle4Life = (pOptions.willExpireCfmTitle4Life || _options.willExpireCfmTitle4Life);
        _options.willExpireCfmMsg4Life = (pOptions.willExpireCfmMsg4Life || _options.willExpireCfmMsg4Life);
        _options.willExpireAltTitle4Life = (pOptions.willExpireAltTitle4Life || _options.willExpireAltTitle4Life);
        _options.willExpireAltMsg4Life = (pOptions.willExpireAltMsg4Life || _options.willExpireAltMsg4Life);
        _options.expiredCfmTitle4Idle = (pOptions.expiredCfmTitle4Idle || _options.expiredCfmTitle4Idle);
        _options.expiredCfmMsg4Idle = (pOptions.expiredCfmMsg4Idle || _options.expiredCfmMsg4Idle);
        _options.expiredAltTitle4Idle = (pOptions.expiredAltTitle4Idle || _options.expiredAltTitle4Idle);
        _options.expiredAltMsg4Idle = (pOptions.expiredAltMsg4Idle || _options.expiredAltMsg4Idle);
        _options.expiredCfmTitle4Life = (pOptions.expiredCfmTitle4Life || _options.expiredCfmTitle4Life);
        _options.expiredCfmMsg4Life = (pOptions.expiredCfmMsg4Life || _options.expiredCfmMsg4Life);
        _options.expiredAltTitle4Life = (pOptions.expiredAltTitle4Life || _options.expiredAltTitle4Life);
        _options.expiredAltMsg4Life = (pOptions.expiredAltMsg4Life || _options.expiredAltMsg4Life);
        _options.isDisabled = (typeof pOptions.isDisabled === "boolean" ? pOptions.isDisabled : _options.isDisabled);

        _intervalData.intervalID = null;
        _intervalData.firstIntervalOn = null;
        _intervalData.intervalFlagMask = ((pOptions.showWarningBeforeSeconds || 120) > 0 ? _FLAGS.SHOW_WARNING : 0);
        _intervalData.currIntervalSeconds = 1;
        _intervalData.onIntervalCounter = 0;

        _SESSION_INFOS.CLIENT_DATE = null;
        _SESSION_INFOS.SERVER_DATE = null;
        _SESSION_INFOS.SERVER_CLIENT_DIFF = null;
        _SESSION_INFOS.USER_NAME = null;
        _SESSION_INFOS.REMOTE_ADDR = null;
        _SESSION_INFOS.SESSION_CREATED = null;
        _SESSION_INFOS.SESSION_IDLE_TIMEOUT_ON = null;
        _SESSION_INFOS.SESSION_LIFE_TIMEOUT_ON = null;
        _SESSION_INFOS.SESSION_MAX_IDLE_SEC = null;
        _SESSION_INFOS.SECONDS_LEFT = null;
        _SESSION_INFOS.SECONDS_LEFT_REASON = null;

        if (intervalFlagsHas(_FLAGS.EXE_REFRESH_DATA)) {
            throw new Error("Unexpected intervalFlags detected!");
        }

        let sessionInfos = pSessionTimeoutObserver.GetPriorSESSION_INFOS();
        if (sessionInfos) {
            _SESSION_INFOS.CLIENT_DATE = sessionInfos.CLIENT_DATE;
            _SESSION_INFOS.SERVER_DATE = sessionInfos.SERVER_DATE;
            _SESSION_INFOS.SERVER_CLIENT_DIFF = sessionInfos.SERVER_CLIENT_DIFF;
            _SESSION_INFOS.USER_NAME = sessionInfos.USER_NAME;
            _SESSION_INFOS.REMOTE_ADDR = sessionInfos.REMOTE_ADDR;
            _SESSION_INFOS.SESSION_CREATED = sessionInfos.SESSION_CREATED;
            _SESSION_INFOS.SESSION_IDLE_TIMEOUT_ON = sessionInfos.SESSION_IDLE_TIMEOUT_ON;
            _SESSION_INFOS.SESSION_LIFE_TIMEOUT_ON = sessionInfos.SESSION_LIFE_TIMEOUT_ON;
            _SESSION_INFOS.SESSION_MAX_IDLE_SEC = sessionInfos.SESSION_MAX_IDLE_SEC;

            recalculateSECONDS_LEFT();

            intervalFlagsDel(_FLAGS.DO_REFRESH_DATA);
            _intervalData.currIntervalSeconds = Math.floor(Math.max(1, _SESSION_INFOS.SECONDS_LEFT - _options.showWarningBeforeSeconds - 1));

            if (pDoStart === true) {
                pSessionTimeoutObserver.Start();
            }
        } else {
            intervalFlagsAdd(_FLAGS.EXE_REFRESH_DATA);
            dermalog.dl_common.apps.ApexServerProcess("SESSION_INFOS", {x01: $v("pInstance")}, {
                dataType: "json", success: function (pData) {
                    // TODO: pData["StatusCode"] !== 0
                    // TODO: Raise error on server
                    // TODO: Delete session on server

                    _SESSION_INFOS.CLIENT_DATE = new Date();
                    _SESSION_INFOS.SERVER_DATE = new Date(pData.SERVER_DATE);
                    _SESSION_INFOS.SERVER_CLIENT_DIFF = _SESSION_INFOS.SERVER_DATE.valueOf() - _SESSION_INFOS.CLIENT_DATE.valueOf();
                    _SESSION_INFOS.USER_NAME = pData.USER_NAME;
                    _SESSION_INFOS.REMOTE_ADDR = pData.REMOTE_ADDR;
                    _SESSION_INFOS.SESSION_CREATED = new Date(pData.SESSION_CREATED);
                    _SESSION_INFOS.SESSION_IDLE_TIMEOUT_ON = new Date(pData.SESSION_IDLE_TIMEOUT_ON);
                    _SESSION_INFOS.SESSION_LIFE_TIMEOUT_ON = new Date(pData.SESSION_LIFE_TIMEOUT_ON);
                    _SESSION_INFOS.SESSION_MAX_IDLE_SEC = pData.SESSION_MAX_IDLE_SEC;

                    recalculateSECONDS_LEFT();

                    intervalFlagsDel(_FLAGS.DO_REFRESH_DATA);
                    _intervalData.currIntervalSeconds = Math.floor(Math.max(1, _SESSION_INFOS.SECONDS_LEFT - _options.showWarningBeforeSeconds - 1));

                    if (pDoStart === true) {
                        pSessionTimeoutObserver.Start();
                    }
                    intervalFlagsDel(_FLAGS.EXE_REFRESH_DATA);
                }, error: function (pjqXHR, pTextStatus, pErrorThrown) {
                    let isHandled = false;
                    pSessionTimeoutObserver.Stop();
                    if (_options.onExpired) {
                        isHandled = _options.onExpired("CONNECTION");
                        if (typeof isHandled === "object") {
                            isHandled = isHandled.isHandled;
                        }
                    }
                    if (isHandled !== false) {
                        dermalog.dl_common.apps.ApexShowAlert("Stop Session-Observer due to no connection to the server!");
                    }
                }
            });
        }
    };

    /**
     * @public
     * @function
     * @memberOf pSessionTimeoutObserver
     */
    pSessionTimeoutObserver.Start = function () {
        if (_options.isDisabled === true) {
            return;
        }
        // Do not wait for first interval event
        onInterval();
        _intervalData.onIntervalCounter = 0;
        startInterval(_intervalData.currIntervalSeconds);
    };

    /**
     * @public
     * @function
     * @memberOf pSessionTimeoutObserver
     */
    pSessionTimeoutObserver.Stop = function () {
        if (_options.isDisabled === true) {
            return;
        }
        stopInterval();
        pSessionTimeoutObserver.RemoveMsgWillExpire();
        pSessionTimeoutObserver.RemoveMsgExpired();
    };

    /**
     * @public
     * @function
     * @memberOf pSessionTimeoutObserver
     */
    pSessionTimeoutObserver.IsRunning = function () {
        return isInterval();
    };

    /**
     * @public
     * @function
     * @memberOf pSessionTimeoutObserver
     */
    pSessionTimeoutObserver.IsShowMsgWillExpire = function () {
        return _intervalData.isShowMsgWillExpire;
    };

    /**
     * @public
     * @function
     * @memberOf pSessionTimeoutObserver
     */
    pSessionTimeoutObserver.RemoveMsgWillExpire = function () {
        //console.log("RemoveMsgWillExpire: Begin");
        let jQuery = apex.util.getTopApex().jQuery;
        let tmpObj = jQuery("#idSsnTotOsrConfirmWillExpire");
        if (tmpObj.length > 0) {
            //console.log("RemoveMsgWillExpire: Will remove by ID");
            tmpObj.remove();
            _intervalData.isShowMsgWillExpire = false;
            //console.log("RemoveMsgWillExpire: Removed by ID");
        }
        tmpObj = jQuery("[role=\"alertdialog\"]");
        if (tmpObj.length > 0) {
            //console.log("RemoveMsgWillExpire: Has by [role=\"alertdialog\"]");
            let s0 = _options.willExpireCfmMsg4Life.replaceAll(/%.+%/gim, ".*");
            let s1 = _options.willExpireCfmMsg4Idle.replaceAll(/%.+%/gim, ".*");
            //TODO: Escape special RegExp-Chars ( | ? + * () [] {} ^ $ \ ... ) into s0 and s1 by replacing
            let regExp0 = new RegExp(s0 + "|" + s1, "gim");
            for (let i = 0; i < tmpObj.length; i++) {
                if (jQuery(tmpObj[i]).text().match(regExp0)) {
                    //console.log("RemoveMsgWillExpire: Will remove by RegExp-Match");
                    jQuery(tmpObj[i]).remove();
                    _intervalData.isShowMsgWillExpire = false;
                    //console.log("RemoveMsgWillExpire: Removed by RegExp-Match");
                }
            }
        }
        //console.log("RemoveMsgWillExpire: End");
    };

    /**
     * @public
     * @function
     * @memberOf pSessionTimeoutObserver
     */
    pSessionTimeoutObserver.EnableShowMsgWillExpire = function () {
        intervalFlagsAdd(_FLAGS.SHOW_WARNING);
    };

    /**
     * @public
     * @function
     * @memberOf pSessionTimeoutObserver
     */
    pSessionTimeoutObserver.DisableShowMsgWillExpire = function () {
        intervalFlagsDel(_FLAGS.SHOW_WARNING);
    };

    /**
     * @public
     * @function
     * @memberOf pSessionTimeoutObserver
     */
    pSessionTimeoutObserver.IsShowMsgExpired = function () {
        return _intervalData.isShowMsgExpired;
    };

    /**
     * @public
     * @function
     * @memberOf pSessionTimeoutObserver
     */
    pSessionTimeoutObserver.RemoveMsgExpired = function () {
        //console.log("RemoveMsgExpired: Begin");
        let jQuery = apex.util.getTopApex().jQuery;
        let tmpObj = jQuery("#idSsnTotOsrConfirmExpired");
        if (tmpObj.length > 0) {
            //console.log("RemoveMsgExpired: Will remove by ID");
            tmpObj.remove();
            _intervalData.isShowMsgExpired = false;
            //console.log("RemoveMsgExpired: Removed by ID");
        }
        tmpObj = jQuery("[role=\"alertdialog\"]");
        if (tmpObj.length > 0) {
            //console.log("RemoveMsgExpired: Has by [role=\"alertdialog\"]");
            let s0 = _options.expiredCfmMsg4Life.replaceAll(/%.+%/gim, ".*");
            let s1 = _options.expiredCfmMsg4Idle.replaceAll(/%.+%/gim, ".*");
            //TODO: Escape special RegExp-Chars ( | ? + * () [] {} ^ $ \ ... ) into s0 and s1 by replacing
            let regExp0 = new RegExp(s0 + "|" + s1, "gim");
            for (let i = 0; i < tmpObj.length; i++) {
                if (jQuery(tmpObj[i]).text().match(regExp0)) {
                    //console.log("RemoveMsgExpired: Will remove by RegExp-Match");
                    jQuery(tmpObj[i]).remove();
                    _intervalData.isShowMsgExpired = false;
                    //console.log("RemoveMsgExpired: Removed by RegExp-Match");
                }
            }
        }
        //console.log("RemoveMsgExpired: End");
    };

    /**
     * @public
     * @function
     * @memberOf pSessionTimeoutObserver
     */
    pSessionTimeoutObserver.IsEnabled = function () {
        return !_options.isDisabled;
    };

    /**
     * @public
     * @function
     * @memberOf pSessionTimeoutObserver
     */
    pSessionTimeoutObserver.Enable = function () {
        _options.isDisabled = false;
        pSessionTimeoutObserver.Start();
    };

    /**
     * @public
     * @function
     * @memberOf pSessionTimeoutObserver
     */
    pSessionTimeoutObserver.Disable = function () {
        pSessionTimeoutObserver.Stop();
        _options.isDisabled = true;
    };

    /**
     * @public
     * @function
     * @memberOf pSessionTimeoutObserver
     */
    pSessionTimeoutObserver.GetPriorSESSION_INFOS = function () {
        let result = null;
        let currWinObj = window.top;
        if (currWinObj !== window) {
            // window.top is not me
            if (currWinObj.dermalog && currWinObj.dermalog.dl_common && currWinObj.dermalog.dl_common.sessionTimeoutObserver && currWinObj.dermalog.dl_common.sessionTimeoutObserver.IsEnabled() === true) {
                // Parent is in charge, so dispose it the handling
                result = currWinObj.dermalog.dl_common.sessionTimeoutObserver.GetSESSION_INFOS();
            }
            if (!result) {
                for (let i = 0; i < window.top.frames.length; i++) {
                    currWinObj = window.top.frames[i];
                    if (currWinObj.dermalog && currWinObj.dermalog.dl_common && currWinObj.dermalog.dl_common.sessionTimeoutObserver && currWinObj.dermalog.dl_common.sessionTimeoutObserver.IsEnabled() === true) {
                        // Most top sibling is in charge, so dispose it the handling
                        result = currWinObj.dermalog.dl_common.sessionTimeoutObserver.GetSESSION_INFOS();
                        break;
                    }
                }
            }
        }
        return result;
    };

    /**
     * @public
     * @function
     * @memberOf pSessionTimeoutObserver
     */
    pSessionTimeoutObserver.GetPriorTIMEOUT_ON = function () {
        let sessionInfos = pSessionTimeoutObserver.GetPriorSESSION_INFOS();
        if (sessionInfos) {
            _SESSION_INFOS.SESSION_IDLE_TIMEOUT_ON = sessionInfos.SESSION_IDLE_TIMEOUT_ON;
            _SESSION_INFOS.SESSION_LIFE_TIMEOUT_ON = sessionInfos.SESSION_LIFE_TIMEOUT_ON;
        }
        return (sessionInfos ? true : false);
    };

    $(document).ready(function () {
    });

})(dermalog.dl_common.sessionTimeoutObserver);

/**
 * @public
 * @function dermalog.dl_common.makeApps
 */
(function (pApps) {
    "use strict";

    /**
     * @private
     * @constant
     * @type {RegExp}
     * @memberOf pApps
     */
    const REGEX_SERVER_ERROR_CODES = new RegExp("(sqlcode|sqlerrm|ORA-[0-9]{1,5}):? ?", "gim");

    /**
     * @private
     * @constant
     * @type {RegExp}
     * @memberOf pApps
     */
    const REGEX_ERROR_MARKERS = new RegExp("(\"error\":)", "gim");

    /**
     * @private
     * @constant
     * @type {RegExp}
     * @memberOf pApps
     */
    const REGEX_SESSION_EXPIRED_0 = new RegExp("Your session life time has expired!( |\\t|\\r|\\n)*You must manually reload the page!", "gim");

    /**
     * @private
     * @constant
     * @type {RegExp}
     * @memberOf pApps
     */
    const REGEX_SESSION_EXPIRED_1 = new RegExp("Click .*here.* to create a new session", "gim");

    /**
     * @private
     * @constant
     * @type {RegExp}
     * @memberOf pApps
     */
    const REGEX_HTML = new RegExp("<html(\\s|.)*>", "im");

    /**
     * @private
     * @constant
     * @type {RegExp}
     * @memberOf pApps
     */
    const REGEX_HTML_DOC = new RegExp("^\\s*<\\s*(?:!DOCTYPE|html)(?:\\s+[^<>]+)?\\s*>", "si");

    /**
     *
     * @private
     * @constant
     * @type {RegExp}
     * @memberOf pApps
     */
    const REGEX_JSON_HAS_STATUSCODE = new RegExp("\"StatusCode\"[^:]*:\s*[-+0-9]+", "si");

    /**
     * @private
     * @constant
     * @type {object}
     * @memberOf pApps
     */
    const RETURN_CODES4NAME = {
        ERROR: -2, WARNING: -1, SUCCESS: 0
    };

    let gTopDialogList = []
        , gDialogCleanupHandler = null
        , gShowDialogReturnFocusTo = null;

    /**
     * Shows a dialog or popup in the top APEX context.
     * For internal use only.
     *
     * @ignore
     * @param messageContent Defines the content of the dialog or popup. This is only used when the dialog is created.
     * Is one of:
     *  - simple string message. The message will be escaped unless options.unsafe is set to false.
     *  - a function that is called that returns a string of markup. This will be inserted in the DOM using
     *    the top APEX jQuery.
     *  - a jQuery object that is the content of the dialog. In this case care must be taken with respect
     *    to possible cross context issues.
     * @param {Object} options
     * @param {string} [options.id] If given the dialog id will be set to this value and it will not be destroyed
     *     when it closes. This allows the dialog to be reused. Normally the dialog or popup is destroyed on close.
     *     The ID should be globally unique for the app not just unique on the page. This is because the dialog
     *     could be opened in the top/main page from many other pages.
     * @param {string} [options.title] The dialog title. Not visible for popups.
     *      By default no title is shown, which mirrors the native browser alert / confirm dialogs.
     * @param {boolean} [options.isPopup] If true a popup widget is opened. If false a dialog widget is opened. Default is false.
     * @param {boolean} options.noOverlay Only applies if isPopup is true. See popup widget noOverlay option.
     * @param {jQuery} options.parentElement Only applies if isPopup is true. See popup widget parentElement option.
     * @param {boolean} options.draggable Only applies if isPopup is false. See dialog widget draggable option.
     * @param {boolean} options.resizable Only applies if isPopup is false. See dialog widget resizable option.
     * @param {number} options.width The dialog/popup width.
     * @param {number} options.height The dialog/popup height.
     * @param {function} options.init Called during dialog/popup create. The dialog jQuery object is passed in.
     * @param {function} options.open Called during the dialog/popup open callback.
     * @param {function} options.callback Called when the dialog is closed. If confirm is true the function is passed
     *     true if the OK button was pressed and false otherwise.
     * @param {function} options.beforeClose The dialog/popup beforeClose callback.
     * @param {function} options.resize The dialog/popup resize callback.
     * @param {function} options.resizeStop The dialog/popup resizeStop callback.
     * @param {string} [options.dialogClass] Extra classes to add to the dialog.
     * @param {boolean} options.defaultButton Default is false. If true pressing enter in any input field will activate
     *     the OK/hot button.
     * @param {boolean} [options.confirm] If true there is a "cancel" button. Also the callback function receives
     *     a boolean indicating if the OK button was pressed. Default is false.
     * @param {boolean} [options.notification] Default is true. Determines the role of the dialog.
     * @param {boolean} [options.okButton] Default is true. If true the dialog will have an "Ok" button.
     * @param {string} [options.okButtonClass] Depends on okButton. Class to be applied to the "Ok" button. Defaults to "ui-button--hot"
     * @param {string} [options.okLabel] Message for the OK button label.
     * @param {string} [options.okLabelKey] Message key for the OK button label. Will be used if options.okLabel is not provided.
     * @param {string} [options.cancelLabel] Message for the Cancel button label.
     * @param {string} [options.cancelLabelKey] Message key for the Cancel button label. Will be used if options.cancelLabel is not provided.
     * @param {array} [options.extraButtons] An array of extra button definitions.
     * @param {Element} [options.returnFocusTo] Element to return focus to. The default is document.activeElement.
     * @param {boolean} [options.unsafe] Pass true so that the message and title will be escaped by showDialog. Pass false if the
     *     message and title are considered safe as is. Defaults to true. This option always applies to the title, but only applies to messageContent if it is of type String.
     *
     * @param {boolean} [options.modern] In "modern" mode, the title is embedded above the message in the dialog body, as opposed to the title bar.
     *      For simplicity, the "X" close button is removed. This mode is ideal for simpler dialogs like alert and confirm. Defaults to false.
     * @param {string} [options.style] An optional style to apply to the dialog.
     *      The supported styles are "information", "warning", "danger" and "success".
     *      The style will override options.okButtonClass.
     *      The icon applied by the style can be overridden by options.iconClass.
     *      If nothing is provided, no icon will be shown. Only available in modern mode. Example: "fa fa-warning"
     * @param {string} [options.iconClass] Extra classes to be set for an icon which is displayed before the message. Only available in modern mode.
     *
     * @returns {jQuery} the dialog.
     * @function showDialog
     * @memberOf pApps
     */
    function showDialog(pMessageContent, pOptions) {
        let uiDialog$, dialog$, closeButton$, temp$, dialogOptions,
            okBtn$, widget, offset, iframeOffset, parentElement, sp$,
            proxyParentElementCreated = false,
            navigation = apex.navigation,
            jQuery = apex.util.getTopApex().jQuery,
            topBody$ = jQuery("body"),
            result = null,
            buttons = [],
            idLabelledby, idDescribedby;

        pOptions = $.extend({
                id: null
                , isPopup: false
                , noOverlay: false
                , draggable: true
                , resizable: false
                , notification: true
                , dialogClass: "ui-dialog--notification"
                , okButton: true
                , okButtonClass: "ui-button--hot"
                , okLabel: null
                , okLabelKey: "APEX.DIALOG.OK"
                , cancelLabel: null
                , cancelLabelKey: "APEX.DIALOG.CANCEL"
                , confirm: false
                , defaultButton: false
                , title: ""
                , unsafe: true
                , modern: false
                , style: null
                , iconClass: null
                , parentElement: null
                , extraButtons: null
                , callback: null
            }
            , pOptions
        );

        if (pOptions.title) {
            pOptions.dialogClass += " ui-dialog--hasTitle";
        }

        if (pOptions.modern) {
            pOptions.dialogClass += " ui-dialog--modern";
            // a predefined style can affect the dialogClass, okButtonClass and iconClass
            if (["information", "warning", "danger", "success"].includes(pOptions.style)) {
                // the style class is appended to any passed-in classes
                pOptions.dialogClass += " ui-dialog--" + (pOptions.style === "information" ? "info" : pOptions.style);
                // option okButtonClass is overridden
                pOptions.okButtonClass = pOptions.style === "danger" ? "ui-button--danger" : "ui-button--hot";
                // iconClass can override the style icon
                if (pOptions.iconClass === null) {
                    pOptions.iconClass = "a-Icon"; // the actual style icon is applied in CSS
                }
            } else if (pOptions.style !== null) {
                apex.debug.error(`"${pOptions.style}" is not a valid style for apex.message.showDialog`);
            }
        }

        widget = pOptions.isPopup ? "popup" : "dialog";
        parentElement = pOptions.parentElement;

        if (pOptions.id) {
            dialog$ = jQuery("#" + apex.util.escapeCSS(pOptions.id));
        }

        /*
         * Because the dialog may be opened in a different context the normal dialog
         * close functionality that returns focus to where it was doesn't work so we
         * track it ourselves.
         */
        gShowDialogReturnFocusTo = pOptions["returnFocusTo"] || document.activeElement || null;

        /*
         * If the context is not the same the parentElement makes no sense for positioning because
         * the offset will be wrong. Create a proxy parentElement in the top context with proper offset.
         */
        if (parentElement && jQuery !== apex.jQuery) {
            parentElement = $(parentElement); // make sure it is a jQuery object
            offset = parentElement.offset();
            // get offset of this iframe
            iframeOffset = jQuery("iframe").filter(function () {
                return this.contentWindow === window;
            }).offset();
            sp$ = $(window); // take into consideration the scroll offsets of the window
            offset.top += iframeOffset.top - sp$.scrollTop();
            offset.left += iframeOffset.left - sp$.scrollLeft();
            proxyParentElementCreated = true;
            pOptions.parentElement = jQuery("<div>")
                .css("position", "absolute")
                .appendTo(topBody$)
                .outerWidth(parentElement.outerWidth())
                .outerHeight(parentElement.outerHeight())
                .offset(offset);
        }

        if (dialog$ && dialog$[0]) {
            if (pMessageContent || pOptions.title || pOptions.callback) {
                console.warn("Cannot set particular attributes on already existing dialog!");
            }
            // The dialog exists so just open it
            if (proxyParentElementCreated) {
                dialog$[widget]("option", "parentElement", pOptions.parentElement);
            }
            dialog$[widget]("open");
        } else {
            // Create dialog
            if (typeof pMessageContent === "string") {
                dialog$ = jQuery("<div>" + (pOptions.unsafe ? apex.util.escapeHTML(pMessageContent).replace(/\r\n|\n/g, "<br>") : pMessageContent) + "</div>");
            } else if (typeof pMessageContent === "function") {
                dialog$ = jQuery(pMessageContent());
            } else {
                dialog$ = pMessageContent;
            }
            if (pOptions.modern) {
                temp$ = jQuery(
                    `<div>
                         <div class="a-AlertMessage">
                    ${pOptions.iconClass
                        ? `<div class="a-AlertMessage-icon">
                                    <span aria-hidden="true" class="${apex.util.escapeHTMLAttr(pOptions.iconClass)}"></span>
                                </div>`
                        : ""
                    }
                             <div class="a-AlertMessage-body">
                                 ${pOptions.title ? `<div class="a-AlertMessage-title">${pOptions.unsafe ? apex.util.escapeHTML(pOptions.title || "") : pOptions.title || ""}</div>` : ""}
                                 <div class="a-AlertMessage-details"></div>
                             </div>
                         </div>
                     </div>`);

                // in the case of a string message, do not append the extra div wrapper. only its contents
                temp$.find(".a-AlertMessage-details").append(typeof pMessageContent === "string" ? dialog$.contents() : dialog$);
                dialog$ = temp$;
            }

            /* NOTE: Wrong place for setting id, because initialization of the dialog does reassign dom elements
            if (pOptions.id) {
                dialog$.attr("id", pOptions.id);
            }
             */
            if (pOptions.okButton) {
                buttons.unshift({
                    class: "js-confirmBtn",
                    text: pOptions.okLabel !== null ? pOptions.okLabel : apex.lang.getMessage(pOptions.okLabelKey),
                    click: function () {
                        result = true;
                        dialog$[widget]("close");
                    }
                });
            }
            if (pOptions.confirm) {
                buttons.unshift({
                    text: pOptions.cancelLabel !== null ? pOptions.cancelLabel : apex.lang.getMessage(pOptions.cancelLabelKey),
                    click: function () {
                        result = false;
                        dialog$[widget]("close");
                    }
                });
            }
            if (pOptions.extraButtons) {
                pOptions.extraButtons.forEach(function (b) {
                    buttons.unshift(b);
                });
            }

            /*
             * If opening a dialog in the top context (that is not this context) and leaving it there,
             * need to clean it up when this context goes away.
             */
            if (pOptions.id && jQuery !== apex.jQuery) {
                gTopDialogList.push({
                    dialogId: pOptions.id,
                    widget: widget
                });
                if (!gDialogCleanupHandler) {
                    gDialogCleanupHandler = function () {
                        var i, d;
                        for (i = 0; i < gTopDialogList.length; i++) {
                            d = gTopDialogList[i];
                            jQuery("#" + d.dialogId)[d.widget]("close").remove();
                        }
                        $(window).off("unload", gDialogCleanupHandler);
                    };
                    $(window).on("unload", gDialogCleanupHandler);
                }
            }

            topBody$.append(dialog$);

            dialogOptions = {
                closeText: apex.lang.getMessage("APEX.DIALOG.CLOSE")
                , autoOpen: true
                , noOverlay: pOptions.noOverlay // ignored by dialog
                , modal: true
                , classes: {
                    "ui-dialog": pOptions.dialogClass
                }
                , parentElement: pOptions.isPopup ? pOptions.parentElement : undefined // ignored by dialog
                , title: pOptions.modern ? "" : pOptions.title
                , closeOnEscape: true
                , create: function () {
                    uiDialog$ = jQuery(this).closest(".ui-dialog");
                    okBtn$ = uiDialog$.find(".js-confirmBtn");
                    closeButton$ = uiDialog$.find("button.ui-dialog-titlebar-close");

                    uiDialog$
                        .css("position", "fixed")         // don't scroll the dialog with the page
                        .attr("role", pOptions.notification ? "alertdialog" : "dialog");

                    /* If dialog is for notification then make an alert dialog, which is what we want for this type of alert,
                     such that the user is interrupted and alerted to the pMessageContent. */

                    if (pOptions.init) {
                        pOptions.init(dialog$);
                    }

                    // add OK button classes
                    if (pOptions.okButtonClass) {
                        okBtn$.addClass(pOptions.okButtonClass);
                    }

                    // in modern mode
                    //  - the title is embedded in the content, so the automatic aria attributes must be pointed to the right elements
                    //  - the original title element, and X button are removed. note we do not remove the entire title bar so that the dialog is still draggable
                    if (pOptions.modern) {
                        idLabelledby = uiDialog$.attr("aria-labelledby");     // should be the id of the title
                        idDescribedby = uiDialog$.attr("aria-describedby");   // should be the id of the message

                        // title element is removed, but we reuse its ID for the custom title element
                        uiDialog$.find("#" + apex.util.escapeCSS(idLabelledby)).remove();
                        uiDialog$.find(".a-AlertMessage-title").attr("id", idLabelledby);

                        // message id is removed and applied to the custom message element
                        uiDialog$.find("#" + apex.util.escapeCSS(idDescribedby)).removeAttr("id");
                        uiDialog$.find(".a-AlertMessage-details").attr("id", idDescribedby);

                        // "X" close button is removed
                        closeButton$.remove();
                    } else {
                        // removing the "Close" text node of the X button as it makes styling difficult
                        // It already has the title attribute which is enough
                        closeButton$.contents().filter((i, elem) => (elem.nodeType === Node.TEXT_NODE)).remove();
                    }

                }
                , open: function (event) {
                    navigation.beginFreezeScroll();

                    if (pOptions.open) {
                        pOptions.open(event);
                    } else {
                        /* Set focus to confirm button, which mirrors browser-based alerts. The dialog is automatically read by
                         screen readers by virtue of the aria-describedby pointing to the dialog contents. */
                        okBtn$.focus();
                    }
                }
                , close: function () {
                    navigation.endFreezeScroll();
                    if (pOptions.callback) {
                        if (result === null) {
                            result = false;
                        }
                        if (pOptions.confirm) {
                            pOptions.callback(result);
                        } else {
                            pOptions.callback();
                        }
                    }
                    if (proxyParentElementCreated) {
                        dialog$[widget]("option", "parentElement").remove();
                    }
                    if (gShowDialogReturnFocusTo) {
                        $(gShowDialogReturnFocusTo).focus();

                    }
                    if (!pOptions.id) {
                        dialog$.remove();
                    }
                }
                , beforeClose: pOptions.beforeClose
                , resize: pOptions.resize
                , resizeStop: pOptions.resizeStop
                , buttons: buttons
            };
            ["draggable", "resizable", "width", "height", "minWidth", "minHeight", "maxWidth", "maxHeight"].forEach(function (prop) {
                if (pOptions[prop] !== undefined) {
                    dialogOptions[prop] = pOptions[prop];
                }
            });
            dialog$[widget](dialogOptions);
            // NOTE: Add attribute "id" after initialization of the dialog
            if (pOptions.id) {
                dialog$.attr("id", pOptions.id);
            }
            if (pOptions.defaultButton) {
                // Pressing enter in any text field will activate the default (hot) button
                dialog$.on("keydown", function (event) {
                    if (event.which === 13 && event.target.nodeName === "INPUT") {
                        okBtn$.click();
                        event.preventDefault();
                    }
                });
            }
        }
        return dialog$;
    }

    /**
     * Displays a confirmation dialog with the given message and OK and Cancel buttons. The callback function passed as
     * the pCallback parameter is called when the dialog is closed, and passes true if OK was pressed and false
     * otherwise. The dialog displays using the jQuery UI ‘Dialog’ widget.
     *
     * There are some differences between this function and a browser’s built-in confirm function:
     * - The dialog style will be consistent with the rest of the app.
     * - The dialog can be moved.
     * - The call to apex.message.confirm does not block, and does not return true or false. Any code defined following
     *   the call to apex.message.confirm will run before the user presses OK or Cancel. Therefore acting on the user’s
     *   choice must be done from within the callback, as shown in the example.
     *
     * Note: If either of the following 2 pre-requisites are not met, the function falls back to using the browser’s
     * built-in confirm:
     * - jQuery UI dialog widget code must be loaded on the page.
     * - The browser must be running in ‘Standards’ mode. This is because if it is running in ‘Quirks’ mode (as is the
     *   case with some older themes), this can cause issues with display position, where the dialog positions itself in
     *   the vertical center of the page, rather than the center of the visible viewport.
     *
     * @param {string} pMessage     The message to display in the confirmation dialog
     * @param {function} pCallback  Callback function called when dialog is closed. Function passes the following
     *                              parameter:
     *                              - okPressed: True if OK was pressed, False otherwise (if Cancel pressed, or the
     *                                           dialog was closed by some other means).
     *
     * @example
     * // Displays a confirmation message ‘Are you sure?’, and if OK is pressed executes the ‘deleteIt()’ function.
     * apex.message.confirm( "Are you sure?", function( okPressed ) {
     *     if( okPressed ) {
     *         deleteIt();
     *     }
     * });
     *
     * @function confirm
     * @memberOf pApps
     */
    pApps.confirm = function (pMessage, pCallback, pOptions = {}) {
        let dfd = $.Deferred();
        pOptions = $.extend({
                id: null
                , title: ""
                , modern: true
            }
            , pOptions
        );
        // Put it at end of execution queue for sync AJAX callbacks
        setTimeout(function () {
                let jqDialog = showDialog("" + pMessage
                    , {
                        id: pOptions.id
                        , confirm: true
                        , title: pOptions.title
                        , modern: pOptions.modern
                        , callback: pCallback
                    }
                );
                //if (pApps.isVersionPassed([21], gApexVersion.split("."))) {}
                //let sDlgHeight = jqDialog.css("height");
                //let sDlgParentHeight = jqDialog.parent().css("height");
                jqDialog
                    .css("padding-left", "var(--jui-dialog-content-padding-y,16px)")
                    .css("padding-right", "var(--jui-dialog-content-padding-y,16px)")
                    .css("padding-bottom", "var(--jui-dialog-content-padding-y,12px)");
                //
                /*
                // Select the node that will be observed for mutations
                const targetNode = jqDialog[0];
                // Options for the observer (which mutations to observe)
                const config = {
                    subtree: false
                    , childList: false
                    , attributes: true
                    , attributeFilter: ["style"]
                    , attributeOldValue: true
                    , characterData: false
                    , characterDataOldValue: false
                };
                // Callback function to execute when mutations are observed
                const callback = (pMutationList, pObserver) => {
                    for (const mutation of pMutationList) {
                        if (mutation.type === "childList") {
                            console.log("A child node has been added or removed.");
                        } else if (mutation.type === "attributes") {
                            console.log(`The "${mutation.attributeName}" attribute was modified:`
                                , "=>" + $(mutation.target).attr(mutation.attributeName)
                                , "=>" + mutation.oldValue
                            );
                        }
                    }
                };
                // Create an observer instance linked to the callback function
                const myMutationObserver = window.MutationObserver || window.WebKitMutationObserver;
                const observer = new myMutationObserver(callback);
                // Start observing the target node for configured mutations
                observer.observe(targetNode, config);
                // Later, you can stop observing
                // observer.disconnect();
                 */
                //
                // APEX does resize of page after 250 ms, what leads to scrolling dialog when the text is longer.
                setTimeout(function () {
                        //console.log(`setTimeout after ${250 + 100} ms.`);
                        //jqDialog.css("height", sCurrHeight);
                        if (jqDialog["dialog"]) {
                            jqDialog["dialog"]("option", "height", "auto");
                            //console.log("dialog option height set to auto!");
                        } else if (jqDialog["popup"]) {
                        }
                        dfd.resolve({Result: RETURN_CODES4NAME.SUCCESS, Message: "", JqDialog: jqDialog});
                    }
                    , 250 + 100
                );
            }
            , 0
        );
        return dfd.promise();
    };

    /**
     * Displays an alert dialog with the given message and OK button. The callback function passed as the pCallback
     * parameter is called when the dialog is closed. The dialog displays using the jQuery UI ‘Dialog’ widget.
     *
     * There are some differences between this function and a browser’s built-in alert function:
     * - The dialog style will be consistent with the rest of the app.
     * - The dialog can be moved.
     * - The call to apex.message.alert does not block. Any code defined following the call to apex.message.alert will
     *   run before the user presses OK. Therefore code to run after the user closes the dialog must be done from within
     *   the callback, as shown in the example.
     *
     * Note: If either of the following 2 pre-requisites are not met, the function falls back to using the browser’s
     * built-in confirm:
     * - jQuery UI dialog widget code must be loaded on the page.
     * - The browser must be running in ‘Standards’ mode. This is because if it is running in ‘Quirks’ mode (as is the
     *   case with some older themes), this can cause issues with display position, where the dialog positions itself in
     *   the vertical center of the page, rather than the center of the visible viewport.
     *
     * @param {String} pMessage     The message to display in the alert dialog
     * @param {Function} pCallback  Callback function called when dialog is closed.
     *
     * @example
     * // Displays an alert ‘Load complete.’, then after the dialog closes executes the ‘afterLoad()’ function.
     * apex.message.alert( "Load complete.", function(){
     *     afterLoad();
     * });
     *
     * @function alert
     * @memberOf pApps
     */
    pApps.alert = function (pMessage, pCallback, pOptions = {}) {
        let dfd = $.Deferred();
        pOptions = $.extend({
                id: null
                , title: ""
                , modern: true
            }
            , pOptions
        );
        // Put it at end of execution queue for sync AJAX callbacks
        setTimeout(function () {
                let jqDialog = showDialog("" + pMessage
                    , {
                        id: pOptions.id
                        , confirm: false
                        , title: pOptions.title
                        , modern: pOptions.modern
                        , callback: pCallback
                    }
                );
                //if (pApps.isVersionPassed([21], gApexVersion.split("."))) {}
                jqDialog
                    .css("padding-left", "var(--jui-dialog-content-padding-y,16px)")
                    .css("padding-right", "var(--jui-dialog-content-padding-y,16px)")
                    .css("padding-bottom", "var(--jui-dialog-content-padding-y,12px)");
                //
                // APEX does resize of page after 250 ms, what leads to scrolling dialog when the text is longer.
                setTimeout(function () {
                        if (jqDialog["dialog"]) {
                            jqDialog["dialog"]("option", "height", "auto");
                        } else if (jqDialog["popup"]) {
                        }
                        dfd.resolve({Result: RETURN_CODES4NAME.SUCCESS, Message: "", JqDialog: jqDialog});
                    }
                    , 250 + 100
                );
            }
            , 0
        );
        return dfd.promise();
    };

    /**
     * @public
     * @function
     * @memberOf pApps
     */
    pApps.debugger = function () {
        debugger;
    };

    /**
     * @public
     * @function
     * @memberOf pApps
     */
    pApps.isVersionPassed = function (pMinVersion, pCurrVersion) {
        if (!Array.isArray(pMinVersion)) {
            throw new Error("\"pMinVersion\" is not an array!");
        }
        if (!Array.isArray(pCurrVersion)) {
            throw new Error("\"pCurrVersion\" is not an array!");
        }
        if (pMinVersion.length === 0) {
            return false;
        }
        for (let i = 0; i < pMinVersion.length; i++) {
            if (typeof pMinVersion[i] === "string") {
                pMinVersion[i] = Number(pMinVersion[i]);
            }
            if (typeof pMinVersion[i] !== "number" || pMinVersion[i] < 0 || isNaN(pMinVersion[i])) {
                throw new Error("\"pMinVersion[" + String(i) + "]\" is not a positive number!");
            }
            let nCurrVersionValue;
            if (i >= pCurrVersion.length) {
                nCurrVersionValue = 0;
            } else {
                if (typeof pCurrVersion[i] === "string") {
                    pCurrVersion[i] = Number(pCurrVersion[i]);
                }
                if (typeof pCurrVersion[i] !== "number" || pCurrVersion[i] < 0 || isNaN(pCurrVersion[i])) {
                    throw new Error("\"pMinVersion[" + String(i) + "]\" is not a positive number!");
                }
                nCurrVersionValue = pCurrVersion[i];
            }
            if (nCurrVersionValue > pMinVersion[i]) {
                return true;
            } else if (nCurrVersionValue < pMinVersion[i]) {
                return false;
            } else if (i === pMinVersion.length - 1) {
                return true;
            }
        }
    };

    /**
     * @public
     * @var
     * @type {object}
     * @memberOf pApps
     */
    pApps._internalData = {
        apexShowError: []
        , successMessageOptions: {
            autoDismiss: true
            , duration: 5000 // Optional. Default value is 3000
        }
        , successMessageTimer: null
        , errorMessageOptions: {
            autoDismiss: false
            , duration: 5000
        }
        , errorMessageTimer: null
        , currLocale: null
    };

    /**
     * @private
     * @function
     * @memberOf pApps
     */
    function logServerProcessError(currApexServerProcess, pjqXHR, pTextStatus, pErrorThrown) {
        console.log("In error of \"" + currApexServerProcess + "\"!");
        console.log("pjqXHR", pjqXHR);
        console.log("pTextStatus", pTextStatus);
        console.log("pErrorThrown", pErrorThrown);
    }

    /**
     * @public
     * @function
     * @memberOf pApps
     */
    pApps.GetREGEX_SERVER_ERROR_CODES = function () {
        return REGEX_SERVER_ERROR_CODES;
    };

    /**
     * @public
     * @function
     * @memberOf pApps
     */
    pApps.GetREGEX_ERROR_MARKERS = function () {
        return REGEX_ERROR_MARKERS;
    };

    /**
     *
     * <span id="APEX_SUCCESS_MESSAGE" data-template-id="226472349264611790_S" class="apex-page-success u-hidden"></span>
     * <span id="APEX_ERROR_MESSAGE" data-template-id="226472349264611790_E" class="apex-page-error u-hidden"></span>
     *
     * <span id="APEX_ERROR_MESSAGE" data-template-id="226472349264611790_E" class="apex-page-error"><
     *    div class="t-Body-alert">
     *        <div class="t-Alert t-Alert--defaultIcons t-Alert--warning t-Alert--horizontal t-Alert--page t-Alert--colorBG" id="t_Alert_Notification" role="alert">
     *            <div class="t-Alert-wrap">
     *                <div class="t-Alert-icon">
     *                    <span class="t-Icon"></span>
     *                </div>
     *                <div class="t-Alert-content">
     *                    <div class="t-Alert-body">
     *                        <div class="a-Notification a-Notification--error">
     *                            <h2 class="a-Notification-title aErrMsgTitle">1 error has occurred</h2>
     *                            <ul class="a-Notification-list htmldbUlErr">
     *                                <li class="a-Notification-item htmldbOraErr">Perhaps "Username" or "Password" is not valid.<br><br>If the error still exists, please contact the System-Administrator! Current error reference: 1682889</li>
     *                            </ul>
     *                        </div>
     *                    </div>
     *                </div>
     *                <div class="t-Alert-buttons">
     *                    <button class="t-Button t-Button--noUI t-Button--icon t-Button--closeAlert" onclick="apex.jQuery('#t_Alert_Notification').remove();" type="button" title="Close Notification">
     *                        <span class="t-Icon icon-close"></span>
     *                    </button>
     *                </div>
     *            </div>
     *        </div>
     *    </div>
     * </span>
     *
     * apex.jQuery('#t_Alert_Notification').remove();
     * =>
     * <span id="APEX_ERROR_MESSAGE" data-template-id="226472349264611790_E" class="apex-page-error"><div class="t-Body-alert">
     *
     * </div></span>
     *
     * $("#APEX_ERROR_MESSAGE").html()
     * =>
     * '<div class="t-Body-alert">\n  \n</div>'
     *
     * $("#APEX_ERROR_MESSAGE").html(null) or $("#APEX_ERROR_MESSAGE").html("")
     *
     * $("#APEX_ERROR_MESSAGE").html()
     * =>
     * <span id="APEX_ERROR_MESSAGE" data-template-id="226472349264611790_E" class="apex-page-error"></span>
     *
     *
     *    dermalog.dl_common.apps.ApexShowError("My message!")
     *    #APEX_ERROR_MESSAGE
     *        .t-Body-alert
     *            #t_Alert_Notification
     *                .t-Alert-wrap
     *                    .t-Alert-icon
     *                        .t-Icon
     *                    .t-Alert-content
     *                        .t-Alert-body
     *                            .a-Notification.a-Notification--error
     *                                .a-Notification-title.aErrMsgTitle
     *                                .a-Notification-list.htmldbUlErr
     *                                    .a-Notification-item.htmldbStdErr
     *                                        "My message!"
     *                    .t-Alert-buttons
     *                        Button .t-Button.t-Button--noUI.t-Button--icon.t-Button--closeAlert
     *    $("#APEX_ERROR_MESSAGE .t-Body-alert #t_Alert_Notification .t-Alert-wrap .t-Alert-buttons Button.t-Button.t-Button--noUI.t-Button--icon.t-Button--closeAlert").on("click", (pEvent) => { console.log("Hello!!!"); });
     *    $("#APEX_ERROR_MESSAGE #t_Alert_Notification .t-Alert-buttons button.t-Button--closeAlert").on("click", (pEvent) => { console.log("Hello!!!"); });
     *
     *
     *    apex.message.showPageSuccess("My message!")
     *    <span id="APEX_SUCCESS_MESSAGE" data-template-id="215600330665437682_S" class="apex-page-success u-hidden">
     *        <div class="t-Body-alert">
     *            <div class="t-Alert t-Alert--defaultIcons t-Alert--success t-Alert--horizontal t-Alert--page t-Alert--colorBG" id="t_Alert_Success" role="alert">
     *                <div class="t-Alert-wrap">
     *                    <div class="t-Alert-icon">
     *                        <span class="t-Icon"></span>
     *                    </div>
     *                    <div class="t-Alert-content">
     *                        <div class="t-Alert-header">
     *                            <h2 class="t-Alert-title">My message!</h2>
     *                        </div>
     *                    </div>
     *                    <div class="t-Alert-buttons">
     *                        <button class="t-Button t-Button--noUI t-Button--icon t-Button--closeAlert" type="button" title="Close Notification">
     *                            <span class="t-Icon icon-close"></span>
     *                        </button>
     *                    </div>
     *                </div>
     *            </div>
     *        </div>
     *    </span>
     *    $("#APEX_SUCCESS_MESSAGE .t-Body-alert #t_Alert_Success .t-Alert-wrap .t-Alert-buttons button.t-Button.t-Button--noUI.t-Button--icon.t-Button--closeAlert").on("click", (pEvent) => { console.log("Hello!!!"); });
     *
     *
     * @public
     * @function
     * @memberOf pApps
     */
    pApps.ApexShowError = function (pErrorData, pOptions, pPreserveMsgCnt = 0) {
        let aErrorMessages = null
            , oOptions = null
            , nHideAfterSeconds = null
            , aErrorItems = null
            , nTimer4Messages = null
            , nTimer4Items = null;

        function onTimer4Messages() {
            nTimer4Messages = null;
            $("#APEX_ERROR_MESSAGE").removeClass("u-visible").addClass("u-hidden");
        }

        function onTimer4Items() {
            nTimer4Items = null;
            if (Array.isArray(aErrorItems) && aErrorItems.length > 0) {
                let sItemname = null;
                let jqItem = null;
                for (let i = 0; i < aErrorItems.length; i++) {
                    sItemname = aErrorItems[i].name;
                    jqItem = $("#" + sItemname);
                    jqItem.removeClass("apex-page-item-error");
                    jqItem.attr("aria-describedby", null);
                    jqItem.attr("aria-invalid", null);
                    jqItem = $("#" + sItemname + "_error_placeholder");
                    jqItem.removeClass("u-visible").addClass("u-hidden");
                    jqItem.find("span.t-Form-error").remove();
                }
            }
        }

        if (typeof pOptions === "object" && pOptions !== null) {
            oOptions = {};
            oOptions.type = "error";
            oOptions.location = (typeof pOptions.location === "undefined" ? "page" : pOptions.location);
            oOptions.unsafe = (typeof pOptions.unsafe === "undefined" ? true : pOptions.unsafe);
            oOptions.callBacks = (typeof pOptions.callBacks === "undefined" ? {onClickClose: null} : pOptions.callBacks);
            nHideAfterSeconds = (typeof pOptions.hideAfterSeconds === "undefined" ? -1 : pOptions.hideAfterSeconds);
        } else {
            oOptions = {
                type: "error", location: "page", unsafe: true, callBacks: {onClickClose: null}
            };
            nHideAfterSeconds = -1;
        }
        if (pErrorData) {
            switch ($.type(pErrorData)) {
                case "string":
                    aErrorMessages = [{
                        type: oOptions.type,
                        location: oOptions.location,
                        message: pErrorData.replace(REGEX_SERVER_ERROR_CODES, ""),
                        unsafe: oOptions.unsafe
                    }];
                    break;
                case "object":
                    if ($.type(pErrorData.message) === "string") {
                        aErrorMessages = [{
                            type: (typeof pErrorData.type === "undefined" ? oOptions.type : pErrorData.type),
                            location: (typeof pErrorData.location === "undefined" ? oOptions.location : pErrorData.location),
                            message: pErrorData.message.replace(REGEX_SERVER_ERROR_CODES, ""),
                            unsafe: (typeof pErrorData.unsafe === "undefined" ? oOptions.unsafe : pErrorData.unsafe)
                        }];
                    } else if ($.type(pErrorData.message) === "array") {
                        if (pErrorData.message.length > 0) {
                            aErrorMessages = [];
                            for (let i = 0; i < pErrorData.message.length; i++) {
                                switch ($.type(pErrorData.message[i])) {
                                    case "string":
                                        aErrorMessages.push({
                                            type: (typeof pErrorData.type === "undefined" ? oOptions.type : pErrorData.type),
                                            location: (typeof pErrorData.location === "undefined" ? oOptions.location : pErrorData.location),
                                            message: pErrorData.message[i].replace(REGEX_SERVER_ERROR_CODES, ""),
                                            unsafe: (typeof pErrorData.unsafe === "undefined" ? oOptions.unsafe : pErrorData.unsafe)
                                        });
                                        break;
                                    default:
                                        console.error("pApps.ApexShowError", arguments);
                                        throw new Error("Unknown type of \"pErrorData.message[" + i + "]\"[" + $.type(pErrorData.message) + "]!");
                                        break;
                                }
                            }
                        }
                    }
                    if ($.type(pErrorData.item) === "object") {
                        if (!dermalog.dl_common.utils.isEmpty(pErrorData.item.name) && !dermalog.dl_common.utils.isEmpty(pErrorData.item.message)) {
                            aErrorItems = [{
                                name: pErrorData.item.name,
                                message: pErrorData.item.message.replace(REGEX_SERVER_ERROR_CODES, "")
                            }];
                        }
                    } else if ($.type(pErrorData.item) === "array") {
                        if (pErrorData.item.length > 0) {
                            aErrorItems = [];
                            for (let i = 0; i < pErrorData.item.length; i++) {
                                switch ($.type(pErrorData.item[i])) {
                                    case "object":
                                        if (!dermalog.dl_common.utils.isEmpty(pErrorData.item[i].name) && !dermalog.dl_common.utils.isEmpty(pErrorData.item[i].message)) {
                                            aErrorItems.push({
                                                name: pErrorData.item[i].name,
                                                message: pErrorData.item[i].message.replace(REGEX_SERVER_ERROR_CODES, "")
                                            });
                                        }
                                        break;
                                    default:
                                        console.error("pApps.ApexShowError", arguments);
                                        throw new Error("Unknown type of \"pErrorData.item[" + i + "]\"[" + $.type(pErrorData.item) + "]!");
                                        break;
                                }
                            }
                        }
                    }
                    break;
                case "array":
                    if (pErrorData.length > 0) {
                        aErrorMessages = [];
                        for (let i = 0; i < pErrorData.length; i++) {
                            switch ($.type(pErrorData[i])) {
                                case "string":
                                    aErrorMessages.push({
                                        type: oOptions.type,
                                        location: oOptions.location,
                                        message: pErrorData[i].replace(REGEX_SERVER_ERROR_CODES, ""),
                                        unsafe: oOptions.unsafe
                                    });
                                    break;
                                case "object":
                                    aErrorMessages.push({
                                        type: (typeof pErrorData[i].type === "undefined" ? oOptions.type : pErrorData[i].type),
                                        location: (typeof pErrorData[i].location === "undefined" ? oOptions.location : pErrorData[i].location),
                                        message: pErrorData[i].message.replace(REGEX_SERVER_ERROR_CODES, ""),
                                        unsafe: (typeof pErrorData[i].unsafe === "undefined" ? oOptions.unsafe : pErrorData[i].unsafe)
                                    });
                                    break;
                                default:
                                    console.error("pApps.ApexShowError", arguments);
                                    throw new Error("Unknown type of \"pErrorData[" + i + "]\"[" + $.type(pErrorData) + "]!");
                                    break;
                            }
                        }
                    }
                    break;
                case "error":
                    pErrorData.type = (typeof pErrorData.type === "undefined" ? oOptions.type : pErrorData.type);
                    pErrorData.location = (typeof pErrorData.location === "undefined" ? oOptions.location : pErrorData.location);
                    pErrorData.message = pErrorData.message.replace(REGEX_SERVER_ERROR_CODES, "");
                    pErrorData.unsafe = (typeof pErrorData.unsafe === "undefined" ? oOptions.unsafe : pErrorData.unsafe);
                    aErrorMessages = [pErrorData];
                    break;
                default:
                    console.error("pApps.ApexShowError", arguments);
                    if (typeof pErrorData === "undefined") {
                        throw new Error("Unsupported type of pErrorData is \"undefined\"!");
                    } else {
                        throw new Error("Unsupported type of pErrorData is \"" + $.type(pErrorData) + "\"!");
                    }
                    break;
            }
        }
        apex.message.clearErrors();
        if (Array.isArray(aErrorItems)) {
            if (aErrorItems.length > 0) {
                let sItemname = null;
                let jqItem = null;
                for (let i = 0; i < aErrorItems.length; i++) {
                    sItemname = aErrorItems[i].name;
                    jqItem = $("#" + sItemname + "_error_placeholder");
                    jqItem.append("<span class=\"t-Form-error\"><div id=\"" + sItemname + "_error\">" + aErrorItems[i].message + "</div></span>");
                    jqItem.removeClass("u-hidden").addClass("u-visible");
                    jqItem = $("#" + sItemname);
                    jqItem.attr("aria-invalid", "true");
                    jqItem.attr("aria-describedby", sItemname + "_error");
                    jqItem.addClass("apex-page-item-error");
                }
                if (nHideAfterSeconds > -1) {
                    nTimer4Items = setTimeout(onTimer4Items
                        , nHideAfterSeconds * 1000
                    );
                }
            }
        }
        if (Array.isArray(aErrorMessages)) {
            if (aErrorMessages.length > 0) {
                if (pPreserveMsgCnt && pPreserveMsgCnt > 0) {
                    function appendNewMsg() {
                        let iDeleteEntryCnt = pApps._internalData.apexShowError.length - pPreserveMsgCnt;
                        if (iDeleteEntryCnt > 0) {
                            pApps._internalData.apexShowError.splice(0, iDeleteEntryCnt);
                        }
                        aErrorMessages.forEach((pError) => {
                            pApps._internalData.apexShowError.push(pError);
                        });
                    }

                    let iShownLastMsgIdx = pApps._internalData.apexShowError.length - 1;
                    if (iShownLastMsgIdx > -1) {
                        if (!Object.is(aErrorMessages[0].message, pApps._internalData.apexShowError[iShownLastMsgIdx].message)
                            || !Object.is(aErrorMessages[0].unsafe, pApps._internalData.apexShowError[iShownLastMsgIdx].unsafe)
                            || !Object.is(aErrorMessages[0].location, pApps._internalData.apexShowError[iShownLastMsgIdx].location)
                            || !Object.is(aErrorMessages[0].type, pApps._internalData.apexShowError[iShownLastMsgIdx].type)
                        ) {
                            // New MSG is not equal to currently shown last MSG, so add new MSG
                            appendNewMsg();
                        }
                    } else {
                        // There is no currently shown last MSG, so add new MSG
                        appendNewMsg();
                    }
                } else {
                    pApps._internalData.apexShowError = aErrorMessages;
                }
                apex.message.showErrors(pApps._internalData.apexShowError);
                if (oOptions.callBacks) {
                    if (oOptions.callBacks.onClickClose) {
                        // "mouseover" "mouseenter" "mouseleave"
                        let isMouseOver = false;
                        $("#APEX_ERROR_MESSAGE #t_Alert_Notification .t-Alert-buttons button.t-Button--closeAlert")
                            .on("mouseover"
                                , function (/*pEvent*/) {
                                    isMouseOver = true;
                                }
                            )
                            .on("mouseleave"
                                , function (/*pEvent*/) {
                                    isMouseOver = false;
                                }
                            )
                            .on("click", (pEvent) => {
                                    if (isMouseOver === true) {
                                        if (nTimer4Messages) {
                                            clearTimeout(nTimer4Messages);
                                            nTimer4Messages = null;
                                        }
                                        if (nTimer4Items) {
                                            clearTimeout(nTimer4Items);
                                            nTimer4Items = null;
                                        }
                                        oOptions.callBacks.onClickClose(pEvent);
                                    }
                                }
                            );
                    }
                }
                if (nHideAfterSeconds > -1) {
                    nTimer4Messages = setTimeout(onTimer4Messages
                        , nHideAfterSeconds * 1000
                    );
                }
            }
        }
    };

    /**
     * @deprecated
     * @public
     * @function
     * @memberOf pApps
     */
    pApps.DefaultActionClickShowSuccess = function () {
        //apex.message.hidePageSuccess();
        $("#t_Alert_Success").fadeOut("slow");
    };

    /**
     * @deprecated
     * @public
     * @function
     * @memberOf pApps
     */
    pApps.DefaultActionAfterShowSuccess = function () {
        setTimeout(function () {
            pApps.DefaultActionClickShowSuccess();
        }, 3000);
    };

    /**
     * @deprecated
     * @public
     * @function
     * @memberOf pApps
     */
    pApps.DefaultActionClickShowError = function () {
        //<div class="t-Alert t-Alert--defaultIcons t-Alert--warning t-Alert--horizontal t-Alert--page t-Alert--colorBG" id="t_Alert_Notification" role="alert">
        $("#t_Alert_Notification").fadeOut("slow");
        apex.message.clearErrors();
    };

    /**
     * @deprecated
     * @public
     * @function
     * @memberOf pApps
     */
    pApps.DefaultActionAfterShowError = function () {
        setTimeout(function () {
            pApps.DefaultActionClickShowError();
        }, 5000);
    };

    /**
     * @public
     * @function
     * @memberOf pApps
     */
    pApps.DefaultOnPageQryParamSuccessMsg = function (pJqoSuccessMsg, pJqoAlert) {
        // Note APEX 5.1.x: Page requests with query parameter "success_msg" have no click event defined onto the button ".t-Button--closeAlert"!
        let jqoAlertSuccessButton = pJqoAlert.find(".t-Button--closeAlert");
        if (jqoAlertSuccessButton.length > 0) {
            //console.log("DefaultOnPageLoad: Has jqoAlertSuccessButton");
            if (!jqoAlertSuccessButton.prop("onclick")) {
                //console.log("DefaultOnPageLoad: Has NOT prop 'onclick'");
                jqoAlertSuccessButton.on("click", function (pEvent) {
                    //pEvent.stopPropagation();
                    apex.message.hidePageSuccess();
                    //pEvent.preventDefault();
                });
                //console.log("DefaultOnPageLoad: Add own 'onclick'");
            } else {
                //console.log("DefaultOnPageLoad: Has prop 'onclick'");
            }
        } else {
            //console.log("DefaultOnPageLoad: Has NOT jqoAlertSuccessButton");
        }
    };

    /**
     * @public
     * @function
     * @memberOf pApps
     */
    pApps.DefaultThemeHookBeforeShow = function (pMsgType, pJqoMsg) {
        let bResult = true;
        let jqoAlert;
        //let jqoAlertButton;
        if (pMsgType === apex.message.TYPE.SUCCESS) {
            jqoAlert = pJqoMsg.find("#t_Alert_Success");
            if (jqoAlert.length > 0) {
                //console.log("DefaultThemeHookBeforeShow: Has jqoAlert");
                if (pApps._internalData.successMessageOptions.autoDismiss === true) {
                    pApps._internalData.successMessageTimer = setTimeout(function () {
                        pApps._internalData.successMessageTimer = null;
                        apex.message.hidePageSuccess();
                    }, pApps._internalData.successMessageOptions.duration);
                }
            } else {
                //console.log("DefaultThemeHookBeforeShow: Has NOT jqoAlert");
            }
        } else if (pMsgType === apex.message.TYPE.ERROR) {
            jqoAlert = pJqoMsg.find("#t_Alert_Notification");
            if (jqoAlert.length > 0) {
                //console.log("DefaultThemeHookBeforeShow: Has jqoAlert");
                if (pApps._internalData.errorMessageOptions.autoDismiss === true) {
                    pApps._internalData.errorMessageTimer = setTimeout(function () {
                        pApps._internalData.errorMessageTimer = null;
                        apex.message.clearErrors();
                    }, pApps._internalData.errorMessageOptions.duration);
                }
            } else {
                //console.log("DefaultThemeHookBeforeShow: Has NOT jqoAlert");
            }
        }
        //console.log("DefaultThemeHookBeforeShow: Returns", bResult);
        return bResult;
    };

    /**
     * @public
     * @function
     * @memberOf pApps
     */
    pApps.DefaultThemeHookBeforeHide = function (pMsgType, pJqoMsg) {
        let bResult = true;
        let jqoAlert;
        let jqoAlertButton;
        if (pMsgType === apex.message.TYPE.SUCCESS) {
            if (pApps._internalData.successMessageTimer) {
                clearTimeout(pApps._internalData.successMessageTimer);
                pApps._internalData.successMessageTimer = null;
            }
            jqoAlert = pJqoMsg.find("#t_Alert_Success");
        } else if (pMsgType === apex.message.TYPE.ERROR) {
            if (pApps._internalData.errorMessageTimer) {
                clearTimeout(pApps._internalData.errorMessageTimer);
                pApps._internalData.errorMessageTimer = null;
            }
            jqoAlert = pJqoMsg.find("#t_Alert_Notification");
        }
        if (jqoAlert.length > 0) {
            //console.log("DefaultThemeHookBeforeHide: Has jqoAlert");
            jqoAlertButton = jqoAlert.find(".t-Button--closeAlert");
            if (jqoAlertButton.length > 0) {
                //console.log("DefaultThemeHookBeforeHide: Has jqoAlertButton");
                if (jqoAlertButton.prop("onclick")) {
                    //console.log("DefaultThemeHookBeforeHide: Has prop onclick");
                    jqoAlertButton.trigger("click");
                    //console.log("DefaultThemeHookBeforeHide: Triggered click");
                    bResult = false;
                } else {
                    //console.log("DefaultThemeHookBeforeHide: Has NOT prop onclick");
                }
            } else {
                //console.log("DefaultThemeHookBeforeHide: Has NOT jqoAlertButton");
            }
        } else {
            //console.log("DefaultThemeHookBeforeHide: Has NOT jqoAlert");
        }

        //console.log("DefaultThemeHookBeforeHide: Returns", bResult);
        return bResult;
    };

    /**
     * @public
     * @function
     * @memberOf pApps
     */
    pApps.DefaultOnPageLoad = function (pOnPageQryParamSuccessMsg = dermalog.dl_common.apps.DefaultOnPageQryParamSuccessMsg, pThemeHookBeforeShow = dermalog.dl_common.apps.DefaultThemeHookBeforeShow, pThemeHookBeforeHide = dermalog.dl_common.apps.DefaultThemeHookBeforeHide) {
        // Configure "SuccessMessages" on pages requested with query parameter "success_msg"
        try {
            apex.theme42.configureSuccessMessages(pApps._internalData.successMessageOptions);
            if (apex.theme42.configureSuccessMessages.options === undefined) {
                apex.theme42.configureSuccessMessages.options = pApps._internalData.successMessageOptions;
            }
        } catch (err) {
            //TODO: Uncaught TypeError: Cannot read property 'configureSuccessMessages' of undefined
            if (apex.theme42 === undefined) {
                // Current page ( $v("pFlowStepId") === "" ) or context does not support "theme42"
            } else {
                throw err;
            }
        }

        // Note: Loop through all event handlers
        // $._data($("#t_Alert_Success .t-Button--closeAlert")[0], "events")
        // $._data($("#t_Alert_Success .t-Button--closeAlert")[0], "events")["click"][0].handler()

        // <span id="APEX_SUCCESS_MESSAGE" data-template-id="89245417536259177_S" class="apex-page-success u-hidden"></span>
        // <span id="APEX_ERROR_MESSAGE" data-template-id="89245417536259177_E" class="apex-page-error u-hidden"></span>
        let jqoApexSuccessMessage = $("#APEX_SUCCESS_MESSAGE");
        if (jqoApexSuccessMessage.length > 0) {
            let jqoAlertSuccess = jqoApexSuccessMessage.find("#t_Alert_Success");
            if (jqoAlertSuccess.length > 0) {
                //console.log("DefaultOnPageLoad: Has jqoAlertSuccess");
                if (pOnPageQryParamSuccessMsg) {
                    pOnPageQryParamSuccessMsg(jqoApexSuccessMessage, jqoAlertSuccess);
                }
            } else {
                //console.log("DefaultOnPageLoad: Has NOT jqoAlertSuccess");
            }
        }

        // Must be called in "Page Load"
        apex.message.setThemeHooks({
            beforeShow: function (pMsgType, pJqoMsg) {
                let bResult = true;
                if (pThemeHookBeforeShow) {
                    bResult = pThemeHookBeforeShow(pMsgType, pJqoMsg);
                }
                //console.log("setThemeHooks.beforeShow: Returns", bResult);
                return bResult;
            }, beforeHide: function (pMsgType, pJqoMsg) {
                let bResult = true;
                if (pThemeHookBeforeHide) {
                    bResult = pThemeHookBeforeHide(pMsgType, pJqoMsg);
                }
                //console.log("setThemeHooks.beforeHide: Returns", bResult);
                return bResult;
            }
            //, closeNotificationSelector: "button.t-Button--closeAlert"
        });
    };

    /**
     * @public
     * @function
     * @memberOf pApps
     */
    pApps.ApexShowAlert = function (pMsg, pOptions) {
        if (typeof pMsg !== "string" || dermalog.dl_common.utils.isEmpty(pMsg)) {
            throw new Error("pMsg is not a string or empty!");
        }

        let lOptions;

        if (typeof pOptions === "object" && pOptions !== null) {
            lOptions = {};
            lOptions.callback = (typeof pOptions.callback === "undefined" ? null : pOptions.callback);
            lOptions.id = (typeof pOptions.id === "undefined" ? null : pOptions.id);
        } else {
            lOptions = {
                callback: null, id: null
            };
        }

        if (pApps.closeUnneededAlertDlgs() === 0) {
            pApps.alert(pMsg
                , lOptions.callback
                , {id: lOptions.id}
            );
            /*
            if (lOptions.id) {
                $("[role=\"alertdialog\"]").last().attr("id", lOptions.id);
                if ($("#" + lOptions.id).length === 0) {
                    //console.log("Could not set id[" + lOptions.id + "] of alertdialog!");
                    // This happens minimum at APEX 20.2
                    setTimeout(function () {
                        $("[role=\"alertdialog\"]").last().attr("id", lOptions.id);
                        if ($("#" + lOptions.id).length === 0) {
                            console.log("Could also not set id[" + lOptions.id + "] by setTimeout of alertdialog!");
                        }
                    }, 0);
                }
            }
             */
        }
    };

    /**
     * @public
     * @function
     * @memberOf pApps
     */
    pApps.ApexUrlSplitParam = function (pUrl, pOptions = {}) {
        const PARAM_ESCAPE_CHAR = "\\";
        let oOptions = $.extend(true, {
            paramDelim: ":"
            , useCurrentValueOf: {
                app_id: false, page_id: false, session_id: true, request: false, debug: true
            }
            , urlType: pApps.apexUrlType
        }, pOptions);
        if (["#", "&", PARAM_ESCAPE_CHAR].includes(oOptions.paramDelim)) {
            throw new Error("Invalid \"Params Delimiter\"!");
        }
        // Available replacements
        const REPLACEMENTS = ["$A$", "$B$", "$C$", "$D$", "$E$", "$F$", "$G$"];
        // Split into pre_part and rest_part
        const REGEX_PRE_AND_REST_PARTS = new RegExp("^([^?]*\\?p=)(.*)$", "im");
        // Escaped escape character
        const REGEX_ESCAPED_ESCAPE = new RegExp("\\" + PARAM_ESCAPE_CHAR + "\\" + PARAM_ESCAPE_CHAR, "gim");
        // Split into apex_params and post_part
        const REGEX_PARAMS_POST = new RegExp("^([^" + oOptions.paramDelim + "&#]+)" + "(?:" + oOptions.paramDelim + "([^" + oOptions.paramDelim + "&#]*)" + "(?:" + oOptions.paramDelim + "([^" + oOptions.paramDelim + "&#]*)" + "(?:" + oOptions.paramDelim + "([^" + oOptions.paramDelim + "&#]*)" + "(?:" + oOptions.paramDelim + "([^" + oOptions.paramDelim + "&#]*)" + "(?:" + oOptions.paramDelim + "([^" + oOptions.paramDelim + "&#]*)" + "(?:" + oOptions.paramDelim + "([^" + oOptions.paramDelim + "&#]*)" + "(?:" + oOptions.paramDelim + "([^" + oOptions.paramDelim + "&#]*)" + "(?:" + oOptions.paramDelim + "([^" + oOptions.paramDelim + "&#]*))?)?)?)?)?)?)?)?([^&#]*)" + "((?:&|#).+)?$", "im");
        let result = null;
        let groups_0 = null;
        let groups_1 = null;
        let escapedEscapeReplacement = null;
        let escapedParamsReplacement = null;
        let escapedParams = null;
        let nextReplacementIdx = 0;

        function replaceReplacement(pValue) {
            let result = pValue;
            if (escapedParamsReplacement) {
                if (result.indexOf(escapedParamsReplacement) > -1) {
                    result = result.replaceAll(escapedParamsReplacement, escapedParams[nextReplacementIdx]);
                    nextReplacementIdx++;
                }
            }
            if (escapedEscapeReplacement) {
                if (result.indexOf(escapedEscapeReplacement) > -1) {
                    result = result.replaceAll(escapedEscapeReplacement, PARAM_ESCAPE_CHAR + PARAM_ESCAPE_CHAR);
                }
            }
            return result;
        }

        groups_0 = pUrl.match(REGEX_PRE_AND_REST_PARTS);
        if (oOptions.urlType === 1 && groups_0 && groups_0.length >= 2) {
            // pApps.getApexUrlType()
            // 1: Colon delimited url
            // 2: User friendly url
            // 8: Images url
            // 9: Any other url
            result = {
                urlType: oOptions.urlType,
                pre_part: (groups_0[1] === undefined ? "" : groups_0[1]),
                param_delim: (oOptions.paramDelim === undefined ? "" : oOptions.paramDelim),
                param_escape: PARAM_ESCAPE_CHAR
            };
            if (!dermalog.dl_common.utils.isEmpty(groups_0[2])) {
                if (groups_0[2].match(REGEX_ESCAPED_ESCAPE)) {
                    // There exists an escaped escape-character
                    for (let i = 0; i < REPLACEMENTS.length; i++) {
                        if (!groups_0[2].match(new RegExp(REPLACEMENTS[i], "gim"))) {
                            escapedEscapeReplacement = REPLACEMENTS[i];
                            break;
                        }
                    }
                    if (!escapedEscapeReplacement) {
                        throw  new Error("Could not determine an \"Escaped Escape-Replacement\"!");
                    }
                    groups_0[2] = groups_0[2].replace(REGEX_ESCAPED_ESCAPE, escapedEscapeReplacement);
                }

                escapedParams = groups_0[2].match(new RegExp("(\\" + PARAM_ESCAPE_CHAR + "[^\\" + PARAM_ESCAPE_CHAR + "]*\\" + PARAM_ESCAPE_CHAR + ")", "gim"));
                if (escapedParams) {
                    for (let i = 0; i < REPLACEMENTS.length; i++) {
                        if ((escapedEscapeReplacement && REPLACEMENTS[i] !== escapedEscapeReplacement) && !groups_0[2].match(new RegExp(REPLACEMENTS[i], "gim"))) {
                            escapedParamsReplacement = REPLACEMENTS[i];
                            break;
                        }
                    }
                    if (!escapedParamsReplacement) {
                        throw  new Error("Could not determine an \"Escaped Params Replacement\"!");
                    }
                    groups_0[2] = groups_0[2].replace(new RegExp("(\\" + PARAM_ESCAPE_CHAR + "[^\\" + PARAM_ESCAPE_CHAR + "]*\\" + PARAM_ESCAPE_CHAR + ")", "gim"), escapedParamsReplacement);
                }

                groups_1 = groups_0[2].match(REGEX_PARAMS_POST);
                if (oOptions.useCurrentValueOf.app_id === true) {
                    result.app_id = apex.item("pFlowId").getValue();
                } else {
                    result.app_id = (groups_1[1] === undefined ? "" : groups_1[1]);
                    result.app_id = replaceReplacement(result.app_id);
                }
                if (oOptions.useCurrentValueOf.page_id === true) {
                    result.page_id = apex.item("pFlowStepId").getValue();
                } else {
                    result.page_id = (groups_1[2] === undefined ? "" : groups_1[2]);
                    result.page_id = replaceReplacement(result.page_id);
                }
                if (oOptions.useCurrentValueOf.session_id === true) {
                    result.session_id = apex.item("pInstance").getValue();
                } else {
                    result.session_id = (groups_1[3] === undefined ? "" : groups_1[3]);
                    result.session_id = replaceReplacement(result.session_id);
                }
                if (oOptions.useCurrentValueOf.request === true) {
                    result.request = apex.item("pRequest").getValue();
                } else {
                    result.request = (groups_1[4] === undefined ? "" : groups_1[4]);
                    result.request = replaceReplacement(result.request);
                }
                if (oOptions.useCurrentValueOf.debug === true) {
                    result.debug = apex.item("pdebug").getValue();
                } else {
                    result.debug = (groups_1[5] === undefined ? "" : groups_1[5]);
                    result.debug = replaceReplacement(result.debug);
                }
                result.clear_cache = (groups_1[6] === undefined ? "" : groups_1[6]);
                result.clear_cache = replaceReplacement(result.clear_cache);
                result.item_names = (groups_1[7] === undefined ? "" : groups_1[7]);
                result.item_names = replaceReplacement(result.item_names);
                result.item_values = (groups_1[8] === undefined ? "" : groups_1[8]);
                result.item_values = replaceReplacement(result.item_values);
                result.printer_friendly = (groups_1[9] === undefined ? "" : groups_1[9]);
                result.printer_friendly = replaceReplacement(result.printer_friendly);
                result.unknown = (groups_1[10] === undefined ? "" : groups_1[10]);
                result.unknown = replaceReplacement(result.unknown);
                result.post_part = (groups_1[11] === undefined ? "" : groups_1[11]);
                result.post_part = replaceReplacement(result.post_part);
            } else {
                result.app_id = "";
                result.page_id = "";
                result.session_id = "";
                result.request = "";
                result.debug = "";
                result.clear_cache = "";
                result.item_names = "";
                result.item_values = "";
                result.printer_friendly = "";
                result.unknown = "";
                result.post_part = "";
            }
        } else if (oOptions.urlType === 2) {
            // pApps.getApexUrlType()
            // 1: Colon delimited url
            // 2: User friendly url
            // 8: Images url
            // 9: Any other url
            throw new Error("Not a supported APEX-Url!");
        } else {
            throw new Error("Not a valid APEX-Url!");
        }
        return result;
    };

    /**
     * @public
     * @function
     * @memberOf pApps
     */
    pApps.ApexUrlConcat = function (pUrlObject) {
        let sResult = null;
        let oUrlObject = $.extend(true, {
            urlType: pApps.apexUrlType
        }, pUrlObject);
        if (oUrlObject) {
            // pApps.getApexUrlType()
            // 1: Colon delimited url
            // 2: User friendly url
            // 8: Images url
            // 9: Any other url
            if (oUrlObject.urlType === 1) {
                sResult = oUrlObject.pre_part + oUrlObject.app_id + oUrlObject.param_delim + oUrlObject.page_id + oUrlObject.param_delim + oUrlObject.session_id + oUrlObject.param_delim + oUrlObject.request + oUrlObject.param_delim + oUrlObject.debug + oUrlObject.param_delim + oUrlObject.clear_cache + oUrlObject.param_delim + oUrlObject.item_names + oUrlObject.param_delim + oUrlObject.item_values + oUrlObject.param_delim + oUrlObject.printer_friendly + (!dermalog.dl_common.utils.isEmpty(oUrlObject.unknown) ? oUrlObject.param_delim + oUrlObject.unknown : "") + oUrlObject.post_part;
            } else if (oUrlObject.urlType === 2) {
                sResult = null;
            }
        }
        return sResult;
    };

    /**
     * @public
     * @function
     * @param {String} pUrl
     * @return {object} JQuery.Promise
     * @returns {Object} JQuery.Promise
     * @memberOf pApps
     */
    pApps.CheckUrlConnect = function (pUrl) {
        let dfdResult = $.Deferred();
        /*
        $.ajax({
            url: pUrl
            , data: undefined
            , success: undefined
            , dataType: undefined
        });
         */
        $.get(pUrl)
            .done(function (pData, pTextStatus, pJqXHR) {
                if (typeof pData === "string" && pData.match(/class="ErrorPageMessage"/)) {
                    dfdResult.reject({
                        Result: RETURN_CODES4NAME.ERROR, Message: "Error page detected", Status: pTextStatus
                    });
                } else {
                    dfdResult.resolve({
                        Result: RETURN_CODES4NAME.SUCCESS, Message: null, Status: pTextStatus
                    });
                }
            })
            .fail(function (pJqXHR, pTextStatus, pErrorThrown) {
                dfdResult.reject({
                    Result: RETURN_CODES4NAME.ERROR, Message: pErrorThrown.message, Status: pTextStatus
                });
            });
        return dfdResult.promise();
    };

    /**
     * @public
     * @function
     * @param {String} pHref
     * @return {URL}
     * @returns {URL}
     * @memberOf pApps
     */
    pApps.GetCheckedURL = function (pHref) {
        let urlResult = new URL(pHref);
        if (urlResult.href.indexOf("\\") > 0) {
            urlResult = new URL(urlResult.href.replaceAll("\\", "%5C"));
        }
        return urlResult;
    };

    /**
     *     pjqXHR:
     *         readyState:
     *             0    UNSENT              Client has been created. open() not called yet.
     *             1    OPENED                open() has been called.
     *             2    HEADERS_RECEIVED    send() has been called, and headers and status are available.
     *             3    LOADING                Downloading; responseText holds partial data.
     *             4    DONE                The operation is complete.
     *
     *         responseText:
     *
     *         status:
     *             The read-only XMLHttpRequest.status property returns the numerical HTTP status code of the XMLHttpRequest's
     *             response.
     *             Before the request completes, the value of status is 0. Browsers also report a status of 0
     *             in case of XMLHttpRequest errors.
     *
     *         statusText:
     *             The read-only XMLHttpRequest.statusText property returns a DOMString containing the response's status message
     *             as returned by the HTTP server. Unlike XMLHTTPRequest.status which indicates a numerical status code,
     *             this property contains the text of the response status, such as "OK" or "Not Found".
     *             If the request's readyState is in UNSENT or OPENED state, the value of statusText will be an empty string.
     *
     *             If the server response doesn't explicitly specify a status text, statusText will assume the default value "OK".
     *
     *
     *         apex.server.process:
     *             See jQuery documentation of jQuery.ajax for these supported attributes:
     *             "accepts", "dataType", "beforeSend", "contents", "converters", "dataFilter", "headers", "complete", "statusCode", "error", "success"
     *             The dataType option defaults to json.
     *             async is deprecated and will be removed in a future release
     *
     *
     * @public
     * @function
     * @memberOf pApps
     */
    pApps.ApexServerProcess = function (pName, pData, pOptions) {
        /*
         * let spinner = apex.util.showSpinner($("body"));
         *
         * var lSpinner$, lPromise;
         * lPromise = doLongProcess();
         * util.delayLinger.start( "main", function() {
         *     lSpinner$ = util.showSpinner( $( "#container_id" ) );
         * } );
         * lPromise.always( function() {
         *     util.delayLinger.finish( "main", function() {
         *         lSpinner$.remove();
         *     } );
         * } );
         *
         *
         * complete: function (pData) {
         *       spinner.remove();
         *   }
         *
         */

        if (typeof pOptions !== "object" || pOptions === null) {
            pOptions = {dataType: "text"};
        }

        let dfdResult = $.Deferred();
        let jqPromise;
        let lSuccessCallback;
        let lErrorCallback;
        let lCompleteCallback;
        let lIsUseWaitPopup = (typeof pOptions.waitPopup === "object" ? true : false);
        let lIsJsonRequested = false;
        let lTextStatus = null;
        let REGEX_SESSION_EXPIRED_2 = null;
        let oHOME_LINK = null;

        if (dermalog["dl_user_management"]
            && dermalog["dl_user_management"]["apps"]
            && dermalog["dl_user_management"]["apps"]["A1000"]
            && dermalog["dl_user_management"]["apps"]["A1000"]["appItems"]
            && dermalog["dl_user_management"]["apps"]["A1000"]["appItems"]["HOME_LINK"]
        ) {
            oHOME_LINK = dermalog["dl_user_management"]["apps"]["A1000"]["appItems"]["HOME_LINK"].match(/([^:]+):([^:]+):/im);
        }
        if (oHOME_LINK) {
            REGEX_SESSION_EXPIRED_2 = new RegExp("Click .* href=\"" + (oHOME_LINK[1] + ":" + oHOME_LINK[2]).replaceAll("?", "\\?") + "\".*here.* to create a new session", "gim");
        }

        function isREGEX_SESSION_EXPIRED(pData) {
            return (pData.match(REGEX_SESSION_EXPIRED_0) || pData.match(REGEX_SESSION_EXPIRED_1) || (REGEX_SESSION_EXPIRED_2 && pData.match(REGEX_SESSION_EXPIRED_2)));
        }

        function onSessionExpired(pData) {
            let oResult = {isHandled: false, jqPromise: null};
            let dfd = $.Deferred();

            function doCheckUrlAndConnect(pURL) {
                let waitPopup = apex.widget.waitPopup();
                let urlURL = dermalog.dl_common.apps.GetCheckedURL(pURL.href);
                dermalog.dl_common.apps.CheckUrlConnect(urlURL.href)
                    .then(function (pResp) {
                            //console.log("then.done",arguments);
                            waitPopup.remove();
                            dermalog.dl_common.apps.cancelPage();
                            apex.navigation.redirect(urlURL.href);
                            console.log("Location changed 4", urlURL.href);
                            dfd.resolve(pResp);
                            return pResp;
                        }
                        , function (pResp) {
                            //console.log("then.fail", pResp, urlURL.href);
                            waitPopup.remove();
                            if (pApps.closeUnneededAlertDlgs() === 0) {
                                dermalog.dl_common.apps.confirm("The URL is not reachable!\n\nTry again?"
                                    , function (pIsOk) {
                                        if (pIsOk) {
                                            doCheckUrlAndConnect(urlURL);
                                        } else {
                                            dfd.reject(pResp);
                                        }
                                    }
                                    , {title: "Reload page"}
                                );
                                /*
                                $("[role=\"alertdialog\"]").last().prop("id", "idCucConfirm");
                                $("#idCucConfirm").addClass("ui-dialog-no-close-x");
                                $("#idCucConfirm").find(".ui-dialog-content.ui-widget-content").dialog("option", "title", "Reload page");
                                 */
                            }
                        });
            }

            if (pData.match(REGEX_HTML)) {
                if (pApps.closeUnneededAlertDlgs() === 0) {
                    dermalog.dl_common.apps.confirm("Your session life time has expired!\nDo you want to reload the page?", function (pIsOk) {
                        if (pIsOk) {
                            let oApexUrl = dermalog.dl_common.apps.ApexUrlSplitParam(window.location.href);
                            oApexUrl.session_id = "";
                            if (oApexUrl.post_part.indexOf("&cs=") > -1) {
                                oApexUrl.page_id = "";
                                oApexUrl.request = "";
                                oApexUrl.clear_cache = "";
                                oApexUrl.item_names = "";
                                oApexUrl.item_values = "";
                                //oApexUrl.post_part = oApexUrl.post_part.replace(/(&cs=[^&#]*)/gim);
                                oApexUrl.post_part = "";
                            }
                            let url = dermalog.dl_common.apps.GetCheckedURL(dermalog.dl_common.apps.ApexUrlConcat(oApexUrl));
                            doCheckUrlAndConnect(url);
                            oResult.jqPromise = dfd.promise();
                            oResult.isHandled = true;
                        }
                    });
                }
            } else {
                throw new Error(pData);
            }
            return oResult;
        }

        if (pOptions.dataType === "json") {
            lIsJsonRequested = true;
            pOptions.dataType = "text";
        } else {
            pOptions.dataType = pOptions.dataType || "text";
        }

        if (lIsUseWaitPopup === true) {
            delete pOptions.loadingIndicatorPosition;
            pOptions.waitPopup.hideOn = pOptions.waitPopup.hideOn || "complete";
            if (!["callbacks", "complete", "none"].includes(pOptions.waitPopup.hideOn)) {
                pOptions.waitPopup.hideOn = "callbacks";
            }
        }

        if (pOptions.success !== null && typeof pOptions.success === "function") {
            lSuccessCallback = pOptions.success;
        }
        if (pOptions.error !== null && typeof pOptions.error === "function") {
            lErrorCallback = pOptions.error;
        }
        if (pOptions.complete !== null && typeof pOptions.complete === "function") {
            lCompleteCallback = pOptions.complete;
        }

        pOptions.success = function (pData, pTextStatus, pjqXHR) {
            if (dermalog.dl_common.utils.isEmpty(lTextStatus)) {
                lTextStatus = pTextStatus;
            }
            if (lIsUseWaitPopup === true && pOptions.waitPopup.hideOn === "callbacks") {
                if (pOptions.waitPopup.widget) {
                    pOptions.waitPopup.widget.remove();
                }
                pOptions.waitPopup.widget = null;
            }
            try {
                let oData;
                if (typeof pData === "string") {
                    /*
                    if (pData.match(REGEX_HTML_DOC)) {
                        throw new Error(pData);
                    }
                     */
                    if (pData.match(REGEX_SERVER_ERROR_CODES) || pData.match(REGEX_ERROR_MARKERS)) {
                        let matchHasStatusCode = pData.match(REGEX_JSON_HAS_STATUSCODE);
                        if (lIsJsonRequested && matchHasStatusCode && matchHasStatusCode.length > 0) {
                            try {
                                oData = JSON.parse(pData);
                            } catch (e) {
                                // Uncaught SyntaxError: Unexpected end of JSON input
                                throw new Error("JSON parsing fails for pData[\"" + pData + "\"]");
                            }
                            if (oData["StatusCode"] !== 0) {
                                if (oData["StatusMsg"]) {
                                    throw new Error("The Server-Process returns an error status: " + oData["StatusMsg"]);
                                } else {
                                    throw new Error("The Server-Process returns an error status: " + oData["StatusCode"]);
                                }
                            }
                        }
                        throw new Error("The Server-Process returns any error data: " + pData);
                    }
                    if (pData.toLowerCase().indexOf(("Process " + pName + " not found").toLowerCase()) > -1) {
                        throw new Error(pData);
                    }
                    if (isREGEX_SESSION_EXPIRED(pData)) {
                        onSessionExpired(pData);
                        return;
                    }
                }
                if (pName !== "SESSION_INFOS") {
                    dermalog.dl_common.sessionTimeoutObserver.DoRefreshData();
                }
                if (lIsJsonRequested) {
                    try {
                        oData = JSON.parse(pData);
                    } catch (e) {
                        // Uncaught SyntaxError: Unexpected end of JSON input
                        throw new Error("JSON parsing fails for data[" + pData + "]");

                    }
                }
                if (lSuccessCallback) {
                    if (lIsJsonRequested) {
                        lSuccessCallback(oData, lTextStatus, pjqXHR);
                    } else {
                        lSuccessCallback(pData, lTextStatus, pjqXHR);
                    }
                }
                if (lIsJsonRequested) {
                    dfdResult.resolve(oData);
                } else {
                    dfdResult.resolve(pData);
                }
            } catch (err) {
                lTextStatus = "error";
                pOptions.error(pjqXHR, lTextStatus, err);
            }
        };
        pOptions.error = function (pjqXHR, pTextStatus, pErrorThrown) {
            if (dermalog.dl_common.utils.isEmpty(lTextStatus)) {
                lTextStatus = pTextStatus;
            }
            if (lIsUseWaitPopup === true && pOptions.waitPopup.hideOn === "callbacks") {
                if (pOptions.waitPopup.widget) {
                    pOptions.waitPopup.widget.remove();
                }
                pOptions.waitPopup.widget = null;
            }

            if (pjqXHR.responseText && isREGEX_SESSION_EXPIRED(pjqXHR.responseText)) {
                onSessionExpired(pjqXHR.responseText);
                dfdResult.reject(pErrorThrown);
                return;
            }
            if (pjqXHR.responseJSON && pjqXHR.responseJSON.error && isREGEX_SESSION_EXPIRED(pjqXHR.responseJSON.error)) {
                onSessionExpired(pjqXHR.responseJSON.error);
                dfdResult.reject(pErrorThrown);
                return;
            }

            if (lErrorCallback) {
                lErrorCallback(pjqXHR, lTextStatus, pErrorThrown);
            } else {
                logServerProcessError(pName, pjqXHR, lTextStatus, pErrorThrown);
                pApps.ApexShowError(pErrorThrown);
            }
            dfdResult.reject(pErrorThrown);
        };
        pOptions.complete = function (pjqXHR, pTextStatus) {
            // A function to be called when the request finishes (after success and error callbacks are executed).
            if (dermalog.dl_common.utils.isEmpty(lTextStatus)) {
                lTextStatus = pTextStatus;
            }
            if (["success", "notmodified", "nocontent", "error", "timeout", "abort", "parsererror"].includes(lTextStatus)) {
            }
            if (lCompleteCallback) {
                lCompleteCallback(pjqXHR, lTextStatus);
            }
            if (lIsUseWaitPopup === true && pOptions.waitPopup.hideOn === "complete") {
                if (pOptions.waitPopup.widget) {
                    pOptions.waitPopup.widget.remove();
                }
                pOptions.waitPopup.widget = null;
            }
        };

        if (lIsUseWaitPopup === true) {
            if (!pOptions.waitPopup.widget) {
                pOptions.waitPopup.widget = apex.widget.waitPopup();
            }
        }

        jqPromise = apex.server.process(pName, pData, pOptions);
        jqPromise
            .fail(
                function (pResp) {
                    dfdResult.reject(pResp);
                }
            );

        return dfdResult.promise();
    };

    /**
     * @public
     * @function
     * @memberOf pApps
     */
    pApps.StoreValueInSessionBagAJAX = function (data, collection, success, error) {
        return apex.server.process("ASSIGN_BASE64_2COLL", {
            p_clob_01: data, x01: collection
        }, {
            success: function (data) {
                let obj = jQuery.parseJSON(data);
                if (obj.result == "success") {
                    success();
                } else {
                    error();
                }
            }, dataType: "text"
        });
    };

    /**
     * @public
     * @function
     * @memberOf pApps
     */
    pApps.StoreStringInSessionBagAJAX = function (data, collection, success, error) {
        return apex.server.process("ASSIGN_2COLL_4VARCHAR", {
            x02: data, x01: collection
        }, {
            success: function (data) {
                let obj = jQuery.parseJSON(data);
                if (obj.result === "success") {
                    success();
                } else {
                    error();
                }
            }, error: function (data) {
                if (apex.debug.getLevel() >= 4) {
                    console.log(data);
                }
            }, dataType: "text"
        });
    };

    /**
     * @public
     * @function
     * @memberOf pApps
     */
    pApps.StoreStringInSessionBagAjaxPromise = function (data, collection) {
        return new Promise((resolve, reject) => pApps.StoreStringInSessionBagAJAX(data, collection, () => resolve(), () => reject(new Error("An error has occurred"))));
    };

    /**
     * @public
     * @function
     * @memberOf pApps
     */
    pApps.StoreValueInSessionBagAjaxPromise = function (data, collection) {
        return new Promise((resolve, reject) => pApps.StoreValueInSessionBagAJAX(data, collection, () => resolve(), () => reject(new Error("An error has occurred"))));
    };

    /**
     * @public
     * @function
     * @memberOf pApps
     */
    pApps.makeOneZoomImage = function (pTarget, pId, pOptions) {
        /*
        if (Object.is(pTarget, oSelf)) {
            console.warn("pTarget is equal to oSelf!");
            return pTarget;
        }
         */
        if (Object.keys(pTarget).length > 0) {
            throw new Error("Param pTarget must be an empty object!");
        }
        let oSelf = pTarget;
        let oOptions = $.extend(true, {
            isLog2Console: false, useZIndex: null
        }, pOptions);
        const ID = pId;
        const HOVER_TIMEOUT = 2000;
        let jqOZI = null;
        let jqOZI_Img = null;
        let jqParentBody = null;
        let sState = "hidden";
        let elSrcImg = null;
        let iHoverTimeout = HOVER_TIMEOUT;
        let iHiddenTimer = null;
        let elLastSrcImg = null;
        let oLastMouseCoords = {
            x: null, y: null
        };
        let oImgRect = {
            left: null, top: null, right: null, bottom: null
        };
        let oFetch = {
            promise: null, abortController: null, state: "unknown"
        };

        function log2Console() {
            if (!oOptions.isLog2Console) {
                return;
            }
            let aArgs = Array.from(arguments);
            /*
            let sCallerName;
            sCallerName = arguments.callee.caller.name; // Not in strict mode!
            if (sCallerName === "") {                sCallerName = "Anonymous";}
            aArgs.splice(0, 0, sCallerName);
            */
            //console.log.apply(null, aArgs);
            console.log(...aArgs);
        }

        function getOffsetRect(pJqObj) {
            let oResult = pJqObj.offset();
            oResult.right = oResult.left + pJqObj.outerWidth();
            oResult.bottom = oResult.top + pJqObj.outerHeight();
            return oResult;
        }

        function isCoordsInRect(pCoords, pRect) {
            let bResult = false;
            if (pRect.left <= pCoords.x && pCoords.x <= pRect.right && pRect.top <= pCoords.y && pCoords.y <= pRect.bottom) {
                bResult = true;
            }
            return bResult;
        }

        oSelf.getID = function () {
            return ID;
        };

        oSelf.getOption = function (pOption) {
            return oOptions[pOption];
        };

        oSelf.setOption = function (pOption, pValue) {
            switch (typeof oOptions[pOption]) {
                case "boolean":
                    oOptions[pOption] = pValue === true;
                    break;
                case "undefined":
                case "string":
                case "number":
                default:
                    oOptions[pOption] = pValue;
                    break;
            }
        };

        oSelf.remove = function (pSrcImg) {
            log2Console("oSelf.remove");
            let jqSrcImg = $(pSrcImg);
            let oSrcImgRect = getOffsetRect(jqSrcImg);
            if (!isCoordsInRect(oLastMouseCoords, oSrcImgRect)) {
                log2Console("oSelf.remove", "Has left \"jqSrcImg\"!");
                pSrcImg.oneZoomImage.isInitializing = 0;
                if (oFetch.state === "pending") {
                    oFetch.abortController.abort();
                    log2Console("oSelf.remove", "Has left \"jqSrcImg\"!", "Fetch aborted!");
                }
                elLastSrcImg = null;
            }
            jqParentBody.off("keyup");
            if (!!pSrcImg.oneZoomImage.savedTitle) {
                pSrcImg.title = pSrcImg.oneZoomImage.savedTitle;
                pSrcImg.oneZoomImage.savedTitle = null;
            }
            /* Durations are given in milliseconds; higher values indicate slower animations, not faster ones.
             The strings 'fast' and 'slow' can be supplied to indicate durations of 200 and 600 milliseconds, respectively.
             If any other string is supplied, or if the duration parameter is omitted, the default duration of 400 milliseconds is used.
             */
            jqOZI.slideUp("fast", function () {
                log2Console("jqOZI.slideUp");
                sState = "hidden";
                if (iHiddenTimer) {
                    clearTimeout(iHiddenTimer);
                    iHiddenTimer = null;
                }
                iHiddenTimer = setTimeout(function () {
                    iHiddenTimer = null;
                    // After any visibility and set the timeout to immediately
                    // was now four times longer hidden as the default hover timeout,
                    // so set further hover timeouts back to default value
                    iHoverTimeout = HOVER_TIMEOUT;
                }, HOVER_TIMEOUT * 4);
            });
        };

        oSelf.setup = function (pSrcImg, pJqParent) {
            log2Console("oSelf.setup");
            if (jqOZI === null) {
                log2Console("Create \"jqOZI\"!");
                if (pJqParent && pJqParent.length && pJqParent.length > 0) {
                    if (pJqParent.is("body") === true) {
                        jqParentBody = pJqParent;
                    } else {
                        jqParentBody = pJqParent.parentsUntil("body");
                        if (jqParentBody.length === 0) {
                            throw new Error("Could not find \"Parent-body\"!");
                        }
                        jqParentBody = $(jqParentBody[jqParentBody.length - 1]).parent();
                        if (jqParentBody.is("body") !== true) {
                            jqParentBody = jqParentBody.find("body");
                            if (jqParentBody.is("body") !== true) {
                                throw new Error("Could not find \"Parent-body\"!");
                            }
                        }
                    }
                } else {
                    jqParentBody = $("body");
                }
                jqParentBody.append("<p id='oneZoomImage' class='zoomImage'><img src='' alt='Zoom in image' title=''/><br/><span/></p>");
                jqOZI = $("#oneZoomImage");
                jqOZI_Img = jqOZI.find("img");
                jqOZI.mousemove(function (pEvent) {
                    oLastMouseCoords.x = pEvent.pageX;
                    oLastMouseCoords.y = pEvent.pageY;
                }).mouseleave(function (pEvent) {
                    oLastMouseCoords.x = pEvent.pageX;
                    oLastMouseCoords.y = pEvent.pageY;
                    if (!isCoordsInRect(oLastMouseCoords, oImgRect)) {
                        oSelf.remove(elSrcImg);
                    }
                }).click(function (pEvent) {
                    oLastMouseCoords.x = pEvent.pageX;
                    oLastMouseCoords.y = pEvent.pageY;
                    oSelf.remove(elSrcImg);
                });
                jqOZI_Img.on("load", function () {
                    log2Console("jqOZI_Img.on load");
                    URL.revokeObjectURL(this.src);
                    let jqCurrSrcImg = $(elSrcImg);
                    let oSrcImgRect = getOffsetRect(jqCurrSrcImg);
                    if (!isCoordsInRect(oLastMouseCoords, oSrcImgRect)) {
                        log2Console("Has left \"jqSrcImg\" in meantime to load \"jqOZI\"!");
                        elSrcImg.oneZoomImage.isInitializing = 0;
                        if (oFetch.state === "pending") {
                            oFetch.abortController.abort();
                            log2Console("Has left \"jqSrcImg\" in meantime to load \"jqOZI\"!", "Fetch aborted!");
                        }
                        return;
                    }
                    const MARGIN = {
                        left: 0
                        , top: 0
                        , right: 0
                        , bottom: 0
                    };
                    let jqParent = (pJqParent ? pJqParent : jqOZI.parent());
                    if (!(jqParent.length === 1)) {
                        throw new Error("Could not find \"Parent\"!");
                    }
                    /*
                    Zoom: 80%
                        window.devicePixelRatio
                            1.2000000476837158
                        (window.outerWidth - 8) / window.innerWidth
                            1.2316602316602316
                        (window.outerWidth - 16) / window.innerWidth
                            1.2277992277992278

                        window.visualViewport
                            height: 1621.6666259765625
                            offsetLeft: 0
                            offsetTop: 0
                            onresize: null
                            onscroll: null
                            pageLeft: 0
                            pageTop: 0
                            scale: 1
                            width: 2051.66650390625

                        window.outerHeight
                            1400
                        window.innerHeight
                            1622

                        window.screen
                            availHeight: 1400
                            availLeft: 0
                            availTop: 0
                            availWidth: 2560
                            colorDepth: 24
                            height: 1440
                            orientation: ScreenOrientation
                                angle: 0
                                onchange: null
                                type: "landscape-primary"
                            pixelDepth: 24
                            width: 2560

                    Zoom: 100%
                        window.devicePixelRatio
                            1.5
                        (window.outerWidth - 8) / window.innerWidth
                            1.5392038600723763
                        (window.outerWidth - 16) / window.innerWidth
                            1.53437876960193

                        window.visualViewport
                            height: 1297.3333740234375
                            offsetLeft: 0
                            offsetTop: 0
                            onresize: null
                            onscroll: null
                            pageLeft: 0
                            pageTop: 0
                            scale: 1
                            width: 1641.3333740234375

                        window.outerHeight
                            1400
                        window.innerHeight
                            1297

                        window.screen
                            availHeight: 1400
                            availLeft: 0
                            availTop: 0
                            availWidth: 2560
                            colorDepth: 24
                            height: 1440
                            orientation: ScreenOrientation
                                angle: 0
                                onchange: null
                                type: "landscape-primary"
                            pixelDepth: 24
                            width: 2560
                     */
                    let oParentOffset = jqParent.offset();
                    let oParentDims = {left: oParentOffset.left, top: oParentOffset.top};
                    //oParentDims = {left: 0, top: 0};
                    let nTmp = jqParent.outerWidth();
                    if (window.innerWidth < nTmp) {
                        oParentDims.left += window.scrollX;
                        oParentDims.width = window.innerWidth - oParentOffset.left;
                    } else {
                        oParentDims.width = nTmp;
                    }
                    nTmp = jqParent.outerHeight();
                    if (window.innerHeight < nTmp) {
                        oParentDims.top += window.scrollY;
                        oParentDims.height = window.innerHeight - oParentOffset.top;
                    } else {
                        oParentDims.height = nTmp;
                    }
                    oParentDims.right = oParentDims.left + oParentDims.width;
                    oParentDims.bottom = oParentDims.top + oParentDims.height;
                    log2Console("oParentDims", oParentDims);
                    let nOziOuterWidth = jqOZI.outerWidth();
                    let nOziOuterHeight = jqOZI.outerHeight();
                    if (nOziOuterWidth >= oParentDims.width) {
                        log2Console("nOziOuterWidth B", nOziOuterWidth);
                        let nOziImgOuterWidth = jqOZI_Img.outerWidth();
                        let nImgWidthDiff = nOziOuterWidth - nOziImgOuterWidth;
                        jqOZI_Img.css("max-width", oParentDims.width - nImgWidthDiff - (MARGIN.left + MARGIN.right)); // "200px"
                        nOziOuterWidth = jqOZI.outerWidth();
                        log2Console("nOziOuterWidth A", nOziOuterWidth);
                    }
                    if (nOziOuterHeight >= oParentDims.height) {
                        log2Console("nOziOuterWidth B", nOziOuterHeight);
                        let nOziImgOuterHeight = jqOZI_Img.outerHeight();
                        let nImgHeightDiff = nOziOuterHeight - nOziImgOuterHeight;
                        jqOZI_Img.css("max-height", oParentDims.height - nImgHeightDiff - (MARGIN.top + MARGIN.bottom)); // "200px"
                        nOziOuterHeight = jqOZI.outerHeight();
                        log2Console("nOziOuterWidth A", nOziOuterHeight);
                    }
                    let oOziRect = {
                        left: (oSrcImgRect.left + (oSrcImgRect.right - oSrcImgRect.left) / 2) - nOziOuterWidth / 2
                        , top: (oSrcImgRect.top + (oSrcImgRect.bottom - oSrcImgRect.top) / 2) - nOziOuterHeight / 2
                    };
                    oOziRect.right = oOziRect.left + nOziOuterWidth;
                    oOziRect.bottom = oOziRect.top + nOziOuterHeight;
                    log2Console("oOziRect", oOziRect);
                    if (oOziRect.left < oParentDims.left + MARGIN.left) {
                        log2Console("oOziRect: LEFT B", oOziRect.left, oOziRect.right);
                        oOziRect.left = oParentDims.left + MARGIN.left;
                        oOziRect.right = oOziRect.left + nOziOuterWidth;
                        log2Console("oOziRect: LEFT A", oOziRect.left, oOziRect.right);
                    } else if (oOziRect.right > oParentDims.left + oParentDims.width - MARGIN.right) {
                        log2Console("oOziRect: RIGHT B", oOziRect.left, oOziRect.right);
                        oOziRect.right = oParentDims.left + oParentDims.width - MARGIN.right;
                        oOziRect.left = oOziRect.right - nOziOuterWidth;
                        log2Console("oOziRect: RIGHT A", oOziRect.left, oOziRect.right);
                    }
                    if (oOziRect.top < oParentDims.top + MARGIN.top) {
                        log2Console("oOziRect: TOP B", oOziRect.top, oOziRect.bottom);
                        oOziRect.top = oParentDims.top + MARGIN.top;
                        oOziRect.bottom = oOziRect.top + nOziOuterHeight;
                        log2Console("oOziRect: TOP A", oOziRect.top, oOziRect.bottom);
                    } else if (oOziRect.bottom > oParentDims.top + oParentDims.height - MARGIN.bottom) {
                        log2Console("oOziRect: BOTTOM B", oOziRect.top, oOziRect.bottom);
                        oOziRect.bottom = oParentDims.top + oParentDims.height - MARGIN.bottom;
                        oOziRect.top = oOziRect.bottom - nOziOuterHeight;
                        log2Console("oOziRect: BOTTOM A", oOziRect.top, oOziRect.bottom);
                    }
                    let oOZIOffset = {
                        left: oOziRect.left
                        , top: oOziRect.top
                    };
                    log2Console("oOZIOffset", oOZIOffset);
                    jqOZI.css(oOZIOffset);
                    jqOZI.slideDown("slow", function () {
                        log2Console("jqOZI.slideDown");
                        sState = "visible";
                        if (iHiddenTimer) {
                            clearTimeout(iHiddenTimer);
                            iHiddenTimer = null;
                        }
                        // Set further hover timeouts to immediately
                        iHoverTimeout = 1;
                        //$("body")
                        jqParentBody.on("keyup", function (pEvent) {
                            if (pEvent.which === 27) {
                                oSelf.remove(elSrcImg);
                            }
                        });
                        elSrcImg.oneZoomImage.isInitializing = 0;
                        oImgRect = getOffsetRect(jqOZI);

                        let jqCurrSrcImg = $(elSrcImg);
                        let oSrcImgRect = getOffsetRect(jqCurrSrcImg);
                        if (!isCoordsInRect(oLastMouseCoords, oSrcImgRect)) {
                            log2Console("Has left \"jqSrcImg\" in meantime to slideDown \"jqOZI\"!");
                            elSrcImg.oneZoomImage.isInitializing = 0;
                            if (oFetch.state === "pending") {
                                oFetch.abortController.abort();
                                log2Console("Has left \"jqSrcImg\" in meantime to slideDown \"jqOZI\"!", "Fetch aborted!");
                            }
                            setTimeout(function () {
                                oSelf.remove(elSrcImg);
                            }, 1);
                        }
                    });
                });
            } // if (jqOZI === null)
            if (pSrcImg.oneZoomImage !== undefined) {
                log2Console("return", "pSrcImg.oneZoomImage !== undefined");
                return;
            }
            pSrcImg.oneZoomImage = {};
            let jqSrcImg = $(pSrcImg);

            function onHoverIn4SrcImg(pEvent, pHoverTimeout = iHoverTimeout) {
                log2Console("jqSrcImg.hover in");
                if (pSrcImg.oneZoomImage.timer) {
                    clearTimeout(pSrcImg.oneZoomImage.timer);
                    pSrcImg.oneZoomImage.timer = null;
                }
                oLastMouseCoords.x = pEvent.pageX;
                oLastMouseCoords.y = pEvent.pageY;
                if (elLastSrcImg === pSrcImg) {
                    log2Console("return", "elLastSrcImg === pSrcImg");
                    return;
                }
                elLastSrcImg = pSrcImg;
                //log2Console("jqSrcImg.hover in", "elLastSrcImg = pSrcImg");
                //log2Console(oLastMouseCoords, getOffsetRect(jqSrcImg), isCoordsInRect(oLastMouseCoords, getOffsetRect(jqSrcImg)));

                function doWorkByTot(pEvent) {
                    log2Console("doWorkByTot");
                    pSrcImg.oneZoomImage.timer = null;
                    let oSrcImgRect = getOffsetRect(jqSrcImg);
                    if (!isCoordsInRect(oLastMouseCoords, oSrcImgRect)) {
                        log2Console("Has left \"jqSrcImg\" in meantime of the timer to call \"doWorkByTot\"!", "elLastSrcImg === jqSrcImg[0]", elLastSrcImg === jqSrcImg[0]);
                        log2Console(oLastMouseCoords, oSrcImgRect);
                        pSrcImg.oneZoomImage.isInitializing = 0;
                        if (oFetch.state === "pending") {
                            oFetch.abortController.abort();
                            log2Console("Has left \"jqSrcImg\" in meantime of the timer to call \"doWorkByTot\"!", "Fetch aborted!");
                        }
                        log2Console("return", "!isCoordsInRect(oLastMouseCoords, oSrcImgRect)");
                        return;
                    }
                    let sSrcImgURL = (pSrcImg.src ? pSrcImg.src : (typeof pSrcImg.href.baseVal === "string" ? pSrcImg.href.baseVal : pSrcImg.href));
                    if (!sSrcImgURL) {
                        log2Console("return", "!sSrcImgURL");
                        return;
                    }
                    if (jqOZI.css("display") !== "none") {
                        // Perhaps ".slideUp(...)" has not finished, yet!
                        if (pSrcImg.oneZoomImage.isInitializing !== 1) {
                            // I am not in initializing, so reset a timeout for this procedure!
                            log2Console("Retry Timeout for \"doWorkByTot(...)\" of \"jqSrcImg.hover in\"!", 200 + 200);
                            pSrcImg.oneZoomImage.timer = setTimeout(doWorkByTot, /* "fast" */ 200 + 200, pEvent);
                        }
                        log2Console("return", "jqOZI.css(\"display\") !== \"none\"");
                        return;
                    }
                    pSrcImg.oneZoomImage.isInitializing = 1;
                    let sTitle = null;
                    if (!!pSrcImg.title) {
                        pSrcImg.oneZoomImage.savedTitle = pSrcImg.title;
                        pSrcImg.title = "";
                        sTitle = pSrcImg.oneZoomImage.savedTitle;
                    }
                    jqOZI.find("span").text(sTitle);
                    if (oOptions.useZIndex) {
                        jqOZI[0].style.zIndex = oOptions.useZIndex;
                    }
                    /*
                    const myHeaders = new Headers();

                    const myRequest = new Request('flowers.jpg', {
                      method: 'GET',
                      headers: myHeaders,
                      mode: 'cors',
                      cache: 'default',
                    });

                    fetch(myRequest)
                      .then(response => response.blob())
                      .then(myBlob => {
                        myImage.src = URL.createObjectURL(myBlob);
                      });
                     */
                    /*
                    if (window.fetch) {
                      // run my fetch request here
                    } else {
                      // do something with XMLHttpRequest?
                    }

                    Polyfill: https://github.com/github/fetch
                     */
                    oFetch.abortController = new AbortController();
                    const abortSignal = oFetch.abortController.signal;
                    //typeof pSrcImg.href === "string"
                    //typeof pSrcImg.href === "object"
                    //  pSrcImg.href instanceof SVGAnimatedString
                    oFetch.promise = fetch(sSrcImgURL
                        , {
                            // Default options are marked with *
                            method: "GET" // *GET, POST, PUT, DELETE, etc.
                            //, headers: {"Content-Type": "application/json"}
                            //, body: JSON.stringify(data) // body data type must match "Content-Type" header
                            , mode: "cors" // no-cors, *cors, same-origin
                            //, credentials: "same-origin" // include, *same-origin, omit
                            //, cache: "no-cache" // *default, no-cache, reload, force-cache, only-if-cached
                            //, redirect: "follow" // manual, *follow, error
                            //, referrer: ""
                            //, referrerPolicy: "no-referrer" // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
                            //, integrity: null
                            //, keepalive: null
                            , signal: abortSignal
                        }
                    );
                    oFetch.state = "pending";
                    oFetch.promise.then(function (pResponse) {
                        oFetch.state = "fulfilled";
                        if (!pResponse.ok) {
                            //pResponse.status;
                            //pResponse.statusText;
                            throw new Error("Network response was not OK!");
                        }
                        /*
                        const contentType = pResponse.headers.get('content-type');
                        if (!contentType || !contentType.includes('application/json')) {
                            throw new TypeError("Oops, we haven't got JSON!");
                        }
                         */
                        /*
                        Request.arrayBuffer() / Response.arrayBuffer()
                        Request.blob() / Response.blob()
                        Request.formData() / Response.formData()
                        Request.json() / Response.json()
                        Request.text() / Response.text()
                         */
                        let oSrcImgRect = getOffsetRect(jqSrcImg);
                        if (!isCoordsInRect(oLastMouseCoords, oSrcImgRect)) {
                            throw new Error("SrcImgLeftError");
                        }
                        return pResponse.blob();
                    }).then(function (pBlob) {
                        let oSrcImgRect = getOffsetRect(jqSrcImg);
                        if (!isCoordsInRect(oLastMouseCoords, oSrcImgRect)) {
                            throw new Error("SrcImgLeftError");
                        }
                        jqOZI_Img.prop("src", URL.createObjectURL(pBlob));
                        elSrcImg = pSrcImg;
                    }).catch(function (pError) {
                        oFetch.state = "rejected";
                        if (pError.name === "AbortError") {
                            //pError instanceof DOMException  === true
                            //pError.code === 20
                            //pError.name === "AbortError"
                            //pError.message === "The user aborted a request."
                            //pError.valueOf() === DOMException: The user aborted a request.
                            //pError.toString() === "AbortError: The user aborted a request."
                        } else if (pError.message === "SrcImgLeftError") {
                            pSrcImg.oneZoomImage.isInitializing = 0;
                        } else {
                            console.error("Fetch \"pSrcImg.src\" raises:", pError);
                        }
                    });
                }

                log2Console("Set Timeout for \"doWorkByTot(...)\" of \"jqSrcImg.hover in\"!", pHoverTimeout);
                pSrcImg.oneZoomImage.timer = setTimeout(doWorkByTot, pHoverTimeout, pEvent);
            }

            function onHoverOut4SrcImg(pEvent) {
                log2Console("jqSrcImg.hover out");
                if (pSrcImg.oneZoomImage.timer) {
                    clearTimeout(pSrcImg.oneZoomImage.timer);
                    pSrcImg.oneZoomImage.timer = null;
                }
                oLastMouseCoords.x = pEvent.pageX;
                oLastMouseCoords.y = pEvent.pageY;
                let oSrcImgRect = getOffsetRect(jqSrcImg);
                if (!isCoordsInRect(oLastMouseCoords, oSrcImgRect)) {
                    log2Console("jqSrcImg.hover out", "Has left \"jqSrcImg\"!");
                    pSrcImg.oneZoomImage.isInitializing = 0;
                    if (oFetch.state === "pending") {
                        oFetch.abortController.abort();
                        log2Console("jqSrcImg.hover out", "Has left \"jqSrcImg\"!", "Fetch aborted!");
                    }
                    elLastSrcImg = null;
                }
            }

            function onMousemove4SrcImg(pEvent) {
                oLastMouseCoords.x = pEvent.pageX;
                oLastMouseCoords.y = pEvent.pageY;
                log2Console("jqSrcImg.mousemove", oLastMouseCoords);
            }

            function onClick4SrcImg(pEvent) {
                oLastMouseCoords.x = pEvent.pageX;
                oLastMouseCoords.y = pEvent.pageY;
                elLastSrcImg = null;
                onHoverIn4SrcImg(pEvent, 1);
            }

            jqSrcImg
                .hover(onHoverIn4SrcImg, onHoverOut4SrcImg)
                .mousemove(onMousemove4SrcImg)
                .click(onClick4SrcImg);
        };
    };

    /**
     * @public
     * @function
     * @memberOf pApps
     */
    pApps.createOneZoomImage = function (pId, pOptions) {
        if (!(this instanceof pApps.createOneZoomImage)) {
            return new pApps.createOneZoomImage(pId, pOptions);
        }
        pApps.makeOneZoomImage(this, pId, pOptions);
        return this;
    };

    /**
     * @public
     * @function
     * @memberOf pApps
     */
    pApps.cancelPage = function (pIsForce = true) {
        for (let i = 0; i < window.top.frames.length; i++) {
            let currFrame = window.top.frames[i];
            if (currFrame.apex) {
                if (currFrame.apex.page && (currFrame.apex.page.isChanged() === true || pIsForce === true)) {
                    currFrame.apex.page.cancelWarnOnUnsavedChanges();
                }
                if (currFrame.apex.navigation && currFrame.apex.navigation.dialog) {
                    currFrame.apex.navigation.dialog.cancel(true);
                }
            }
        }
        if (apex.page.isChanged() === true || pIsForce === true) {
            apex.page.cancelWarnOnUnsavedChanges();
        }
    };

    /**
     * @public
     * @function
     * @memberOf pApps
     */
    pApps.closeUnneededAlertDlgs = function () {
        let jqoRoleAlertDlgs = $("[role=\"alertdialog\"]");
        let iResult = jqoRoleAlertDlgs.length;
        if (iResult > 0) {
            jqoRoleAlertDlgs.each(function (pIdx4Dlg, pElem4DlgParent) {
                let jqoDlgParent = $(pElem4DlgParent);
                let jqoDlg = jqoDlgParent.find(".ui-dialog-content.ui-widget-content");
                //if (jqoDlg.length > 0) {}
                if (jqoDlg.dialog("isOpen") === true) {
                    let jqoApexSessAlertDlg = jqoDlgParent.find("#apex_session_alert_dlg");
                    let sTitle = jqoDlg.dialog("option", "title");
                    let sMessage = jqoDlg.find(".a-AlertMessage-details").text();
                    if (!sMessage) {
                        sMessage = jqoApexSessAlertDlg.text();
                    }
                    //console.log("sTitle :", sTitle);
                    //console.log("sMessage :", sMessage);
                    //console.log("isApexSessAlertDlg :", jqoApexSessAlertDlg.length);
                    if (!!sTitle && sTitle.match(/(reload page)/gi) || sMessage.match(/(reload page)/gi) || jqoApexSessAlertDlg.length > 0) {
                    } else {
                        jqoDlg.dialog("close");
                        /*
                        jqoDlgParent.find(".ui-dialog-buttonset")
                            .each(function( pIdx4BtnSet, pBtnSetElem ) {
                                let jqoBtnSet = $(pBtnSetElem);
                                let jqoBtns = jqoBtnSet.find(":button");
                                if (jqoBtns.length === 1) {
                                    jqoBtns.click();
                                } else if (jqoBtns.length > 1) {
                                    let jqoNotConfirmBtns = jqoBtns.filter(":not(.js-confirmBtn)");
                                    console.log( jqoNotConfirmBtns.length );
                                }
                            });
                        */
                    }
                }
            });
            jqoRoleAlertDlgs = $("[role=\"alertdialog\"]");
            iResult = jqoRoleAlertDlgs.length;
            if (iResult > 0) {
                jqoRoleAlertDlgs.each(function (pIdx4Dlg, pElem4DlgParent) {
                    let jqoDlgParent = $(pElem4DlgParent);
                    let jqoDlg = jqoDlgParent.find(".ui-dialog-content.ui-widget-content");
                    if (jqoDlg.dialog("isOpen") === true) {
                        let jqoApexSessAlertDlg = jqoDlgParent.find("#apex_session_alert_dlg");
                        if (jqoApexSessAlertDlg.length > 0) {
                        } else {
                            jqoDlg.dialog("close");
                        }
                    }
                });
                jqoRoleAlertDlgs = $("[role=\"alertdialog\"]");
                iResult = jqoRoleAlertDlgs.length;
            }
        }
        return iResult;
    };

    /**
     * @public
     * @function
     * @memberOf pApps
     */
    pApps.getApexUrlType = function (pHref = window.location.href) {
        let iResult = 0;
        let mgTmp = null;
        if (!!pHref) {
            mgTmp = pHref.match(/\/f\?p=([^&]+)/im);
            if (mgTmp && mgTmp.length > 1 && mgTmp[1].match(/[^:]+:/im)) {
                // Colon delimited url
                iResult = 1;
            }
            if (iResult === 0) {
                mgTmp = pHref.match(/(\?|.+&)session=[0-9]+/im);
                if (mgTmp) {
                    // User friendly url
                    iResult = 2;
                }
            }
            if (iResult === 0) {
                mgTmp = pHref.match(/\/i\//im);
                if (mgTmp) {
                    // Images url
                    iResult = 8;
                }
            }
            if (iResult === 0) {
                mgTmp = pHref.match(/\/(wwv_flow\.|wwv_flow_item_help\.| wwv_flow_customize\.|apex_authentication\.|ComputerIdentifier)/im);
                if (mgTmp) {
                    // Any other url
                    iResult = 9;
                }
            }
        }
        return iResult;
    };

    /**
     * @public
     * @memberOf pApps
     */
    pApps.apexUrlType = pApps.getApexUrlType();

    /**
     * @public
     * @function
     * @memberOf pApps
     */
    /* Example of pMessages:
    messages = {
        defaultLocale: "en_US"
        , en_US: {
            rgnElectionsTitleMarker: "Description : "
            , rgnUsersOfElectionTitleMarker: "Description : "
            , valueNotInRange: "Value is not between 0 and 999999999999999!"
            , ...
        }
        , en: {
            , ...
        }
        , de_DE: {
            , ...
        }
    };
     */
    pApps.getLocalizedMessage = function (pMessages, pMessageKey) {
        let sResult = "";
        if (pApps._internalData.currLocale === null) {
            /* NOTE:
            function getLang() {
              if (navigator.languages != undefined) {   return navigator.languages[0];}
              return navigator.language;
            }
             */
            let languageParts = apex.locale.getLanguage().split("-");
            if (languageParts[1]) {
                pApps._internalData.currLocale = languageParts[0].toLowerCase() + "_" + languageParts[1].toUpperCase();
            } else {
                pApps._internalData.currLocale = languageParts[0].toLowerCase();
            }
        }
        if (pMessages && pMessageKey && pMessageKey.length > 0) {
            let sCurrLocale = pApps._internalData.currLocale;
            if (!pMessages[sCurrLocale]) {
                if (sCurrLocale.length === 2) {
                    const REGEX = new RegExp("^" + sCurrLocale, "");
                    let sFirstFoundLocale = Object.keys(pMessages)
                        .filter((pKey) => (pKey !== pMessages.defaultLocale && pKey !== "defaultLocale" && pKey.match(REGEX)))[0];
                    if (sFirstFoundLocale) {
                        sCurrLocale = sFirstFoundLocale;
                    } else {
                        sCurrLocale = pMessages.defaultLocale;
                    }
                } else {
                    sCurrLocale = pMessages.defaultLocale;
                }
            }
            if (typeof pMessages[sCurrLocale][pMessageKey] === "string") {
                sResult = pMessages[sCurrLocale][pMessageKey];
            } else if (sCurrLocale !== pMessages.defaultLocale && pMessages[pMessages.defaultLocale] && typeof pMessages[pMessages.defaultLocale][pMessageKey] === "string") {
                sResult = pMessages[pMessages.defaultLocale][pMessageKey];
            } else {
                throw new Error("No localized message for pMessageKey[\"" + pMessageKey + "\"] in pMessages found!");
            }
        }
        return sResult;
    };

    /**
     * @public
     * @function
     * @memberOf pApps
     */
    pApps.setLocalizedMessages = function (pMessages, pOptions = {serverProcess: "GET_JS_MESSAGES"}) {
        return dermalog.dl_common.apps.ApexServerProcess(pOptions.serverProcess, null, {
            dataType: "json", success: function (pData, pTextStatus, pjqXHR) {
                if (pData["StatusCode"] !== 0) {
                    throw new Error(pData["StatusMsg"]);
                }
                Object.entries(pData["Data"])
                    .forEach((pDataEntry) => {
                        if (typeof pDataEntry[1] === "string") {
                            pMessages[pDataEntry[0]] = pDataEntry[1];
                        } else if (typeof pDataEntry[1] === "object" && pDataEntry[1] !== null) {
                            if (!pMessages[pDataEntry[0]]) {
                                pMessages[pDataEntry[0]] = {};
                            }
                            Object.entries(pDataEntry[1])
                                .forEach((pDatObjectEntry) => {
                                    pMessages[pDataEntry[0]][pDatObjectEntry[0]] = pDatObjectEntry[1];
                                });
                        }
                    });
            }, error: function (pjqXHR, pTextStatus, pErrorThrown) {
                throw pErrorThrown;
            }
        });
    };

    /**
     * @public
     * @function
     * @memberOf pApps
     */
    /*
    function check(code)
    {
        if (Number.isNaN(code)) {return '';}
        var len = code.length;
        var parity = len % 2;
        var sum = 0;
        for (var i = len-1; i >= 0; i--)
        {
            var d = parseInt(code.charAt(i));
            if (i % 2 == parity) { d *= 2 }
            if (d > 9) { d -= 9 }
            sum += d;
        }
        return String((sum % 10));
    }
     */
    pApps.getLuhnCheckDigit = function (pValue) {
        let iResult;
        let iHolder = 0;
        let nTmp = 0;
        let sTmp;
        if (pValue === null) {
            return null;
        } else if (pValue < 0 || pValue > 999999999999999) {
            throw new Error("Value is not between 0 and 999999999999999!");
        }
        sTmp = String(pValue * 10);
        for (let x = 1; x <= sTmp.length; x++) {
            nTmp = Number(sTmp.substr(-x, 1));
            if (x % 2 === 0) {
                nTmp = nTmp * 2;
                if (nTmp > 9) {
                    nTmp = nTmp - 9;
                }
            }
            iHolder = iHolder + nTmp;
        }
        iResult = (10 - (iHolder % 10)) % 10;
        return iResult;
    };

    /*
    pPAGE.validatePageItem = function (pThis, pItemName) {
        //console.log($v("pFlowId"), $v("pFlowStepId"), "validatePageItem", arguments);
        let sResult = "";
        switch (pItemName) {
            case "P1000_SMART_CARD_ID":
                let currValue = apex.item(pItemName).getValue();
                if (currValue === "") {
                    sResult = pPAGE.getLocalizedMessage("valueIsRequired"); }
                else if (currValue.length !== 8) {
                    sResult = pPAGE.getLocalizedMessage("valueMustBeEightDigitsLong"); }
                else if (currValue.match(/[^0-9]/gim)) {
                    sResult = pPAGE.getLocalizedMessage("valueMustOnlyContainDigits"); }
                else if (pPAGE.LUHN(currValue.substr(0, 7)) !== Number(currValue.substr(7))) {
                    sResult = pPAGE.getLocalizedMessage("valueHasNotValidCheckDigit"); }
                break;
            default:
                break;
        }
        let jqo = $("#" + pItemName + "_error_placeholder");
        if (jqo.length > 0) {
            jqo.html("<span className=\"t-Form-error\"><div id=\"" + pItemName + "_error\">" + sResult + "</div></span>");
            if (sResult.length > 0) {
                //$("#" + pItemName).addClass("apex-page-item-error");
                $("#" + pItemName).css("border-color", "red");
                jqo.removeClass("u-hidden").addClass("u-visible");
            } else {
                //$("#" + pItemName).removeClass("apex-page-item-error");
                $("#" + pItemName).css("border-color", "");
                jqo.removeClass("u-visible").addClass("u-hidden");
            }
        }
        return sResult;
    };

    pPAGE.onChangePageItem = function (pThis, pItemName) {
        //console.log($v("pFlowId"), $v("pFlowStepId"), "onChangePageItem", arguments);
        switch (pItemName) {
            case "P1000_SMART_CARD_ID":
                pPAGE.validatePageItem(pThis, pItemName);
                break;
            default:
                break;
        }
    };

    pPAGE.onPageUnload = function (pThis) {
        //console.log($v("pFlowId"), $v("pFlowStepId"), "onPageUnload", arguments);
        // !!! Do not use ".desFireUUID.releaseResources()", because it works asynchronous !!!
        let plugins = dermalog.dl_elections.wssPlugins.desFireUUID._plugins;
        for (let i = plugins.length - 1; i >= 0; i--) {
            if (plugins[i].plugin) {
                plugins[i].plugin.disconnect();
            }
        }
    };


     */

    $(document).ready(function () {
    });

})(dermalog.dl_common.apps);
