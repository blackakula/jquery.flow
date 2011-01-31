<html>
  <head>
    <title>Test jQuery.flow.js</title>
    <script type="text/javascript" src="jquery.min.js"></script>
    <script type="text/javascript" src="jquery.timers-1.2.min.js"></script>
    <script type="text/javascript" src="jquery.flow.min.js"></script>
  </head>
  <body>
    <div id="main">
<div class="item">
  <div class="title">1</div>
  <div class="time">time: <span class="ago">0</span> seconds ago</div>
</div><div class="item">
  <div class="title">2</div>
  <div class="time">time: <span class="ago">0</span> seconds ago</div>
</div><div class="item">
  <div class="title">3</div>
  <div class="time">time: <span class="ago">0</span> seconds ago</div>
</div>
    </div> <a href="#" onclick="$('#main').flow.toggle(); return false">click</a>
    <script type="text/javascript">
      $('#main').flow({
        template: 'template.html',
        
        //you can use it like jQuery.ajax function
//        template: {
//          url: 'template.html',
//          type: 'GET'
//        },
//        
//        template: function(e) {
//          return $('<div/>', {'class': 'item'}).
//            append($('<div/>',{'class': 'title', text: e.title})).
//            append($('<div/>',{'class': 'time', html: 'time: <span class="ago">0</span> seconds ago'}))
//        },
//
//        template: function(e) { return '<div class="item"><div class="title">' + e.title + '</div><div class="time">time: <span class="ago">0</span> seconds ago</div></div>' },

        delay: '1s',
        updates: 'flow.php',
        //you can use it like jQuery.ajax function
//        updates: {
//          url: 'flow.php',
//          type: 'POST',
//          dataType: 'json'
//        },
//
//        updates: function () {
//          var results = [{
//            title: 'asdf ' + parseInt(Math.random() * 100),
//            '_': parseInt(Math.random() * 1000) + '_' + parseInt(Math.random() * 1000),
//            timestamp: new Date().getTime() / 1000
//          },{
//            title: 'asdf ' + parseInt(Math.random() * 100),
//            '_': parseInt(Math.random() * 1000) + '_' + parseInt(Math.random() * 1000),
//            timestamp: new Date().getTime() / 1000
//          }]
//          jQuery.flow.update(this, results)
//          return false
//          //or you can simply return results
//        },

        numItems: 5,
        appearEffect: [{height: ['toggle', 'linear']}, 600],
        disappearEffect: [{height: ['toggle', 'swing']}, 600],
        callback: function(i,e) {
          $(this).find('.time .ago').
            text(parseInt(((new Date().getTime()) - e.flowTimestamp) / 1000))
        }
//        , start: 3
//        , reverse: true
      })
    </script>
  </body>
</html>
