
var badLine = 333;
console.log(badLine);

//$('#el1').off('.dropdown.data-api');
$('#el1').on('click', function(e, options) {
    console.log('click:', e);
    if(options && options.isClickDefaultEnable) {
        return true;
    }
    e.stopPropagation();
    e.preventDefault();
    
    setTimeout(function() {
        $('#el1').trigger( "click" , [ {isClickDefaultEnable: true} ]);
    }, 5000);
});

