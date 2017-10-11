
if (typeof addons == "undefined") addons = {};

addons.timers = new function() {
   var ts = this;

   ts.allTimers = [];

   ts.getTimerByName = function(name) {
      return ts.allTimers.filter(function(t) {return t.name==name});
   }

   ts.getTimerByClass = function(className) {
      return ts.allTimers.filter(function(t) {return t.class.indexOf(className)>-1});
   }

   ts.removeTimer = function(timer) {
      ts.allTimers = ts.allTimers.filter(function(t) {
         t.die();
         return !(t==timer);
      });
   }

   ts.addTimer = function(opts) {
      var newTimer = new ts.timer(opts);
      ts.allTimers.push(newTimer);
      return newTimer;
   }

   ts.addTimeout = function(opts) {
      var newTimeout = new ts.timeout(opts);
      ts.allTimers.push(newTimeout);
      return newTimeout;
   }


   // children
   ts.timer = function(opts) {
      var t = this;

      $.extend(this, {
         interval: 1000,
         onInterval: $.noop,
         onStart: $.noop,
         onStop: $.noop,
         enabled: true,
         className: "",
         name: utils.getRandomString(16)
      }, opts);

      t.timerID = -1;

      t.construct = function() {
         t.initializeTimer();
      }

      t.initializeTimer = function() {
         if (t.timerID != -1) window.clearInterval(t.timerID);
         t.timerID = window.setInterval(t.onTick, t.interval);
      }

      t.start = function() {
         if (t.enabled==true) return false;

         t.enabled = true;
         t.onStart();
      }

      t.reset = function() {
         t.initializeTimer();
      }

      t.stop = function() {
         if (t.enabled==false) return false;

         t.enabled = false;
         t.onStop();
      }

      t.end = function() {
         t.onStop();
         t.die();
      }

      t.die = function() {
         window.clearInterval(t.timerID);
         ts.removeTimer(t);
      }

      t.onTick = function() {
         if (t.enabled==true) t.onInterval();
      }

      t.construct();
      return this;

   }

   ts.timeout = function(opts) {
      var to = this;

      $.extend(this, {
         onTimeout: $.noop,
         time: 1000,
         enabled: true,
         repeat: false,
         className: "",
         name: utils.getRandomString(16)
      }, opts);

      to.timerID = -1;
      to.active = false;

      to.construct = function() {
         if (to.enabled==true) to.start();
      }

      // events
      to.onInterval = function() {
         // if the timer was disabled, bail
         if (to.enabled==false) {
            to.abort();
            return;
         }

         // fire the event and go into inactive
         to.onTimeout();
         to.active = false;
         to.timerID = -1;

         // restart if needed
         if (to.repeat==true) to.restart();
      }

      to.start = function() {
         if (to.active==true) window.clearTimeout(to.timerID);

         to.timerID = window.setTimeout(to.onInterval, to.time)
      }

      to.restart  = function() {
         to.start();
      }

      // stops the timeout and does not trigger the event
      to.abort = function() {
         window.clearTimeout(to.timerID);
         to.timerID = -1;
         to.active = false;
      }
      t.die = function() {
         t.abort();
         ts.removeTimer(to);
      }

      to.construct();
      return this;

   }

   return ts;
};

