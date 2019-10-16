var stompClient = null;

var cardEvent = {
    successCode: "36864",
    cardSelected: "36865",
    cardRemoved: "14000"
};

var errorCodes = {
    "36864": "Executed successfully!",
    "36865": "A card inserted !",
    "14000": "The card has been removed",
    "15000": "Card Internal error",
    "25344": "Invalid PIN Code",
    "25345": "Authentication with PIN Code is required!",
    "27010": "The card is locked!"
};

var CardState = function () {
    this.inserted = 0;
    this.authenticated = 0;
    this.locked = 0;
    this.pinRemain = 3;
    this.storageKey = "osiris_data";

    this.save = function () {
        var data = {
            inserted: this.inserted,
            authenticated: this.authenticated,
            locked: this.locked,
            pinRemain: this.pinRemain
        };

        localStorage.setItem(this.storageKey, JSON.stringify(data));
    };

    this.reset = function () {
        var data = {
            inserted: 0,
            authenticated: 0,
            locked: 0,
            pinRemain: 3
        };

        localStorage.setItem(this.storageKey, JSON.stringify(data));
        this.init();
    };

    this.init = function () {
        var storageData = localStorage.getItem(this.storageKey);
        if (storageData === null) {
            this.save();
        } else {
            var parsed = JSON.parse(storageData);
            this.inserted = parsed.inserted;
            this.authenticated = parsed.authenticated;
            this.locked = parsed.locked;
            this.pinRemain = parsed.pinRemain;
        }
    }
};

var cardState = new CardState();

var getBody = function (data) {
    var body = JSON.parse(data.body);
    console.log('Body => ', body);

    return body.message;
};

var connect = function() {
    var socket = new SockJS('/osiris');
    stompClient = Stomp.over(socket);

    stompClient.connect({}, function (frame) {
        console.log('Connected: ' + frame);

        stompClient.subscribe('/topic/cardInserted', function (data) {
            var message = getBody(data);
            if (message === cardEvent.cardSelected) {
                cardState.inserted = 1;
                cardState.save();
                updateCardState(cardState);

                // TODO add Toast
            } else {
                console.error("Card inserted but failed to connect to it!");
            }
        });

        stompClient.subscribe('/topic/cardRemoved', function (data) {
            var message = getBody(data);
            if (message === cardEvent.cardRemoved) {
                cardState.reset();
                updateCardState(cardState);

                // TODO add Toast
            } else {
                console.error("Card inserted but failed to connect to it!");
            }
        });
    });
};

var disconnect = function() {
    if (stompClient !== null) {
        stompClient.disconnect();
    }
};

/*function sendName() {
    stompClient.send("/app/hello", {}, JSON.stringify({ code: "test", message: "test" }));
}*/

var updateCardItem = function (element, value) {
    var badgeSuccess = "badge-success",
        badgeError = "badge-danger",
        iconSuccess = "fa-check",
        iconError = "fa-times";

    if (value === 1) {
        element.removeClass(badgeError).addClass(badgeSuccess);
        element.children("i").eq(0).removeClass(iconError).addClass(iconSuccess);
    } else {
        element.removeClass(badgeSuccess).addClass(badgeError);
        element.children("i").eq(0).removeClass(iconSuccess).addClass(iconError);
    }
};

var updateCardState = function(cardState) {
    var cardInserted = $("#sd-inserted"),
        cardLocked = $("#sd-locked"),
        cardAuthenticated = $("#sd-auth"),
        cardPinRemain = $("#sd-pin-remain");

    updateCardItem(cardInserted, cardState.inserted);
    updateCardItem(cardLocked, cardState.locked);
    updateCardItem(cardAuthenticated, cardState.authenticated);
    cardPinRemain.text(cardState.pinRemain);
};

$(function () {
    cardState.init();

    updateCardState(cardState);

    connect();
});