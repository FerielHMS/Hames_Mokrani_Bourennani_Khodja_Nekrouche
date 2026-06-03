(function() {
    var originalError = console.error;
    console.error = function() {
        var args = Array.from(arguments);
        var message = args.join(' ');
        if (message && (
            message.includes('The message port closed') ||
            message.includes('runtime.lastError') ||
            message.includes('chrome-extension') ||
            message.includes('NOTEBOOKS LOCAL') ||
            message.includes('CHROME MESSENGER') ||
            message.includes('vn-button') ||
            message.includes('chromewebdata')
        )) {
            return;
        }
        originalError.apply(console, arguments);
    };
})();