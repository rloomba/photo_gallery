;(function(global) {
    var services = {

        'facebook': 'http://www.facebook.com/sharer.php?t={{title}}&u={{url}}',
        'twitter': 'https://twitter.com/intent/tweet?text={{title}}&url={{url}}'
    };

    function parser(serviceId, option) {
        var service = services[serviceId];

        option || (option = {});

        // Should specify serviceId
        if (!serviceId) {
            throw new Error('Should specify serviceId');
        }

        // ServiceId should exist
        if (!service) {
            throw new Error('"' + serviceId + '" do not exist');
        }

        // replace template
        return service.replace(/{{(.*?)}}/g, function(a, m) {
            return option[m] ?
                encodeURIComponent(option[m]) : '';
        });
    }

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = parser;
    }

    if (global.Share) {
        global.Share.parser = parser;
    }
})(this);
