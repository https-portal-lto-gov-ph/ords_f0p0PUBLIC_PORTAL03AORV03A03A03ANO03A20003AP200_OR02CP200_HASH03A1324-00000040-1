"use strict";dermalog.dl_a_public_portal.websocketServer={P0_wss_json_base_64:apex.item("P0_WSS_JSON").getValue(),iconWalkIn:"fa-home",iconOnline:"fa-signal",iconWait:"fa-refresh fa-anim-spin",iconNotFound:"fa-ban",showWSSIconAlways:"",showTypeText:"",showIssueText:"",showOfficeNameText:"",callback:null,get wssObj(){return""==this.P0_wss_json_base_64?{}:JSON.parse(atob(this.P0_wss_json_base_64))},showMsg:function(t){let e=this.wssObj;console.info(e.msg),$("footer.t-Footer .walk-in-terminal").html(e.wss_link)},serverProcess:function(t,e){apex.server.process("save_websocket_server_state",{x01:t,x02:e,x03:this.showWSSIconAlways},{success:t=>{this.P0_wss_json_base_64=t.trim(),this.showMsg(),void 0!==this.callback&&null!=this.callback&&this.callback(this)},error(t){console.error(t)},dataType:"text"})},register:function(t,e,s,a,i,o){var l;this.callback=o,this.showWSSIconAlways=!0===e,this.showTypeText=!1!==s,this.showIssueText=!1!==a,this.showOfficeNameText=!1!==i,0==Object.keys(this.wssObj).length&&this.showWSSIconAlways&&$("footer.t-Footer .walk-in-terminal").html('<a class="initial"><span aria-hidden="true" class="fa fa-refresh fa-anim-spin"></span>WSS</a>'),0==Object.keys(this.wssObj).length||t?($(".walk-in-terminal span").removeClass(`${this.iconWalkIn} ${this.iconOnline} ${this.iconNotFound}`),$(".walk-in-terminal span").addClass(this.iconWait),$.getJSON("https://localhost:2013/System").done(t=>{l=t.UpdateDescription.Version,console.info(`Dermalog Websocket Server Version ${l} installed.`),$.getJSON("https://localhost:2013/ComputerIdentifier").done(t=>{this.serverProcess(t.ComputerID,l)}).fail(()=>{this.serverProcess("NO_CI_ENDPOINT",l),console.error("Computer Identifier not found. Please install newest Websocket Server version.")})}).fail(()=>{this.serverProcess("NOT_INSTALLED")})):void 0!==this.callback&&null!=this.callback&&this.callback(this)},showConfirm:function(t){let e=this.wssObj,s,a;"Y"==e.code?(s="<table>",this.showTypeText&&(s+=`<tr>
                        <td><b>Type:</b></td><td>${e.computer_type}</td>
                      </tr>`),this.showOfficeNameText&&(s+=`<tr>
                        <td><b>Office:</b></td><td>${e.office_code} - ${e.office_name}</td>
                      </tr>`),s+=`<tr>
                       <td><b>Status:</b></td><td>${e.wss_state}</td>
                     </tr>
                     <tr>
                       <td><b>Version:</b></td><td>${e.wss_version}</td>
                     </tr>
                   </table>`,a=this.iconWalkIn):"NOT_INSTALLED"==e.code&&this.showWSSIconAlways?(s=`<table>
                <tr>
                  <td><b>Issue:</b></td><td>${e.msg}</td>
                </tr>
              </table>`,a=this.iconNotFound):(s="<table>",""!=e.computer_type&&this.showTypeText&&(s+=`<tr>
                        <td><b>Type:</b></td><td>${e.computer_type}</td>
                      </tr>`),this.showIssueText&&(s+=`<tr>
                        <td><b>Issue:</b></td><td>${e.msg}</td>
                      </tr>`),s+=`<tr>
                       <td><b>Status:</b></td><td>${e.wss_state}</td>
                     </tr>
                     <tr>
                       <td><b>Version:</b></td><td>${e.wss_version}</td>
                     </tr>
                   </table>`,a=this.iconOnline),apex.lang.getMessage("APEX.DIALOG.OK"),apex.lang.getMessage("APEX.DIALOG.CANCEL"),apex.lang.addMessages({"APEX.DIALOG.OK":"Refresh"}),apex.lang.addMessages({"APEX.DIALOG.CANCEL":"Close"}),apex.message.confirm(s,t=>{t&&dermalog.dl_a_public_portal.websocketServer.register(!0,this.showWSSIconAlways,this.showTypeText,this.showIssueText,this.showOfficeNameText)}),$(".ui-dialog-title").html(`<span class="iconPlaceholder t-Icon fa ${a}"></span> Websocket Server`),$(".ui-dialog-content.ui-widget-content").addClass("custom-height"),$(".ui-dialog-content p").html($(".ui-dialog-content p").html().replace(/&lt;b&gt;/g,"<b>").replace(/&lt;\/b&gt;/g,"</b>").replace(/&lt;table&gt;/g,"<table>").replace(/&lt;\/table&gt;/g,"</table>").replace(/&lt;tr&gt;/g,"<tr>").replace(/&lt;\/tr&gt;/g,"</tr>").replace(/&lt;td&gt;/g,"<td>").replace(/&lt;\/td&gt;/g,"</td>").replace(/<br>/g,""))}};