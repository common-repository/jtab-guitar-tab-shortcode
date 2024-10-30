/**jQuery
 * These blips of JavaScript activate the input form, when it is enabled, for the jTab Guitar Tab Shortcode.  
 */

// Elements with ID "jtab_phrase" and "jtab_button" are inserted in the HTML by the jtab shortcode.
jQuery(document).ready(function() {
    jQuery('#jtab_button').click(function() {
        jtab.render('jtab', jQuery('#jtab_phrase').val());  // Original: onclick="jtab.render('tab',$('notation').value);"
    });   

    jQuery('#jtab_phrase').keypress(function(e){
        if (e.which == 13) {
            jtab.render('jtab',jQuery('#jtab_phrase').val());
        }    
    });
});
