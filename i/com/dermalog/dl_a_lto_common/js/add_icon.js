// JavaScript Document


function addIconToModal(a) {
	$('.ui-dialog-title', parent.document).each(function(){
	if($(this).find(".iconPlaceholder").length == 0){
			$(this).prepend('<span class="iconPlaceholder t-Icon fa ' + a + '"></span>');
		}
	});
}