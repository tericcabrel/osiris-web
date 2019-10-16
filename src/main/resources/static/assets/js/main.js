var stompClient = null;

var cardEvent = {
    successCode: "36864",
    cardSelected: "36865",
    cardRemoved: "14000"
};

var messageCodes = {
    "36864": "Executed successfully!",
    "36865": "A card inserted !",
    "14000": "The card has been removed",
    "15000": "Card Internal error",
    "25344": "Invalid PIN Code",
    "25345": "Authentication with PIN Code is required!",
    "27010": "The card is locked!"
};

var toastifyOptions = {
    text: "",
    duration: 5000,
    newWindow: true,
    close: true,
    className: "osiris-toast",
    gravity: "top", // `top` or `bottom`
    position: 'center', // `left`, `center` or `right`
    // backgroundColor: "linear-gradient(to right, #00b09b, #96c93d)",
    stopOnFocus: true, // Prevents dismissing of toast on hover
    onClick: function(){} // Callback after click
};

var element = {
    pinModal: {
        id: $("#pin-modal"),
        input: $("#input-pin"),
        btnPin: $("#btn-send-pin")
    },
    userModal: {
        id: $("#user-modal"),
        btnReset: $("#btn-reset"),
        btnUnblock: $("#btn-unblock")
    }
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

var showToast = function (message, logInConsole) {
    if (logInConsole !== undefined) {
        console.log(message);
    }

    toastifyOptions.text = message;
    Toastify(toastifyOptions).showToast();
};

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

                showToast(messageCodes[message]);
            } else {
                showToast("Card inserted but failed to connect to it!", true);
            }
        });

        stompClient.subscribe('/topic/cardRemoved', function (data) {
            var message = getBody(data);
            if (message === cardEvent.cardRemoved) {
                cardState.reset();
                updateCardState(cardState);

                showToast(messageCodes[message]);
            } else {
                showToast("Card inserted but failed to connect to it!", true);
            }
        });

        stompClient.subscribe('/topic/pinAuth', function (data) {
            var message = getBody(data);
            if (message === cardEvent.successCode) {
                cardState.authenticated = 1;
                cardState.save();
                updateCardState(cardState);

                showToast("Success: Valid PIN Code");
                element.pinModal.id.modal('hide');
                element.pinModal.input.val('');
            } else {
                cardState.pinRemain--;

                if (cardState.pinRemain <= 0) {
                    showToast("The card is locked!", true);
                    cardState.authenticated = 0;
                    cardState.locked = 1;
                } else {
                    showToast(messageCodes[message] + ": Attempt remaining = " + cardState.pinRemain, true);
                }
                cardState.save();
                updateCardState(cardState);
            }
        });

        stompClient.subscribe('/topic/cardUnblock', function (data) {
            var message = getBody(data);
            if (message === cardEvent.successCode) {
                cardState.locked = 0;
                cardState.pinRemain = 3;
                cardState.authenticated = 0;
                cardState.save();
                updateCardState(cardState);

                showToast("The card has been unblocked successfully!");
                element.userModal.id.modal('hide');
            } else {
                showToast("An error occurred ! Try again later");
            }
        });

        stompClient.subscribe('/topic/cardSetData', function (data) {
            var message = getBody(data);
            if (message === cardEvent.successCode) {
                showToast("Data saved successfully in the card!");
            } else {
                showToast("An error occurred ! Try again later");
            }
        });
    });
};

var disconnect = function() {
    if (stompClient !== null) {
        stompClient.disconnect();
    }
};

$(function () {
    cardState.init();

    updateCardState(cardState);

    connect();

    element.pinModal.btnPin.click(function (e) {
        e.preventDefault();

        if (cardState.pinRemain === 0) {
            showToast("The card is locked !");
            return;
        }

        var pinCode = element.pinModal.input.val();
        if (pinCode.length !== 6) {
            return;
        }

        stompClient.send("/app/pinAuthentication", {}, JSON.stringify({ code: "pin", message: pinCode }));
    });

    element.userModal.btnUnblock.click(function (e) {
        e.preventDefault();

        bootbox.confirm({
            title: "Card Unblock",
            message: "Are you sure you want to unblock the card?",
            callback: function (result) {
                if (result) {
                    stompClient.send("/app/cardUnblock", {}, JSON.stringify({ code: "unblock", message: "unblock" }));
                }
            }
        });
    });
});