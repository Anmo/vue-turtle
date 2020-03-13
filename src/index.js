import { convertValue, convertArg, wrapper } from "./utils";

export default {
  install(Vue, { modifier = "debounce", wait = 400, listenTo } = {}) {
    const listOfListenners = convertValue(listenTo);

    const mappingEvents = new Map();
    const $on = Vue.prototype.$on;

    Vue.prototype.$on = function(event, handler) {
      let events = mappingEvents.get(this);
      if (!events) {
        mappingEvents.set(this, (events = {}));
      }

      events[event] = {
        handler
      };

      $on.call(this, event, handler);
    };

    Vue.directive("turtle", {
      bind(
        _,
        { value, arg = convertArg(wait), modifiers: { debounce, throttle } },
        { componentInstance: self }
      ) {
        const selectedEvents = convertValue(value) || listOfListenners;
        const wait = convertArg(arg);

        const events = mappingEvents.get(self);

        for (const event in events) {
          if (
            !Object.prototype.hasOwnProperty.call(events, event) ||
            (selectedEvents && !selectedEvents.includes(event))
          ) {
            continue;
          }

          const obj = events[event];

          obj.wrapper = wrapper(
            obj.handler,
            wait,
            modifier === "throttle" ? !debounce : throttle
          );

          self.$off(event, obj.handler);
          $on.call(self, event, obj.wrapper);
        }
      },
      unbind(_, __, { componentInstance: self }) {
        const events = mappingEvents.get(self);

        for (const event in events) {
          if (
            !Object.prototype.hasOwnProperty.call(events, event) ||
            !events[event].wrapper
          ) {
            continue;
          }

          events[event].wrapper.cancel();
        }
      }
    });
  }
};
