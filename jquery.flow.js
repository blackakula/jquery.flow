jQuery.fn.flow = function(options) {
  //check if timer plugin included
  if (typeof jQuery.fn.everyTime != 'function') return

  var flowObject = this
  
  var settings = jQuery.extend({
    template: {},
    start: 0,
    delay: '1s',
    minItems: 2,
    times: 0,
    updates: {},
    reverse: false
  }, options)

  //performing and checking 'updates'
  if (typeof settings.updates == 'string' &&
      jQuery.flow.isUrl(settings.updates))
        settings.updates = {url: settings.updates, dataType: 'json'}
  if (typeof settings.updates != 'object' &&
      typeof settings.updates != 'function')
        return

  var initialized = false

  //performing and checking template
  switch (typeof settings.template) {
    case 'string':
      if (jQuery.flow.isUrl(settings.template))
        settings.template = {url: settings.template}
      else {
        initialized = true
        break
      }
    case 'object':
      jQuery.ajax(jQuery.extend(settings.template, {success: function(result) {
          settings.template = result
          flowObject.each(function(i,e) { e.flow = jQuery.extend(e.flow, {initialized: true}) })
      }}))
      break
    case 'function':
      initialized = true
      break
    default: return
  }

  //additional functions for multi-control
  if (typeof jQuery.fn.flow.stop != 'function')
    jQuery.fn.flow.stop = function() {
      flowObject.each(function(elementIndex, element) {
        if (typeof element.flow != 'undefined' &&
          typeof element.flow.stop == 'function') element.flow.stop()
      })
    }

  if (typeof jQuery.fn.flow.resume != 'function')
    jQuery.fn.flow.resume = function() {
      flowObject.each(function(elementIndex, element) {
        if (typeof element.flow != 'undefined' &&
          typeof element.flow.resume == 'function') element.flow.resume()
      })
    }

  if (typeof jQuery.fn.flow.toggle != 'function')
    jQuery.fn.flow.toggle = function() {
      flowObject.each(function(elementIndex, element) {
        if (typeof element.flow == 'object' &&
          typeof element.flow.toggle == 'function') element.flow.toggle()
      })
    }

  //each element setting data and functions
  this.each(function(elementIndex, element) {
    element.flow = jQuery.extend(element.flow, {
      settings: settings,
      flowing: false,
      queue: []
    })
    if (typeof element.flow.settings.numItems == 'undefined')
      element.flow.settings.numItems = jQuery(element).children().length
    if (element.flow.settings.numItems < 0)
      element.flow.settings.numItems = 0

    if (!element.flow.initialized) element.flow.initialized = initialized

    element.flow.action = function() {
      if (!element.flow.initialized) return
      if (typeof element.flow.settings.template != 'string' &&
        typeof element.flow.settings.template != 'function') return

      //checking and updating queue with new results
      if (element.flow.queue.length <= element.flow.settings.minItems) {
        switch (typeof element.flow.settings.updates) {
          case 'object':
            jQuery.ajax(jQuery.extend(element.flow.settings.updates, {success: function(result) {
                jQuery.flow.update(element, result)
            }}))
            break
          case 'function':
            var updates = element.flow.settings.updates.call(element)
            if (typeof updates == 'object')
              jQuery.flow.update(element, updates)
            break
          default: return
        }
      }

      //performing action
      if (element.flow.queue.length > 0) {
        var nextElement = element.flow.queue.shift()
        var newElement = false

        //creating new element
        if (typeof element.flow.settings.template == 'function')
          newElement = element.flow.settings.template.call(element, nextElement)
        else if (typeof element.flow.settings.template == 'string') {
          newElement = element.flow.settings.template
          for (var k in nextElement)
            newElement = newElement.replace('#{' + k + '}', nextElement[k])
        }

        //inserting new element
        if (newElement) {
          var children = jQuery(element).children()
          var index = -1

          if (element.flow.settings.reverse) {
            index = children.length - 1 - element.flow.settings.start
            if (children[index]) {
              jQuery(newElement).insertAfter(children[index])
              index += 1
            } else {
              jQuery(element).prepend(newElement)
              index = 0
            }
          } else {
            index = element.flow.settings.start
            if (children[index]) {
              jQuery(newElement).insertBefore(children[index])
            } else {
              jQuery(element).append(newElement)
              index = children.length
            }
          }

          if (index != -1) {
            jQuery(element).children()[index].flowObject = nextElement

            //animate object if created
            if (typeof element.flow.settings.appearEffect == 'object') {
              jQuery(jQuery(element).children()[index]).animate(
                element.flow.settings.appearEffect[0],
                0
              )
              jQuery(jQuery(element).children()[index]).hide()
              jQuery(jQuery(element).children()[index]).animate(
                  element.flow.settings.appearEffect[0],
                  element.flow.settings.appearEffect[1],
                  element.flow.settings.appearEffect[2],
                  element.flow.settings.appearEffect[3]
              )
            }
          }
        }
      }

      //removing old element(s)
      if (element.flow.settings.numItems != 0 &&
            jQuery(element).children().length > element.flow.settings.numItems) {
        var index = element.flow.settings.reverse ?
              (jQuery(element).children().length - element.flow.settings.numItems - 1) :
              element.flow.settings.numItems
        while (index >= 0 && index < jQuery(element).children().length) {
          //animate removing object
          if (typeof element.flow.settings.disappearEffect == 'object')
            jQuery(jQuery(element).children()[index]).animate(
                element.flow.settings.disappearEffect[0],
                element.flow.settings.disappearEffect[1],
                element.flow.settings.disappearEffect[2],
                function() {
                  if (typeof element.flow.settings.disappearEffect[3] == 'function')
                    element.flow.settings.disappearEffect[3].call(this)
                  jQuery(this).remove()
                }
            )
          else jQuery(jQuery(element).children()[index]).remove()

          index += element.flow.settings.reverse ? -1 : 1
        }
      }

      //performing callback
      if (typeof element.flow.settings.callback == 'function') {
        jQuery(element).children().each(function(itemIndex, itemElement) {
          element.flow.settings.callback.call(itemElement, itemIndex, itemElement.flowObject)
        })
      }
    }

    element.flow.resume = function() {
      if (this.flowing) return
      this.flowing = true

      jQuery(element).everyTime(
        this.settings.delay,
        element,
        this.action,
        this.settings.times
      )
    }

    element.flow.stop = function() {
      if (!this.flowing) return
      this.flowing = false

      jQuery(element).stopTime(element)
    }

    element.flow.toggle = function() {
      if (this.flowing) this.stop()
      else this.resume()
    }

    //filling existing items with flow objects
    jQuery(element).children().each(function(i,e) {
      if (typeof e.flowObject == 'object') return

      var flowObject = {}
      if (typeof element.flow.settings.flowObject == 'function')
        flowObject = element.flow.settings.flowObject(i,e)
      if (typeof flowObject != 'object') flowObject = {}
      flowObject.flowTimestamp = new Date().getTime()

      e.flowObject = flowObject
    })
  })
  
  this.flow.resume()
}

jQuery.extend({
  flow: {
    isUrl: function(str) { return /^[^\r\n<>]{1,100}$/.test(str) },
    update: function(element, result) {
      if (typeof result != 'object') return
      //checking and adding new elements to queue
      for (var i in result) {
        //checking if result is correct
        if (typeof result[i] != 'object') continue

        var exists = false
        for (var j in element.flow.queue) {
          //next if such element exists
          if (typeof result[i]._ != 'undefined' &&
              typeof element.flow.queue[j]._ != 'undefined' &&
              result[i]._ == element.flow.queue[j]._) {
                exists = true
                break
              }
        }
        if (exists) continue

        result[i].flowTimestamp = new Date().getTime()
        element.flow.queue.push(result[i])
      }
    }
  }
})