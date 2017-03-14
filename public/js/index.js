/**
 * javascript
 * */
// var updateButton = document.getElementById("update");

function updatefun() {
    document.getElementById("wsresponse").innerHTML = "";
    var form = document.getElementById("myForm");
    // collect the form data while iterating over the inputs
    var data = {};
    for (var i = 0, ii = form.length; i < ii; ++i) {
        var input = form[i];
        if (input.name && input.type != "button") {
            if (input.name == "measurementDate") {
                if (input.value === "") {
                    document.getElementById("wsresponse").innerHTML = "Date can not be blank.";
                    return false;
                } else {
                    var dd = new Date(input.value);
                    data[input.name] = dd.toISOString();
                }
            } else if (input.name == "referenceNumber") {
                if (input.value === "") {
                    document.getElementById("wsresponse").innerHTML = "Reference Number can not be blank";
                    return false;
                } else {
                    data[input.name] = input.value;
                }
            } else
                if (input.value === "") {
                    data[input.name] = null;
                } else {
                    data[input.name] = Number(input.value);
                }

        }
    }
    //action="https://maw-simulatorui.mybluemix.net/submeter"
    //  method="POST"
    console.log(JSON.stringify(data));
    // construct an HTTP request
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {

        }
    };
    xhr.open("POST", "/submeter", true);
    xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
    // send the collected data as JSON
    xhr.send(JSON.stringify(data));
    wsFunction();
}
// var cancelButton = document.getElementById("reset");

function resetfun() {
    var form = document.getElementById("myForm");
    for (var i = 0, ii = form.length; i < ii; ++i) {
        var input = form[i];
        if (input.name && input.type != "button") {
            input.value = "";
        }
    }
}

function wsFunction() {
    var ws = new WebSocket("wss://maw-simulatorui.mybluemix.net/maw/ws");
    ws.onmessage = function (evt) {
        var received_msg = evt.data;
        var parsedMsg = JSON.parse(received_msg);
        var innerMsg = parsedMsg.results[0];
        var msgType = "";
        var retVal = "";
        for (var key in innerMsg) {
            console.log("Key: " + key);
            console.log("Value: " + innerMsg[key]);
            msgType = key;
            retVal = innerMsg[key];
            break;
        }
        if (key === "id") {
            document.getElementById("wsresponse").innerHTML = "Record processed successfully, returned id: " + retVal;
        } else {
            document.getElementById("wsresponse").innerHTML = "Record processing failed, error message: " + retVal.entity.errorMessages[0];
        }

        // document.getElementById("wsresponse1").innerHTML = received_msg;
        resetfun();
        ws.close();
    };
}

window.onload = function () {
  // https://restcheck.mybluemix.net/api/devices
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
         var devicesArr = JSON.parse(xhr.responseText);
         var select = document.getElementById("referenceNumber");
        for(var i = 0; i < devicesArr.devices.length ; i++) {
            var option = document.createElement('option');
            option.text = option.value = devicesArr.devices[i];
            select.add(option, 0);
    }
      }
  };
  xhr.open("GET", "api/devices", true);
  // xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
  // send the collected data as JSON
  xhr.send();
}
