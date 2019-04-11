(function() {
  'use strict';
  window.addEventListener('load', function() {
    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    var forms = document.getElementsByClassName('needs-validation');
    // Loop over them and prevent submission
    var validation = Array.prototype.filter.call(forms, function(form) {
      form.addEventListener('submit', function(event) {
        if (form.checkValidity() === false) {
          event.preventDefault();
          event.stopPropagation();
        }
        form.classList.add('was-validated');
      }, false);
    });
  }, false);
})();

$('#likeFeedBack').on('click',function(){
    $('#likeFeedBack').addClass('disabled').attr('disabled','').html('<img height="20" src="/assets/img/spinner.gif"/>');
    $('#dislikeFeedBack').addClass('disabled').attr('disabled','').html('<img height="20" src="/assets/img/spinner.gif"/>');
    submitPostFeedback( 'like', Base64.encode(getPostPath()), getPageName() );
});
$('#dislikeFeedBack').on('click',function(){
    $('#likeFeedBack').addClass('disabled').attr('disabled','').html('<img height="20" src="/assets/img/spinner.gif"/>');
    $('#dislikeFeedBack').addClass('disabled').attr('disabled','').html('<img height="20" src="/assets/img/spinner.gif"/>');
    submitPostFeedback( 'dislike', Base64.encode(getPostPath()), getPageName() );
});
$('#postNewComment').on('submit',function(e){
    e.preventDefault();
    e.stopPropagation();
    if (chechValidity('#postNewComment')) {
        domLockInputs('#postNewComment');

        $.post(
            '/app/commentHandler.php',
            { commentData : getFormData( '#postNewComment' ) },
            function(response,status){
                console.log(response);
            if (status === 'success') {
                if (response.status === 'success') {
                    $('#postNewComment').fadeOut();
                    $('#successNotification').html(response.details.message).fadeIn();
                }else{
                    $('#postNewComment').fadeOut();
                    $('#errorNotification').html(response.details.message).fadeIn();
                }
            }else{
                $('#postNewComment').fadeOut();
                $('#errorNotification').html('Connection could not be established please try again later.').fadeIn();
            }
        });
    }
});

function domLockInputs( formId ){
    let form = $(formId);
    for (var i = 0; i < form[0].length; i++) {
        form[0][i].classList.add('disabled');
        form[0][i].setAttribute('disabled','');
    } form[0][form[0].length-1].innerHTML = '<img height="20" src="/assets/img/spinner.gif"/>';
}

function getFormData( formId ){
    let form = $(formId); let data = []; let key = sessionKeyPair.encKey;
    for (var i = 0; i < form[0].length - 1; i++) {
        let nx = $(formId)[0][i].name;
        let vx = $(formId)[0][i].value;
        let jx = '{"'+nx+'":"'+vx+'"}';
        data.push( JSON.parse(jx) );
    } return encryptData(JSON.stringify(data),key);
}

function encryptData( string, key ){
    let iv = CryptoJS.enc.Utf8.parse('r0dkbnVQhklNeUGA');
    let cypherText = CryptoJS.AES.encrypt( string, key, key,{iv: iv,mode: CryptoJS.mode.CBC,padding: CryptoJS.pad.Pkcs7}).toString();
    return Base64.encode( JSON.stringify( { encKeyId : sessionKeyPair.encKeyId, cypherText : cypherText } ) );
}   

function chechValidity( formId ){
    let form = $(formId); let validity = [];
    for (var i = 0; i < form[0].length - 1; i++) {
        if (form[0][i].value === "") {
            validity.push(false);
        }else{
            validity.push(true);
        }
    }
    if ( jQuery.inArray(false,validity) >= 0 ) {
        return false;
    }else{
        return true;
    }
}

function getPageName(){
    let path = window.location.pathname.split('/');
    return path[1];
}

function getPostPath(){
    let path = window.location.pathname.split('/');
    return path[1]+'/'+path[2];
}

function submitPostFeedback( value, postSlugB64, type ) {
    var feedbackData = {
        'value' : value,
        'postSlug' : postSlugB64,
        'type'  : type
    };
    $.post(
        '/api/emotion',
        { feedbackData : JSON.stringify(feedbackData) },
        function(res,sta){
        if (sta === 'success') {
            res = JSON.parse(res);
            if ( res.status === 'success' ) {
                $('#likeFeedBack').html(res.details.likePercentage+'%');
                $('#dislikeFeedBack').html(res.details.dislikePercentage+'%');
            }else{
                $('#likeFeedBack').html(res.details);
                $('#dislikeFeedBack').html(res.details);
            }
        }else{
            $('#likeFeedBack').html('Error in connection');
            $('#dislikeFeedBack').html('Error in connection');
        }
    });
}
