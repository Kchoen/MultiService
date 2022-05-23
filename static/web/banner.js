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
            <th style="width: 12.5%;">網站合集</th>
            <th class="hover"><a href="https://github.com/tetr-2p/Forum" style="color: white; text-decoration: none;">聯絡我們</a></th>
            <th style="width: 22%"></th>
            <th class="hover" id="settingBtn" onclick="handleSetting()">
                設定
                <ul id="setting-menu" class="dropdown-menu">
                    <li class="dropdown-list" id="darkModeControl" onclick="switchMode()">${darkmode ? "關閉" : "開啟"}深夜模式</li>
                    
                </ul>
            </th>
            <th style="width: 3%"></th>
        </tr>
    </table>

    `);
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
