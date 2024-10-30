<?php
/*
Plugin Name: jTab Guitar Tab Shortcode
Plugin URI: http://jtab-guitar-tab-shortcode.marichiba.com/
Description: Shortcode to display guitar chords and tab on your WordPress blog, based on the jTab JavaScript library by Paul Gallagher.
Version: 1.0
Author: MatthewMarichiba
Author URI: http://www.marichiba.com/about-matthew
License: GPL2
*/

 /* This file Copyright 2012  Matthew Marichiba  (email : matthew atsign marichiba dot com)

    This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License, version 2, as 
    published by the Free Software Foundation.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program; if not, write to the Free Software
    Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
*/

 /** 
  * jtab_shortcode() embeds jTab notation into a div with class="jtab" to be rendered by the jTab JavaScript library. 
  * This plugin is based on the open-source jTab JavaScript code by Paul Gallagher. (http://jtab.tardate.com)
  * @param  $atts   an array of shortcode arguments. The potential indexes of $atts are "phrase", "class", "id", "showform", "buttontext"  
  * @return         HTML code to insert into the page.
  */
function jtab_shortcode($atts)    
  {
    if (!isset($atts['phrase'])) {$atts['phrase']="";}
	if (!isset($atts['class'])) {$atts['class']="";}
    if (!isset($atts['buttontext'])) {$atts['buttontext']="jTab this!";}
    if (!isset($atts['id'])) {
        $id_string="";
    } else {
        $id_string=" div='" . $atts['id'] . "' "; 
    }
    if (!isset($atts['showform'])) {
        $atts['showform']="false";
    } elseif ($atts['showform'] == 'true') { // if showform is set and it's 'true', then force the div id='jtab' 
        $id_string=" id='jtab' ";
    }

	// Model output to look like the following:
	// <div class="jtab optionalclass" id="optionalid"> E / / / | Am / B / || </div> 
	// Here's a good phrase to try: A x.0.2.2.3.0 $2 2 0 2 3 5/3 A B Cdim
	$embed_string =
		'<div class=\'jtab ' . $atts['class'] . '\' ' . $id_string . '>' . $atts['phrase'] . '</div>';
    if ($atts['showform'] == 'true') {
        $embed_string = '
            <input id="jtab_phrase" type="text" size="40" value="' . $atts['phrase'] . '">
            <input id="jtab_button" type="button" value="' . $atts['buttontext'] . '">
            ' . $embed_string;
    }


	if ( isset($atts['debug']) ) {
	    $embed_string = $embed_string . "<br>Here are the parameters:<br> phrase=".$atts['phras']." showform=".$atts['showform']." class=".$atts['class']." id_string=".$id_string. " debug=".$atts['debug']."<br>";
    } 
	return $embed_string;  
}
add_shortcode("jtab", "jtab_shortcode");

/** 
 * include_jtab_js() loads a javascript file in the footer section of a page. 
 * This function is an action hook for wp_foot (or wp_head). 
 */
function include_jtab_js () {

        
    // register the javascript location, dependencies and version
    // MJM: This code copied from WP codex: http://codex.wordpress.org/Function_Reference/wp_enqueue_script
    $custom_script_path = WP_PLUGIN_URL . '/' . 
        str_replace(basename(__FILE__), "", plugin_basename(__FILE__) ) .
        'jtab/javascripts/';

    wp_register_script('jtab_prototype', $custom_script_path . "prototype.js", array('jquery'), false, true ); // args: $handle, $path_to_source, $dependencies, $version, $in_footer
    wp_enqueue_script('jtab_prototype');
    wp_register_script('jtab_raphael', $custom_script_path . "raphael.js", array('jquery'), false, true ); 
    wp_enqueue_script('jtab_raphael');
    wp_register_script('jtab_jtab', $custom_script_path . "jtab.js", array('jquery'), false, true ); 
    wp_enqueue_script('jtab_jtab');
    wp_register_script('jtab_form', $custom_script_path . "../../scripts.js", array('jquery'), false, true ); 
    wp_enqueue_script('jtab_form');
}
add_action('wp_enqueue_scripts', 'include_jtab_js'); 

?>