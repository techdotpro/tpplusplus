// Create style tag for button styles
var css = "body {font-family: \"museo-sans\",\"Helvetica Neue\",Helvetica,Arial,sans-serif;} .btn-bookmarklet .bookmarklet-inner{font-size:14px;line-height:16px;font-weight:700;color:#444;vertical-align:middle;display:inline-block}Inherited from a#bookmarklet.btn-bookmarklet.pull-left .btn-bookmarklet{}.btn-bookmarklet{display:inline-block;margin-top:1px;-moz-box-shadow:#ddd 1px 1px 4px;-webkit-box-shadow:#ddd 1px 1px 4px;box-shadow:#ddd 1px 1px 4px;-webkit-border-radius:3px;-moz-border-radius:3px;border-radius:3px;padding:5px 6px;background-color:#fafafa;border:1px solid #aaa;}a{cursor:pointer;color:#457bbe}.btn-bookmarklet .bookmarklet-ico{width:16px;height:16px}a img{border:0}img{max-width:100%;vertical-align:middle;border:0;-ms-interpolation-mode:bicubic}",
    head = document.head || document.getElementsByTagName("head")[0],
    style = document.createElement("style");

style.type = "text/css";
if (style.styleSheet){
    style.styleSheet.cssText = css;
} else {
    style.appendChild(document.createTextNode(css));
}

head.appendChild(style);