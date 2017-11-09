// ==UserScript==
// @name            markdown viewer
// @namespace       znegva.github.io
// @description     displays local markdown files in browser, provides different styles
// @require			http://cdnjs.cloudflare.com/ajax/libs/showdown/0.3.1/showdown.min.js
// @include         file:///*.md
// @author          znegva
// @version			2014.5.8.1
// ==/UserScript==

/*
 * TODOS:
 * get ideas what would be good to have
 * 		offer to open another file
 * check if it works in FF
 * comment a bit more...
 * offer "plain text" style
 * 		with syntax highlighting using highlight.js
 * make it more OO :)
 * add tooltips to the icons
 * add "reload now" to reload-icon
 */

function mdvInit(){
    //check if it is a local file, if the script is used as a Google Chrome Extension, there are no real checks for @include
    if ( window.location.protocol !== "file:") return;
    
    
    //var s = document.body.textContent;
    var d = document.createElement("div");
    d.id = "mdv_container";
    d.style.position = "absolute";
    d.style.top = "50px";
    d.style.zoom = getSetting("zoomlevel");
    
    document.body.innerHTML = "";
    document.body.appendChild(d);
    
    reloadNow();
    addStyle();
    addBar();
    setReloadInterval();   
}

function md2container(s){
    var converter = new Showdown.converter();
    var htmltext = converter.makeHtml(s);
    mdv_container.innerHTML = htmltext;
}

/*
 * Getter and Setter for Settings, we use this to provide some
 * default values for the first use
 */
function setSetting(setting, value){
     window.localStorage.setItem("mdv_"+setting,value);
}
function getSetting(setting){
    var defaultSettings = {};
    defaultSettings["display_settings"] = "inline";
    defaultSettings["cssstyle"] = "none";
    defaultSettings["reloadinterval"] = "never";
    defaultSettings["zoonlevel"] = "100%";
    
    var value = window.localStorage.getItem("mdv_"+setting);
    if (value !== null)
        return value;
    else
        return defaultSettings[setting];
}


/*
 * toggle visibility of the Settings
 * we also store the visibility for the next reload
 */
function toggleSettingsVisibility(){
    var mds = document.getElementById("mdv_settings");
    if(mds.style.display == 'inline'){
    	mds.style.display = 'none';
        setSetting("display_settings", "none");
    }else{
    	mds.style.display = 'inline';
        setSetting("display_settings", "inline");
    }
}

/*
 * define the different CSS-files we use
 */
function addStyle(){
    //the style for the markdown
    var cssfile = document.createElement("link");
    cssfile.id = "mdv_css";
    cssfile.setAttribute("rel", "stylesheet");
    cssfile.setAttribute("type", "text/css");
    cssfile.setAttribute("href", getStyles()[getSetting("cssstyle")]);
    document.head.appendChild(cssfile);
    
    //Font Awesome
    var cssfa = document.createElement("link");
    cssfa.setAttribute("rel", "stylesheet");
    cssfa.setAttribute("type", "text/css");
    cssfa.setAttribute("href", "http://netdna.bootstrapcdn.com/font-awesome/4.0.3/css/font-awesome.css");
    document.head.appendChild(cssfa);
    
    //Styles for the bar and credits-dialog
    var cssbar = document.createElement("style");
    cssbar.type="text/css";
    cssbar.textContent = "#mpv_container{z-index: 1;} \n";
    cssbar.textContent += ".mdv_button{padding: 1px; margin-right: 10px; cursor: pointer;} \n";
    cssbar.textContent += ".fa{padding-right: 5px;} \n";
    cssbar.textContent += "#mdv_spinner{width: 15px; min-width: 15px; display: inline-block;} \n";
    cssbar.textContent += "#mdv_creditbox{\n \
background-color: black; color: white; border: 1px solid white; z-index: 999; position: absolute; \
margin-top: 20px; padding: 10px;} \n \
#mdv_creditbox h1,#mdv_creditbox h2,#mdv_creditbox h3,#mdv_creditbox h4{color: white;} \n \
#mdv_creditbox a{color: white;} \n \
#mdv_creditbox_close{position: absolute; top:5px; right: 5px;}";
    document.head.appendChild(cssbar);
    
    //in printmode we dont want to see the bar
    var cssprint = document.createElement("style");
    cssprint.type="text/css";
    cssprint.media="print";
    cssprint.textContent = "#mdv_bar{display: none;}";
    document.head.appendChild(cssprint);
}

/*
 * getter for Font Awesome icons
 */
function getFaIcon(name){
    var i = document.createElement("i");
    i.setAttribute("class", "fa fa-"+name);
    return i;
}



/*
 * switch between the different supported stylesheets by changing the 
 * current active one in the link-Element created before
 */
function setStyle(){
    showSpinner();
    //delete the old one if it exists
    document.getElementById("mdv_css").remove();
    
    var f = mdv_styleselect.item(mdv_styleselect.selectedIndex).value;
    var t = mdv_styleselect.item(mdv_styleselect.selectedIndex).text; 
    
    var cssfile = document.createElement("link");
    cssfile.id = "mdv_css";
    cssfile.setAttribute("rel", "stylesheet");
    cssfile.setAttribute("type", "text/css");
    cssfile.setAttribute("href", f);
    cssfile.onload = hideSpinner;
    document.head.appendChild(cssfile);

    setSetting("cssstyle", t);
}
function hideSpinner(){
    mdv_spinner.firstChild.style.display = "none";
}
function showSpinner(){
    mdv_spinner.firstChild.style.display = "inline-block";
}
/*
 * getter for the list of Stylesheets 
 */
function getStyles(){
    var s = {};
    s.none 			= "";
    s.swiss 		= "http://znegva.github.io/markdown-viewer/swiss.css";
    s.foghorn 		= "http://znegva.github.io/markdown-viewer/foghorn.css";
    s.screen		= "http://znegva.github.io/markdown-viewer/screen.css";
    s.avenir_white	= "http://znegva.github.io/markdown-viewer/avenir-white.css";
    s.markdown_alt 	= "http://znegva.github.io/markdown-viewer/markdown-alt.css";
    s.markdown 		= "http://znegva.github.io/markdown-viewer/markdown.css";
    s.markdown1		= "http://znegva.github.io/markdown-viewer/markdown1.css";
    s.markdown2		= "http://znegva.github.io/markdown-viewer/markdown2.css";
    s.markdown3		= "http://znegva.github.io/markdown-viewer/markdown3.css";
    s.markdown4		= "http://znegva.github.io/markdown-viewer/markdown4.css";
    s.markdown5		= "http://znegva.github.io/markdown-viewer/markdown5.css";
    s.markdown6		= "http://znegva.github.io/markdown-viewer/markdown6.css";
    s.markdown7		= "http://znegva.github.io/markdown-viewer/markdown7.css";
    s.markdown8		= "http://znegva.github.io/markdown-viewer/markdown8.css";
    s.markdown9		= "http://znegva.github.io/markdown-viewer/markdown9.css";
    s.markdown10 	= "http://znegva.github.io/markdown-viewer/markdown10.css";
    
    return s;
}

function reloadNow(){
    var client = new XMLHttpRequest();
	client.open('GET', location.href);
	client.onreadystatechange = function() {
		md2container(client.responseText);
        //we dont need to set the stylesheet again, as we are only changing the div
	}
	client.send();
}
function setReloadInterval(){
    clearInterval(window.mdvReloadIntervalID);

    var r = mdv_reloadselect.item(mdv_reloadselect.selectedIndex).value;
    var t = mdv_reloadselect.item(mdv_reloadselect.selectedIndex).text;
    if (r != 0)
    	window.mdvReloadIntervalID = setInterval(reloadNow, r);
    setSetting("reloadinterval", t);
}
function getReloadintervals(){
    var r = {};
    r["never"] 	= 0;
    r["2sec"]	= 1000;
    r["2sec"]	= 2000;
    r["5sec"]	= 5000;
    r["10sec"] 	= 10000;
    r["20sec"]	= 20000;
    r["30sec"]	= 30000;
    r["1min"]	= 60000;
    r["2min"]	= 2*r["1min"];
    r["3min"]	= 3*r["1min"];
    
    return r;
}


function getZoomlevels(){
    var z = {};
    z["100%"] 	= "100%";
    z["90%"] 	= "90%";
    z["75%"] 	= "75%";
    z["66%"] 	= "66%";
    z["50%"] 	= "50%";
    z["110%"] 	= "110%";
    z["125%"] 	= "125%";
    z["150%"] 	= "150%";
    return z;
}
function setZoomlevel(){
    //zoom doesnt apply on explicit line-heights, which is set for lists in some styles
    var z = mdv_zoomselect.item(mdv_zoomselect.selectedIndex).value;
    mdv_container.style.zoom = z;
    setSetting("zoomlevel", z);
}

function showCredits(){
    if (document.getElementById("mdv_creditbox")) return;
    
    var text = "###Credits \n\
 * [Markdown](https://daringfireball.net/projects/markdown/) was conceived by John Gruber.  \n\
 * [showdown.js](http://markhuot.github.io/phocco/resources/showdown.js.html) by John Fraser \
is the JavaScript port of Markdown which converts your md-file to HMTL.  \n\
 * [The CSS-files of jasonm23](https://github.com/jasonm23/markdown-css-themes) let the HTML look good. [Some changes](https://github.com/znegva/markdown-css-themes) were done by me.  \n\
 * [Font Awesome by Dave Gandy](http://fontawesome.io) was used for the nice icons.";
	var converter = new Showdown.converter();
    var htmltext = converter.makeHtml(text);
	var creditbox = document.createElement("div");
    creditbox.id = "mdv_creditbox";
    creditbox.innerHTML = htmltext;
    
    var creditbox_close = document.createElement("span");
    creditbox_close.appendChild(getFaIcon("times"));
    creditbox_close.id = "mdv_creditbox_close";
    creditbox_close.setAttribute("class", "mdv_button");
    creditbox_close.onclick = killCredits;
    creditbox.appendChild(creditbox_close); 
    
    mdv_settings.appendChild(creditbox);
    //document.body.appendChild(creditbox);
}
function killCredits(){
    document.getElementById("mdv_creditbox").remove();
}
	


function getSettingsDialog(sname, sicon, sid, soptions, scurrentoption, sonchange){
    var myspan = document.createElement("span");
    //myspan.appendChild(document.createTextNode(sname + ": "));
    myspan.appendChild(getFaIcon(sicon));
    var myselect = document.createElement("select");
    myselect.id = sid;
    myselect.style.margin = "0";
    myselect.style.marginRight = "15px";
    myselect.style.width = "auto";
    for (option in soptions){
        var o = new Option(option);
        o.value = soptions[option];
        if (option == scurrentoption) o.selected = true;
        myselect.options.add(o);
    }
    myselect.onchange = sonchange;
    myspan.appendChild(myselect);
    
    return myspan;
}

/*
 * builder for the Settingsbar
 * select-list of available styles will be created and currently active style marked as selectd
 * 
 */
function addBar(){
    var bar = document.createElement('div');
    bar.id = "mdv_bar";
    bar.style.padding = "10px";
    bar.style.position = "fixed";
    bar.style.top = "10px";
    bar.style.left = "10px";
    bar.style.border = "1px solid white";
    bar.style.backgroundColor = "black";
    bar.style.color = "white";
    bar.style.fontFamily = "sans-serif";
    
    var logo = document.createElement("span");
    logo.style.fontWeight = "bold";
    logo.style.fontSize = "12pt";
    logo.style.cursor = "pointer";
    logo.appendChild(document.createTextNode("mdv"));
    logo.onclick = toggleSettingsVisibility;
    bar.appendChild(logo);
    
    var s = document.createElement('div');
    s.id = "mdv_settings";
    s.style.paddingLeft = "40px";
    s.style.display = getSetting("display_settings");
    s.style.fontWeight = "normal";
    s.style.fontSize = "10pt";
    
    //if a any file needs some time to load, we want to show a spinner
    var spinner = document.createElement("div");
    spinner.id = "mdv_spinner";
    spinner.innerHTML = '<i class="fa fa-spinner fa-spin"></i>';
    s.appendChild(spinner);
    
    //style=magic, zoom=text-height,font, print=print, reload=refresh, info=info
    s.appendChild(getSettingsDialog("Style",
                                    "magic",
                                    "mdv_styleselect", 
                                    getStyles(), 
                                    getSetting("cssstyle"), 
                                    setStyle));
    
    s.appendChild(getSettingsDialog("Zoom",
                                    "font",
                                    "mdv_zoomselect", 
                                    getZoomlevels(), 
                                    getSetting("zoomlevel"), 
                                    setZoomlevel));
    
    var p = document.createElement('span');
    p.appendChild(getFaIcon("print"));
    p.setAttribute("class", "mdv_button");
    p.onclick = function(){window.print();}
    s.appendChild(p);
    
   	s.appendChild(getSettingsDialog("Autoreload",
                                    "refresh",
                                    "mdv_reloadselect", 
                                    getReloadintervals(), 
                                    getSetting("reloadinterval"), 
                                    setReloadInterval));
    
    var c = document.createElement('span');
    c.id = "mpv_credits_button";
    c.appendChild(getFaIcon("info"));
    c.setAttribute("class", "mdv_button");
    c.onclick = showCredits;
    s.appendChild(c);
    
    bar.appendChild(s);
    document.body.appendChild(bar);
    
    //hide the spinner
    hideSpinner();
}


mdvInit();
