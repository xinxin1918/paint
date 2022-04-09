var log = function() {
console.log.apply(console, arguments)
};

var e = function(selector, parent) {
    if (parent === undefined) {
        parent = document
    }
    return parent.querySelector(selector)
};

var es = function(selector, parent) {
    if (parent === undefined) {
        parent = document
    }
    return parent.querySelectorAll(selector)
};

function appendHtml(element, html) {
    element.insertAdjacentHTML('beforeend', html)
}

function bindEvent(element, event, callback) {
    element.addEventListener(event, callback)
}

function bindEvents(elements, event, callback) {
    for (var element of elements) {
        element.addEventListener(event, callback)
    }
}

function toggleClass(element, className) {
        if (element.classList.contains(className)) {
            element.classList.remove(className)
        } else {
            element.classList.add(className)
        }
}

function removeAllClass(elements, className) {
    for (var element of elements) {
        element.classList.remove(className)
    }
}
