var classInformation = {"a":1,"b":2,"c":1};

var cipre = Object.entries(classInformation)
	.map(function (p) { 
        return p[1]==1?p[0]:""; })
    .reduce(function (t, v) { return t + (v==""?"":" " + v); }); 
console.log(cipre);