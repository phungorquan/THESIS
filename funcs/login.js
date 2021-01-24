var mySocketIO = io({transports: ['websocket'], upgrade: false});
mySocketIO.on("WRONG_CREDENTIAL",function(error)
{ 
    alert("Sai tài khoản hoặc mật khẩu!");
});

mySocketIO.on("OK_CREDENTIAL",function(url)
{ 
	// Re-direct to url
    window.location.href = url;
});


function Login()
{
    var getUsr = document.getElementById('idUsr').value;
    var getPsw = document.getElementById('idPsw').value;

    var arr = Array();
    arr.push(getUsr);
    arr.push(getPsw);
    mySocketIO.emit("CHECKING_LOGIN",arr);
}

// Get the input field
var input = document.getElementById("idLogin");

// Execute a function when the user releases a key on the keyboard
input.addEventListener("keyup", function(event) {
  // Number 13 is the "Enter" key on the keyboard
  if (event.keyCode === 13) {
    // Cancel the default action, if needed
    event.preventDefault();
    // Trigger the button element with a click
    Login();
  }
});