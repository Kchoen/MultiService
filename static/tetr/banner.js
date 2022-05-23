SignUping = false;
isShowwingGameExplain = false;
isShowingChangeNameUI = false;
isShowingChangePwdUI = false;
userName = "";
data = { mode: "dark" };
document.documentElement.setAttribute("data-theme", "dark");
$("#darkModeControl").html("關閉深夜模式");

function get_banner(username = null, darkmode = true) {
    return $(`
    <div class="bg"></div>
    <div class="mask" id="MASK" onclick="clickMask()" style="rgba(255,255,255,0); visibility: hidden"></div>
    <table class="flex-container">
        <tr>
            <th style="width: 6%"></th>
            <th style="width: 12.5%;">TETR-2P</th>
            <th class="hover" onclick="clickShowExplain()">遊戲規則</th>
            <th class="hover"><a href="https://github.com/tetr-2p/Forum" style="color: white; text-decoration: none;">聯絡我們</a></th>
            <th style="width: 22%"></th>
            ${
                username == null
                    ? '<th class="hover" id="SignUpControl" onclick="handleSignUp()">註冊</th>'
                    : `<th class="hover" id="profileBtn" onclick="handleProfile()"> <img src="Image.png" width="60" height="60">
                            &nbsp ${username}
                            <ul id="profile-menu" class="dropdown-menu">
                                <li class="dropdown-list" onclick="AAA()">更改名字</li>
                                <li class="dropdown-list" onclick="BBB()">更改密碼</li>
                                <li class="dropdown-list" onclick="file.click()">更換照片</li>
                            </ul>
                            <input id="file" type="file" onchange="upload(this)" style="display: none" />
                        </th>`
            }
            <th class="hover" id="settingBtn" onclick="handleSetting()">
                設定
                <ul id="setting-menu" class="dropdown-menu">
                    <li class="dropdown-list" id="darkModeControl" onclick="switchMode()">${darkmode ? "關閉" : "開啟"}深夜模式</li>
                    <li class="dropdown-list" onclick="event.stopPropagation();">設定按鍵</li>
                    <li class="dropdown-list" onclick="event.stopPropagation();">調整速度</li>
                </ul>
            </th>
            <th style="width: 3%"></th>
        </tr>
    </table>

    <div class="login_interface" id="signupUI" align='left' style="opacity: 0; visibility: hidden">
        <div class="login_style" style="padding: 5% 10% 1% 10%">Username</div>
        <div class="login_style" align="left"><input class="login otherinput" type="text" id="regU" /></div>
        <div class="login_style">Password</div>
        <div class="login_style" style="padding: 1% 10% 0 10%" align="left"><input class="login otherinput" type="password" id="regP" /></div>
        <div class="login_style">Confirm Password </div>
        <div class="login_style" style="padding: 1% 10% 0 10%" align="left"><input class="login otherinput" type="password" id="regCP" /></div>
        <div class="login_style" style="padding: 0 10% 0 10%;" id="ConfirmMessage"></div>
        <div style="width: 100%; height: 0.5%"></div>
        <div class="login_style" style="padding: 1% 10% 5% 10%" align="left"><input class="loginBtn otherinput" value="登入" type="submit" onclick="SendRegUserPassword()" /></div>
        <div style="width: 100%; height: 1%"></div>
        
    </div>

    <div class="login_interface" id="GameExplain" style="padding: 24px 24px 24px 24px; width: 40vw; opacity: 0; visibility: hidden">
        <div align="left" style="float: left; width: 300px">
            <div align="center"> <b>遊戲規則</b> </div>
            <div> 在 2 分鐘內盡量消除行數並擊倒對手 </div>
        </div>
        <table class="ruletable" style="float: right">
            <tr bgcolor="#EEEEEE" style="font-weight: bold">
                <th align="center">方塊動作</th>
                <th align="center">控制按鍵</th>
            </tr>
            <tr> <td align="center">左移</td> <td align="center">←</td> </tr>
            <tr> <td align="center">右移</td> <td align="center">→</td> </tr>
            <tr> <td align="center">順轉</td> <td align="center">↑</td> </tr>
            <tr> <td align="center">逆轉</td> <td align="center">Z</td> </tr>
            <tr> <td align="center">緩降</td> <td align="center">↓</td> </tr>
            <tr> <td align="center">瞬降</td> <td align="center">空白鍵</td> </tr>
            <tr> <td align="center">保留</td> <td align="center">Shift</td> </tr>
        </table>

    </div>

    <div class="login_interface" id="ChangeNameUI" align="left" style="padding: 24px 0 24px 24px; width: 25vw; opacity: 0; visibility: hidden">
        <div style="padding-bottom: 6px"> 新使用者名稱 </div>
        <div style="padding-bottom: 6px"> <input value="${PersonalData.NAME}" id="inputName" style="font-size: 28px; width: 20vw; display: inline-block; color: var(--input-background)"></div>
        <button style="font-size: 28px" onclick="ChangeName()" >更改名字</button>
    </div>

    <div class="login_interface" id="ChangePwdUI" align="left" style="padding: 24px 0 24px 24px; width: 25vw; opacity: 0; visibility: hidden">
        <div style="padding-bottom: 6px"> 新密碼 </div>
        <div style="padding-bottom: 6px"> <input type="password" value="" id="inputPW" style="font-size: 28px; width: 20vw; display: inline-block; color: var(--input-background)"> </div>
        <div style="padding-bottom: 6px"> 確認密碼 </div>
        <div style="padding-bottom: 6px"> <input type="password" value="" id="CONFIRMinputPW" style="font-size: 28px; width: 20vw; display: inline-block; color: var(--input-background)"> </div>
        <button style="font-size: 28px" onclick="ChangePW()" >更改密碼</button>
    </div>
    `);
}

function AAA() {
    isShowingChangeNameUI = !isShowingChangeNameUI;
    ShowChangeNameUI();
}

function ShowChangeNameUI() {
    if (isShowingChangeNameUI) {
        $("#ChangeNameUI").css({ opacity: "1", visibility: "" });
    } else {
        $("#ChangeNameUI").css({ opacity: "0", visibility: "hidden" });
    }
    ShowMask();
}

function BBB() {
    isShowingChangePwdUI = !isShowingChangePwdUI;
    ShowChangePwdUI();
}

function ShowChangePwdUI() {
    if (isShowingChangePwdUI) {
        $("#ChangePwdUI").css({ opacity: "1", visibility: "" });
    } else {
        $("#ChangePwdUI").css({ opacity: "0", visibility: "hidden" });
    }
    ShowMask();
}

function handleProfile() {
    ele = $("#profile-menu");
    ele2 = $("#profileBtn");
    cur = ele.css("display");
    if (cur == "block") {
        ele.css("display", "none");
        ele2.css("background-color", "");
    } else {
        ele.css("display", "block");
        ele2.css("background-color", "var(--theme-color-chosen)");
    }
}

function switchMode() {
    if (data["mode"] == "") {
        data["mode"] = "dark";
        document.documentElement.setAttribute("data-theme", "dark");
        $("#darkModeControl").html("關閉深夜模式");
    } else {
        data["mode"] = "";
        document.documentElement.setAttribute("data-theme", "");
        $("#darkModeControl").html("開啟深夜模式");
    }
}

function handleSignUp() {
    if (userName == "") {
        SignUping = !SignUping;
        ShowSignUpUI();
    } else {
        logoutChecker();
    }
}

function ShowSignUpUI() {
    if (SignUping) {
        $("#signupUI").css({ opacity: "1", visibility: "" });
    } else {
        $("#signupUI").css({ opacity: "0", visibility: "hidden" });
    }
    ShowMask();
}

function ShowMask() {
    if (isShowingChangeNameUI || isShowingChangePwdUI || SignUping || isShowwingGameExplain) {
        $("#MASK").css({ backgroundColor: "rgba(255,255,255,0.25)", visibility: "" });
    } else {
        $("#MASK").css({ backgroundColor: "rgba(255,255,255,0)", visibility: "hidden" });
    }
}

function clickMask() {
    isShowwingGameExplain = false;
    SignUping = false;
    isShowingChangeNameUI = false;
    isShowingChangePwdUI = false;
    ShowSignUpUI();
    ShowGameExplain();
    ShowChangeNameUI();
    ShowChangePwdUI();
    ShowMask();
}

function clickShowExplain() {
    isShowwingGameExplain = !isShowwingGameExplain;
    ShowGameExplain();
}

function ShowGameExplain() {
    if (isShowwingGameExplain) {
        $("#GameExplain").css({ opacity: "1", visibility: "" });
    } else {
        $("#GameExplain").css({ opacity: "0", visibility: "hidden" });
    }
    ShowMask();
}

function handleSetting() {
    ele = $("#setting-menu");
    ele2 = $("#settingBtn");
    cur = ele.css("display");
    if (cur == "block") {
        ele.css("display", "none");
        ele2.css("background-color", "");
    } else {
        ele.css("display", "block");
        ele2.css("background-color", "var(--theme-color-chosen)");
    }
}
