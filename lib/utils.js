// A small template function. Use it like...
//
//    template("something {{foo}}", {
//        foo: "bar"
//    }); // something bar
//
var template = function(html, options) {
    var re = /{{(\s*[\w\.]+\s*)}}/g,
        match,
        reExp = /(^( )?(if|for|else|switch|case|break|{|}))(.*)?/g, 
        code = "var r=[];\n",
        cursor = 0;
    
    var add = function(line, js) {
        if (js) {
            code += line.match(reExp) ? line + "\n" : "r.push(this." + line + ");\n";
        }
        else {
            code += line !== "" ? "r.push('" + line.replace(/"/g, "\\\"") + "');\n" : "";
        }
        return add;
    };
    while(match = re.exec(html)) {
        add(html.slice(cursor, match.index))(match[1], true);
        cursor = match.index + match[0].length;
    }
    add(html.substr(cursor, html.length - cursor));
    
    code += "return r.join(\"\");";

    return new Function(code.replace(/[\r\t\n]/g, '')).apply(options);
};