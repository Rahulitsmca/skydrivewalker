// The callback URL to redirect to after authentication
redirectUri = "http://skydrivewalker.pagekite.me/bb/callback.htm";

// Initialize the JavaScript SDK
WL.init({
    client_id: '0000000048113961',
    redirect_uri: redirectUri
});

//Global variables
var loginFlag = false;
var backUrl = false;


$(document).ready(function () {
    // Start the login process when the login button is clicked
    $('#login').click(function () {
        if (!loginFlag) {
            WL.login({
                scope: ["wl.skydrive wl.signin"]
            }).then(
            // Handle a successful login
            function (response) {
                //$('#status').html("<strong>Success! Logged in.</strong>");
                $("#login").html("logout");
                loginFlag = true;
                showUserData();
            },
            // Handle a failed login
            function (responseFailed) {
                // The user might have clicked cancel, etc.
                $('#status').html(responseFailed.error.message);
            }
        );
        }
        else {

            WL.logout();
            $("#login").html("login");
            loginFlag = false;
        }
    });
});
function showUserData() {
    WL.api({ path: "/me/skydrive", method: "GET" }).then(
        function (response) {
            //log(JSON.stringify(response).replace(/,/g, "\n"));
            showDir(response);
        },
        function (response) {
            log("API call failed: " + JSON.stringify(response.error).replace(/,/g, "\n"));
        }
    );
}
function log(message) {
    var child = document.createTextNode(message);
    var parent = document.getElementById('JsOutputDiv') || document.body;
    parent.appendChild(child);
    parent.appendChild(document.createElement("br"));
}
function showDir(response) {
    backUrl = "/me/skydrive";
    var _html = "<li class='item' onclick='enter(this)' id='" + response.id + "' parent_id='" + response.parent_id + "'>" + response.name + " - " + response.type + "</li>";
    console.log(_html);
    $("#list").html(_html);
}

function enter(o) {
    var parent_id = $(o).attr("parent_id");
    if (parent_id != "null")
        backUrl = parent_id + "/files";

    $("#back").show();
    var url = o.id + "/files";
    WL.api({ path: url, method: "GET" }).then(
                function (response) {
                    console.log(response);
                    $("#list").html("");
                    for (var i in response.data) {
                        if (response.data[i].type == "folder") {
                            var _html = "<li class='item' onclick='enter(this)' id='" + response.data[i].id + "' parent_id='" + response.data[i].parent_id + "'>" + response.data[i].name + " - " + response.data[i].type + "</li>";
                            $("#list").append(_html);
                        }
                        else {
                            var _html = "<li class='item'> <a href='" + response.data[i].source + "' target='_blank'>" + response.data[i].name + " - " + response.data[i].type + "</a></li>";
                            $("#list").append(_html);
                        }
                    }
                    //log(JSON.stringify(response).replace(/,/g, "\n"));
                    //showDir(response);
                },
                function (response) {
                    log("API call failed: " + JSON.stringify(response.error).replace(/,/g, "\n"));
                }
            );
}
function back() {
    //$("#back").show();
    //var url = o.id + "/files";
    var old = backUrl;
    var url = $("#list li").first().attr("parent_id");
    if (url != null) {
        backUrl = url + "/files";
    }

    WL.api({ path: old, method: "GET" }).then(
                function (response) {
                    console.log(response);
                    $("#list").html("");
                    if (response.data == null) {
                        showDir(response);
                    }
                    else {
                        //backUrl = response.data[0].parent_id + "/files";
                        for (var i in response.data) {
                            if (response.data[i].type == "folder") {
                                var _html = "<li class='item' onclick='enter(this)' id='" + response.data[i].id + "' parent_id='" + response.data[i].parent_id + "'>" + response.data[i].name + " - " + response.data[i].type + "</li>";
                                $("#list").append(_html);
                            }
                            else {
                                var _html = "<li class='item'> <a href='" + response.data[i].source + "' target='_blank'>" + response.data[i].name + " - " + response.data[i].type + "</a></li>";
                                $("#list").append(_html);
                            }
                        }
                    }
                },
                function (response) {
                    log("API call failed: " + JSON.stringify(response.error).replace(/,/g, "\n"));
                }
            );

}