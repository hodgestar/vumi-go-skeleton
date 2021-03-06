var fs = require("fs");
var assert = require("assert");
var vumigo = require("vumigo_v01");
// CHANGE THIS to your-app-name
var app = require("../lib/vumi-go-skeleton");

// This just checks that you hooked you InteractionMachine
// up to the api correctly and called im.attach();
describe("test_api", function() {
    it("should exist", function() {
        assert.ok(app.api);
    });
    it("should have an on_inbound_message method", function() {
        assert.ok(app.api.on_inbound_message);
    });
    it("should have an on_inbound_event method", function() {
        assert.ok(app.api.on_inbound_event);
    });
});

// YOUR TESTS START HERE
// CHANGE THIS to test_your_app_name
describe("test_vumi_go_skeleton", function() {

    // These are used to mock API reponses
    // EXAMPLE: Response from google maps API
    var fixtures = [
       'test/fixtures/example-geolocation.json'
    ];

    var tester = new vumigo.test_utils.ImTester(app.api, {
        setup: function (api) {
            api.config_store.config = JSON.stringify({});
            fixtures.forEach(function (f) {
                api.load_http_fixture(f);
            })
        }
    });

    // first test should always start 'null, null' because we haven't
    // started interacting yet
    it("first screen should ask us to say something ", function () {
        tester.check_state({
            user: null,
            content: null,
            next_state: "first_state",
            response: "^Say something please"
        });
    });

    it("second screen should ask if we want to know what we said", function () {
        var user = {
            current_state: 'first_state'
        };
        tester.check_state({
            user: user,
            content: "Hello world!",
            next_state: "second_state",
            response: (
                "^Thank you! Do you what to know what you said\\?[^]" +
                "1. Yes[^]"+
                "2. No$"
            )
        });
    });

    it("Declined to know what we said so say goodbye", function () {
        var user = {
            current_state: 'second_state',
            answers: {
                first_state: 'Hello world!'
            }
        };
        tester.check_state({
            user: user,
            content: "2",
            next_state: "end_state",
            response: "^Thank you and bye bye!$",
            continue_session: false
        });
    });

    it("Agreed to know what we said so show us", function () {
        var user = {
            current_state: 'second_state',
            answers: {
                first_state: 'Hello world!'
            }
        };
        tester.check_state({
            user: user,
            content: "1",
            next_state: "third_state",
            response: (
                "^We think you said 'Hello world!'. Correct\\?[^]" +
                "1. Yes[^]"+
                "2. No$"
            )
        });
    });

    it("Say we got it write and say goodbye", function () {
        var user = {
            current_state: 'third_state',
            answers: {
                first_state: 'Hello world!',
                second_state: 'third_state'
            }
        };
        tester.check_state({
            user: user,
            content: "1",
            next_state: "end_state_correct",
            response: "^Aren't we clever\\? Thank you and bye bye!$",
            continue_session: false
        });
    });

    it("Say we got it wrong and say goodbye", function () {
        var user = {
            current_state: 'third_state',
            answers: {
                first_state: 'Hello world!',
                second_state: 'third_state'
            }
        };
        tester.check_state({
            user: user,
            content: "2",
            next_state: "end_state_wrong",
            response: "^Silly us! Thank you and bye bye!$",
            continue_session: false
        });
    });


    // This is an example of a test that we don't want to run at the moment
    // so we add .skip
    it.skip('should go to end when asked for them to say someting', function() {
        check_state({current_state: 'state_we_have_not_made'}, 'Hello world!',
            'end_state', '^Thank you and bye bye!');
    });

});