;
$.false = function() {return false;}

var _system = function(opts) {
   var sys = this;


   $.extend(this, {
      onSystemReady: $.noop,
   }, opts);

   sys.base = {}; // holds base subsystems.
   sys.phpCaller = undefined; // php caller to fetch parts for base.parts

   sys.construct = function() {
      sys.parts = new sys.base.parts();
      sys.phpCaller = new sys.base.phpCaller();
      $.when(sys.parts.fetchXHR).done(function() {
         sys.onSystemReady();
      });
   }


   sys.systemWorking = function() {
      return sys.parts.fetchXHR;
   }

   sys.base.parts = function(opts) {
      var ps = this;

      $.extend(this, {
         fetchAsync: false,
         srcHtml: "parts.html",
         integrateFunction: "integratev2",
      }, opts);

      // inits
      ps.partsRepo = undefined;
      ps.fetchXHR = undefined;

      ps.construct = function() {
         ps.integrate = ps[ps.integrateFunction];

         ps.fetchParts();
      }

      ps.fetchParts = function() {
         ps.fetchXHR = $.ajax({url:ps.srcHtml, type:"post", dataType:"html", fetchAsync: ps.fetchAsync,
            success: function(data) {
               ps.partsRepo = $(data);
            }, error: function(data) {

            }
         });
      }

      ps.setupEvents = function(part) {
         var owner = this;
         var events = part.attr("data-js-events").split(",");

         events.forEach(function(e) {
            var partName = "";
            if (typeof part.attr("data-js-name")!="undefined") {
               partName = part.attr("data-js-name");
               partName = partName[0].toUpperCase() + partName.slice(1);
            }

            if (e=="anychange") part.on({"input propertychange paste keyup": owner["on"+partName+"Changed"]});
            if (e=="click") part.on({"click": owner["on"+partName+"Clicked"]});
            if (e=="dblclick") part.on({"dblclick": owner["on"+partName+"Doubleclicked"]});
            if (e=="keypress") part.on({"keypress": owner["on"+partName+"KeyPress"]});
            if (e=="keyup") part.on({"keyup": owner["on"+partName+"KeyUp"]});
            if (e=="keydown") part.on({"keydown": owner["on"+partName+"KeyDown"]});
            if (e=="change") part.on({"change": owner["on"+partName+"Changed"]});
            if (e=="mouseover") part.on({"mouseover": owner["on"+partName+"MouseOver"]});
            if (e=="mouseenter") part.on({"mouseenter": owner["on"+partName+"MouseEnter"]});
            if (e=="mouseleave") part.on({"mouseleave": owner["on"+partName+"MouseLeave"]});
            if (e=="mousedown") part.on({"mousedown": owner["on"+partName+"MouseDown"]});
         });
      }

      ps.get = function(selector) {
         var selectedPart = ps.partsRepo.find(selector);
         if (selectedPart.length!=0) {
            selectedPart = selectedPart.children().first().clone();
            selectedPart.find("*").addBack().each(function() {
               if (typeof $(this).attr("data-js-name")!="undefined") selectedPart[$(this).attr("data-js-name")] = $(this);
            });
         }
         return selectedPart;
      }

      ps.integrate = $.noop;

      ps.integratev2 = function(opts) {
         $.extend({
            bind: null,
            to: null,
            dest: null,

            addClass: null,
         }, opts);

         if (opts.bind==null) return null;

         var selectedPart = ps.partsRepo.find(opts.bind);

         if (selectedPart.length!=0 && selectedPart.children().length>0) {
            selectedPart = selectedPart.clone();
            if (opts.addClass != "") selectedPart.toggleClass(opts.addClass);
            //selectedPart = selectedPart.children().first().clone();
            //selectedPart.find("*").andSelf().each(function() {
            selectedPart.find("*").each(function() {
               var elem = this;
               if (typeof $(elem).attr("data-js-name")!="undefined") opts.to[$(elem).attr("data-js-name")] = $(elem);
               if (typeof $(elem).attr("data-js-events")!="undefined") ps.setupEvents.apply(opts.to, [$(elem)]);
            });
         }

         var ret = selectedPart.children();

         if (ret[0]==undefined) console.warn("Tried to integrate, but there was no result.");

         if (opts.inside!==null) ret.appendTo(opts.inside);

         if (opts.as!=="null") opts.to[opts.as] = ret;

         return ret;
      }

      ps.integratev1 = function(selector, addClass = "") {
         var owner = this;
         var selectedPart = ps.partsRepo.find(selector);

         if (selectedPart.length!=0 && selectedPart.children().length>0) {
            selectedPart = selectedPart.clone();
            if (addClass != "") selectedPart.toggleClass(addClass);
            //selectedPart = selectedPart.children().first().clone();
            //selectedPart.find("*").andSelf().each(function() {
            selectedPart.find("*").each(function() {
               if (typeof $(this).attr("data-js-name")!="undefined") owner[$(this).attr("data-js-name")] = $(this);
               if (typeof $(this).attr("data-js-events")!="undefined") ps.setupEvents.apply(owner, [$(this)]);
            });
         }

         var ret = selectedPart.children();

         if (ret[0]==undefined) console.warn("Tried to integrate, but there was no result.");

         return ret;
      }

      ps.map = function(element) {
         // todo
      }

      ps.construct();
      return this;
   }
   sys.base.phpCaller = function(opts) {
      var php = this;

      $.extend(this, {
         url: undefined,
         dataType: "json",
         type: "post",
      }, opts);

      php.construct = function() {
      }

      php.go = function(opts) {
         opts = $.extend({
            url: php.url,
            dataType: php.dataType,
            type: php.type,
            success: $.noop,
            error: function(data) {console.log(data.responseText)}
         }, opts);

         opts.data = JSON.stringify(opts.data);

         php.XHR = $.ajax(opts);

         return php.XHR;
      }

      php.construct();
      return php;
   }



   sys.construct();
   return this;
};

