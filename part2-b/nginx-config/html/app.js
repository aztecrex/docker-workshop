function getCount(have) {
  $.ajax({
      url : '/counter?have=' + have,
      type : 'GET',
      success : function(data) {
        $('#count').text(data.count);
        getCount(data.count);
      },
      error : function(request,error)
      {
        console.log("count - failed to get data: " + error);
        getCount(have);
      }
  });
}

function getMessage(have) {
  $.ajax({
      url : '/motd?have=' + have,
      type : 'GET',
      success : function(data) {
        $('#message').text(data.message);
        getMessage(data.serial);
      },
      error : function(request,error)
      {
        console.log("message - failed to get data: " + error);
        getMessage(have);
      }
  });
}

function incrementCount() {
  $.ajax({
      url : '/counter',
      type : 'POST',
      success : function() {
      },
      error : function(request,error)
      {
        console.log("incr count - failed to post: " + error);
      }
  });
}

function updateMessage(newval) {
  console.log("updating message to: " + newval);
  $.ajax({
      url : '/motd',
      type : 'PUT',
      contentType: "application/json",
      data: JSON.stringify({"message":newval}),
      success : function() {
      },
      error : function(request,error)
      {
        console.log("update message - failed to put: " + error);
      }
  });

}


$(document).ready(function() {
    $("#bcount").click(function() {
        incrementCount();
    });
    $("#bmessage").click(function() {
        updateMessage($("#tmessage").val())
    });
    getMessage(0);
    getCount(0);
});


