(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.loglevelServerSend = factory());
}(this, (function () { 'use strict';

    /**
     * @description
     * Extend loglevel with new plugin which will send log information to the log-sever
     *
     * @param {object} logger loglevel instance to be extended
     * @param {object} options
     * @param {string} [options.url='http://localhost:8000/main/log'] Server url which would be used as a log server
     * @param {string|Function} [options.prefix=null] Prefix for all log messages. Either string or function wich should return string and accept log severity and message as parameters
     * @param {Bool} [options.callOriginal=false] If set to true - original loglevel method for logging would be called
     * @example
     * loglevelServerSend(log,{url:'https://example.com/app/log',prefix: function(logSev,message) {
     *     return '[' + new Date().toISOString() + '] ' + logSev + ': ' + message + '\n'   
     * }})
     */
    var loglevelServerSend = function(logger,options) {
        if (!logger || !logger.methodFactory)
            throw new Error('loglevel instance has to be specified in order to be extended')
        
        var _logger          = logger, 
            _url             = options && options.url || 'http://localhost:8000/main/log',
            _callOriginal    = options && options.callOriginal || false,
            _prefix          = options && options.prefix,
            _headers         = options && options.headers || {'Content-Type': 'text/plain'},
            _originalFactory = _logger.methodFactory,
            _sendQueue       = [],
            _isSending       = false;
        
        _logger.methodFactory = function (methodName, logLevel) {
            var rawMethod = _originalFactory(methodName, logLevel);
        
            return function (message) {
                if (typeof _prefix === 'string')
                    message = _prefix + message;
                else if (typeof _prefix === 'function')
                    message = _prefix(methodName,message);
                else
                    message = methodName + ': ' + message;
                            
                if (_callOriginal) 
                    rawMethod(message);
                
                _sendQueue.push(message);
                _sendNextMessage();
            }
        };
        _logger.setLevel(_logger.levels.WARN);
        
        var _sendNextMessage = function(){
            if (!_sendQueue.length || _isSending)
                return
            
            _isSending = true;
            
            var msg = _sendQueue.shift(),
                req = new XMLHttpRequest();
            
            req.open("POST", _url, true);
            if (_headers) {
                var entries = Object.entries(_headers);

                entries.map(header => req.setRequestHeader(header[0], header[1]));
            }
            req.onreadystatechange = function() {
                if(req.readyState == 4) 
                {
                    _isSending = false;
                    setTimeout(_sendNextMessage, 0);
                }
            };
            req.send(msg);
        };
    };

    return loglevelServerSend;

})));
