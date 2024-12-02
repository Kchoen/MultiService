function PlayAsGuest() {
    axios.post("/", { PTYPE: "login", Method: "GuestLogin" }).then((response) => {
        r = response.data;
        if (r.TOKEN != false) {
            PersonalData = { TOKEN: r.TOKEN, NAME: r.NAME };
            search_oppenent();
        }
    });
}
function SendRegUserPassword() {
    let UNAME = $("#regU").val(),
        PW = $("#regP").val(),
        CPW = $("#regCP").val();
    if (PW != CPW) {
        $("#ConfirmMessage").html("Password Not Match").css("color", "#ff0000");
        return;
    }
    axios.post("/", { PTYPE: "reg", UID: UNAME, PW: PW, Method: "Normal" }).then((response) => {
        r = response.data;
        if (r.TOKEN != false) {
            PersonalData = { TOKEN: r.TOKEN, UID: r.UID, NAME: r.NAME, elo: r.elo };
            toLoginPage();
        } else {
            $("#ConfirmMessage").html("Username Exists").css("color", "#ff0000");
        }
    });
}

function SendUserPassword() {
    let UNAME = $("#U").val(),
        PW = $("#P").val();
    axios.post("/", { PTYPE: "login", UID: UNAME, PW: PW, Method: "NormalLogin" }).then((response) => {
        r = response.data;
        if (r.TOKEN != false) {
            PersonalData = { TOKEN: r.TOKEN, UID: r.UID, NAME: r.NAME, elo: r.elo };
            toLoginPage();
        } else {
            $("#wrongpw").css("display", "block");
            $("#wrongpw").html("密碼錯誤");
        }
    });
}
// function GoogleLogin(GoogleUser) {
//     var auth2 = gapi.auth2.getAuthInstance();
//     auth2.signOut().then(function () {
//         var profile = GoogleUser.getBasicProfile();
//         axios.post("/", { PTYPE: "reg", UID: profile.getId(), NAME: profile.getName(), PW: profile.getEmail(), ICON: profile.getImageUrl(), Method: "Google" }).then((response) => {
//             r = response.data;
//             if (r.TOKEN != false) {
//                 PersonalData = { TOKEN: r.TOKEN, UID: r.UID, NAME: r.NAME, elo: r.elo };
//                 toLoginPage();
//             } else {
//                 $("#wrongpw").css("display", "block");
//                 $("#wrongpw").html("尚未註冊");
//             }
//         });
//     });
// }
