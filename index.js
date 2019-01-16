'use strict';
// Messenger API integration example
// We assume you have:
// * a Wit.ai bot setup (https://wit.ai/docs/quickstart)
// * a Messenger Platform setup (https://developers.facebook.com/docs/messenger-platform/quickstart)
// You need to `npm install` the following dependencies: body-parser, express, request.
//
// 1. npm install body-parser express request
// 2. Download and install ngrok from https://ngrok.com/download
// 3. ./ngrok http 8445
// 4. WIT_TOKEN=your_access_token FB_APP_SECRET=your_app_secret FB_PAGE_TOKEN=your_page_token node examples/messenger.js
// 5. Subscribe your page to the Webhooks using verify_token and `https://<your_ngrok_io>/webhook` as callback URL.
// 6. Talk to your bot on Messenger!
const bodyParser = require('body-parser');
const crypto = require('crypto');
const express = require('express');
const fetch = require('node-fetch');
const request = require('request');
const http = require('http');
const JSONP = require('node-jsonp');
let Wit = null;
let log = null;
let messageData = {};
try {
    // if running from repo
    Wit = require('../').Wit;
    log = require('../').log;
}
catch (e) {
    Wit = require('node-wit').Wit;
    log = require('node-wit').log;
}
// Webserver parameter
const PORT = process.env.PORT || 8445;
// Wit.ai parameters
const WIT_TOKEN = 'I44WXQ2I3OKM3KUS55AUCCTX63H2KA6N';
// Messenger API parameters
const FB_PAGE_TOKEN = "EAARYU0ZACjXcBAAcBNFhHPqHkHOGo1UwZAI12g2rZCggDTQNvwZA8qNwibbLnY465cCZAlBGiRoDlow6ZCp0dXWcSCokvd64NSLOLvCCBDZAPivHfUOvf5ZBxJvRh3MirL0W6OKZBMGTKq5OX5g8sFke3wO6aUrdgLUhe6oijfl7RawZDZD";
if (!FB_PAGE_TOKEN) {
    throw new Error('missing FB_PAGE_TOKEN')
}
const FB_APP_SECRET = 'eacc47677c96151d169f339b83fc8c5d';
if (!FB_APP_SECRET) {
    throw new Error('missing FB_APP_SECRET')
}
let FB_VERIFY_TOKEN = null;
crypto.randomBytes(8, (err, buff) => {
    if (err) throw err;
    FB_VERIFY_TOKEN = buff.toString('hex');
    console.log(`/webhook will accept the Verify Token "${FB_VERIFY_TOKEN}"`);
});

function receivedPostback(event) {
    var senderID = event.sender.id;
    var recipientID = event.recipient.id;
    var timeOfPostback = event.timestamp;
    // The 'payload' param is a developer-defined field which is set in a postback
    // button for Structured Messages.
    var payload = event.postback.payload;
    console.log("Received postback for user %d and page %d with payload '%s' " + "at %d", senderID, recipientID, payload, timeOfPostback);
    // When a postback is called, we'll send a message back to the sender to
    // let them know it was successful
    //fbMessage(senderID, "your order has been received, you can use order#12345 to track your order. we will send you the receipt soon.");
    console.log(event);
    sendReceipt(senderID, payload);
}

function sendReceipt(sender, payload) {
    messageData = {
        "attachment": {
            "type": "template"
            , "payload": {
                "template_type": "receipt"
                , "recipient_name": "Stephane Crozatier"
                , "order_number": "12345"
                , "currency": "USD"
                , "payment_method": "Visa 2345"
                , "elements": [

                    /*
                    {
                        "title": "Dallas Spa"
                        , "image_url": "https://firebasestorage.googleapis.com/v0/b/ptstar-cfcbc.appspot.com/o/images%2Fspa.png?alt=media&token=ad4ad5f8-01f5-4c58-ba6d-0917f7b3dfa1"
                        , "subtitle": "20% off"
                        , "quantity": 1
                        , "price": 50
                        , "currency": "USD"
                }*/
            ]
                , "address": {
                    "street_1": "1 Hacker Way"
                    , "street_2": ""
                    , "city": "Menlo Park"
                    , "postal_code": "94025"
                    , "state": "CA"
                    , "country": "US"
                }
                , "summary": {
                    "subtotal": 75.00
                    , "shipping_cost": 4.95
                    , "total_tax": 6.19
                    , "total_cost": 56.14
                }
                , "adjustments": [
                    {
                        "name": "New Customer Discount"
                        , "amount": 20
          }
                    , {
                        "name": "$10 Off Coupon"
                        , "amount": 10
          }
        ]
            }
        }
    }
    if (payload == 1) {
        messageData.attachment.payload.elements.push({
            "title": "Dallas Spa"
            , "image_url": "https://firebasestorage.googleapis.com/v0/b/ptstar-cfcbc.appspot.com/o/images%2Fspa.png?alt=media&token=ad4ad5f8-01f5-4c58-ba6d-0917f7b3dfa1"
            , "subtitle": "20% off"
            , "quantity": 1
            , "price": 50
            , "currency": "USD"
        });
    }
    else if (payload == 2) {
        messageData.attachment.payload.elements.push({
            "title": "Dallas Bar"
            , "image_url": "https://firebasestorage.googleapis.com/v0/b/ptstar-cfcbc.appspot.com/o/images%2Fbar.png?alt=media&token=d4b0fea9-49d8-4553-8152-a8b3096ff8c2"
            , "subtitle": "50% offer"
            , "quantity": 1
            , "price": 20
            , "currency": "USD"
        });
    }
    else if (payload == 3) {
        messageData.attachment.payload.elements.push({
            "title": "Irving Our Place(Indian food)"
            , "image_url": "https://firebasestorage.googleapis.com/v0/b/ptstar-cfcbc.appspot.com/o/images%2Fbar.png?alt=media&token=d4b0fea9-49d8-4553-8152-a8b3096ff8c2"
            , "subtitle": "15% discout"
            , "quantity": 1
            , "price": 70
            , "currency": "USD"
        });
    }
    else if (payload == 4) {
        messageData.attachment.payload.elements.push({
            "title": "Irving Super Market"
            , "image_url": "https://firebasestorage.googleapis.com/v0/b/ptstar-cfcbc.appspot.com/o/images%2Fbar.png?alt=media&token=d4b0fea9-49d8-4553-8152-a8b3096ff8c2"
            , "subtitle": "20%"
            , "quantity": 1
            , "price": 30
            , "currency": "USD"
        });
    }
    else if (payload == 5) {
        messageData.attachment.payload.elements.push({
            "title": "Irving hill top"
            , "image_url": "https://firebasestorage.googleapis.com/v0/b/ptstar-cfcbc.appspot.com/o/images%2Fbar.png?alt=media&token=d4b0fea9-49d8-4553-8152-a8b3096ff8c2"
            , "subtitle": "5 Dollar Dscount"
            , "quantity": 1
            , "price": 10
            , "currency": "USD"
        });
    }
    sendTemplateMsg(sender, messageData);
}
// ----------------------------------------------------------------------------
// Messenger API specific code
// See the Send API reference
// https://developers.facebook.com/docs/messenger-platform/send-api-reference
const fbMessage = (id, text) => {
    const body = JSON.stringify({
        recipient: {
            id
        }
        , message: {
            text
        }
    , });
    const qs = 'access_token=' + encodeURIComponent(FB_PAGE_TOKEN);
    return fetch('https://graph.facebook.com/me/messages?' + qs, {
        method: 'POST'
        , headers: {
            'Content-Type': 'application/json'
        }
        , body
    , }).then(rsp => rsp.json()).then(json => {
        if (json.error && json.error.message) {
            throw new Error(json.error.message);
        }
        return json;
    });
};

function sendGreeting(sender) {
    console.log('Greeting');
    const qs = 'access_token=' + encodeURIComponent(FB_PAGE_TOKEN);
    return fetch('https://graph.facebook.com/v2.6/' + sender + '?fields=first_name,last_name,profile_pic,locale,timezone,gender&' + qs, {
        method: 'GET'
        , headers: {
            'Content-Type': 'application/json'
        }
    , }).then(rsp => rsp.json()).then(json => {
        if (json.error && json.error.message) {
            throw new Error(json.error.message);
        }
        console.log(json);
        //return json;
        return fbMessage(sender, 'Hi ' + json.first_name + ", are you looking for any deals? I do have some good deals for you. please tell me your location.");
    });
}

function returnDeal(sender, location){
  var grouponUrl = "http://partner-api.groupon.com/deals.json?tsToken=US_AFF_0_203644_212556_0&filters=category:food-and-drink&limit=5&offset=0&division_id=";
  var divId = location;
  JSONP(grouponUrl + divId,function(data){
          // You can process streamed parts here...
          console.log('groupon api call success length' + data.deals.length);
          var len = data.deals.length;
          var elements = []
          for (var i = 0; i < len; i++) {
              var venueLocation = data.deals[i].options[0].redemptionLocations[0];
              //this line filters out deals that don't have a physical location to redeem
              if (data.deals[i].options[0].redemptionLocations[0] === undefined) continue;
              var venueName = data.deals[i].merchant.name;
              var venueLat = venueLocation.lat
                  , venueLon = venueLocation.lng
                  , gLink = data.deals[i].dealUrl
                  , gImg = data.deals[i].mediumImageUrl
                  , blurb = data.deals[i].pitchHtml
                  , address = venueLocation.streetAddress1
                  , city = venueLocation.city
                  , state = venueLocation.state
                  , zip = venueLocation.postalCode
                  , shortBlurb = data.deals[i].announcementTitle
                  , tags = data.deals[i].tags,
                  dealURL = data.deals[i].dealUrl;
              // Some venues have a Yelp rating included. If there is no rating,
              //function will stop running because the variable is undefined.
              //This if statement handles that scenario by setting rating to an empty string.
              var rating;
              if ((data.deals[i].merchant.ratings == null) || data.deals[i].merchant.ratings[0] === undefined) {
                  rating = '';
              }
              else {
                  var num = data.deals[i].merchant.ratings[0].rating;
                  var decimal = num.toFixed(1);
                  rating = decimal;
              }
              var tmp = {
                  "title": venueName
                  , "image_url": gImg
                  , "subtitle": shortBlurb
                  , "buttons": [
                      {
                          "title": "View"
                          , "type": "web_url"
                          ,  "url": dealURL
                      , }
                  ]
              }
              elements.push(tmp);
          }
          messageData = {
              "attachment": {
                  "type": "template"
                  , "payload": {
                      "template_type": "list"
                      , "top_element_style": "large"
                      , "elements": elements
                      , "buttons": [
                          {
                              "title": "View More"
                              , "type": "web_url"
                              , "url": "http://meibangonline.net:8080/dealmoon/#/"+ location
              }
          ]
                  }
              }
          }
          sendTemplateMsg(sender, messageData);
      });
}



function returnlocDeal(sender, lat,long){
  var grouponUrl = "https://partner-api.groupon.com/deals.json?tsToken=US_AFF_0_201236_212556_0&lat="+lat+"&lng="+ long +"&offset=0&limit=5";
  var divId = location;
  JSONP(grouponUrl + divId,function(data){
          // You can process streamed parts here...
          console.log('groupon api call success length' + data.deals.length);
          var len = data.deals.length;
          var elements = []
          for (var i = 0; i < len; i++) {
              var venueLocation = data.deals[i].options[0].redemptionLocations[0];
              //this line filters out deals that don't have a physical location to redeem
              if (data.deals[i].options[0].redemptionLocations[0] === undefined) continue;
              var venueName = data.deals[i].merchant.name;
              var venueLat = venueLocation.lat
                  , venueLon = venueLocation.lng
                  , gLink = data.deals[i].dealUrl
                  , gImg = data.deals[i].mediumImageUrl
                  , blurb = data.deals[i].pitchHtml
                  , address = venueLocation.streetAddress1
                  , city = venueLocation.city
                  , state = venueLocation.state
                  , zip = venueLocation.postalCode
                  , shortBlurb = data.deals[i].announcementTitle
                  , tags = data.deals[i].tags,
                  dealURL = data.deals[i].dealUrl;
              // Some venues have a Yelp rating included. If there is no rating,
              //function will stop running because the variable is undefined.
              //This if statement handles that scenario by setting rating to an empty string.
              var rating;
              if ((data.deals[i].merchant.ratings == null) || data.deals[i].merchant.ratings[0] === undefined) {
                  rating = '';
              }
              else {
                  var num = data.deals[i].merchant.ratings[0].rating;
                  var decimal = num.toFixed(1);
                  rating = decimal;
              }
              var tmp = {
                  "title": venueName
                  , "image_url": gImg
                  , "subtitle": shortBlurb
                  , "buttons": [
                      {
                          "title": "View"
                          , "type": "web_url"
                          ,  "url": dealURL
                      , }
                  ]
              }
              elements.push(tmp);
          }
          messageData = {
              "attachment": {
                  "type": "template"
                  , "payload": {
                      "template_type": "list"
                      , "top_element_style": "large"
                      , "elements": elements
                      , "buttons": [
                          {
                              "title": "View More"
                              , "type": "web_url"
                              , "url": "http://meibangonline.net:8080/dealmoon/#/"+ location
                              //,"url": "http:www.baidu.com/dealmoon/"+ location
              }
          ]
                  }
              }
          }
          sendTemplateMsg(sender, messageData);
      });
}

function sendGenericMessage(sender, location) {

  var divisionUrl = "https://partner-api.groupon.com/division.json";

  JSONP(divisionUrl,function(data){
        var notFound = true;
        for(var i = 0; i < data.divisions.length; i++)
        {
          if(location == data.divisions[i].name){
            notFound = false;
            returnDeal(sender,data.divisions[i].id);
          }
        }

        if(notFound)
        {
          fbMessage(sender, "I don't find any deals for this location. Please try another location.");
        }
      });
}

function sendlatlongDeal(sender, lat, long) {

  var divisionUrl = "https://partner-api.groupon.com/deals.json?tsToken=US_AFF_0_201236_212556_0&lat="+lat+"&lng="+ long +"&offset=0&limit=3";

  JSONP(divisionUrl,function(data){
          // You can process streamed parts here...
          console.log('groupon api call success length' + data.deals.length);
          var len = data.deals.length;
          var elements = []
          for (var i = 0; i < len; i++) {
              var venueLocation = data.deals[i].options[0].redemptionLocations[0];
              //this line filters out deals that don't have a physical location to redeem
              if (data.deals[i].options[0].redemptionLocations[0] === undefined) continue;
              var venueName = data.deals[i].merchant.name;
              var venueLat = venueLocation.lat
                  , venueLon = venueLocation.lng
                  , gLink = data.deals[i].dealUrl
                  , gImg = data.deals[i].mediumImageUrl
                  , blurb = data.deals[i].pitchHtml
                  , address = venueLocation.streetAddress1
                  , city = venueLocation.city
                  , state = venueLocation.state
                  , zip = venueLocation.postalCode
                  , shortBlurb = data.deals[i].announcementTitle
                  , tags = data.deals[i].tags,
                  dealURL = data.deals[i].dealUrl;
              // Some venues have a Yelp rating included. If there is no rating,
              //function will stop running because the variable is undefined.
              //This if statement handles that scenario by setting rating to an empty string.
              var rating;
              if ((data.deals[i].merchant.ratings == null) || data.deals[i].merchant.ratings[0] === undefined) {
                  rating = '';
              }
              else {
                  var num = data.deals[i].merchant.ratings[0].rating;
                  var decimal = num.toFixed(1);
                  rating = decimal;
              }
              var tmp = {
                  "title": venueName
                  , "image_url": gImg
                  , "subtitle": shortBlurb
                  , "buttons": [
                      {
                          "title": "View"
                          , "type": "web_url"
                          ,  "url": dealURL
                      , }
                  ]
              }
              elements.push(tmp);
          }
          messageData = {
              "attachment": {
                  "type": "template"
                  , "payload": {
                      "template_type": "list"
                      , "top_element_style": "large"
                      , "elements": elements
                      , "buttons": [
                          {
                              "title": "View More"
                              , "type": "web_url"
                              , "url": "http://meibangonline.net:8080/dealmoon/#/"+ lat +"/" + long
                              //, "url": "https://paperless-lanvera.herokuapp.com/"+ lat +"/" + long
              }
          ]
                  }
              }
          }
          sendTemplateMsg(sender, messageData);
      });
}

function sendTemplateMsg(sender, messageData) {
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages'
        , qs: {
            access_token: encodeURIComponent(FB_PAGE_TOKEN)
        }
        , method: 'POST'
        , "setting_type": "domain_whitelisting"
        , "whitelisted_domains": ["https://paperless-lanvera.herokuapp.com/", "https://firebasestorage.googleapis.com/","http://meibangonline.net:8080"]
        , "domain_action_type": "add"
        , json: {
            recipient: {
                id: sender
            }
            , message: messageData
        , }
    }, function (error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        }
        else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}
// ----------------------------------------------------------------------------
// Wit.ai bot specific code
// This will contain all user sessions.
// Each session has an entry:
// sessionId -> {fbid: facebookUserId, context: sessionState}
const sessions = {};
const findOrCreateSession = (fbid) => {
    let sessionId;
    // Let's see if we already have a session for the user fbid
    Object.keys(sessions).forEach(k => {
        if (sessions[k].fbid === fbid) {
            // Yep, got it!
            sessionId = k;
        }
    });
    if (!sessionId) {
        // No session found for user fbid, let's create a new one
        sessionId = new Date().toISOString();
        sessions[sessionId] = {
            fbid: fbid
            , context: {}
        };
    }
    return sessionId;
};
const firstEntityValue = (entities, entity) => {
    const val = entities && entities[entity] && Array.isArray(entities[entity]) && entities[entity].length > 0 && entities[entity][0].value;
    if (!val) {
        return null;
    }
    return typeof val === 'object' ? val.value : val;
};
// Our bot actions
const actions = {
    send({
            sessionId
        }, {
            text
        }) {
            // Our bot has something to say!
            // Let's retrieve the Facebook user whose session belongs to
            const recipientId = sessions[sessionId].fbid;
            if (recipientId) {
                // Yay, we found our recipient!
                // Let's forward our bot response to her.
                // We return a promise to let our bot know when we're done sending
                return fbMessage(recipientId, text).then(() => null).catch((err) => {
                    console.error('Oops! An error occurred while forwarding the response to', recipientId, ':', err.stack || err);
                });
            }
            else {
                console.error('Oops! Couldn\'t find user for session:', sessionId);
                // Giving the wheel back to our bot
                return Promise.resolve()
            }
        }, // You should implement your custom actions here
        // See https://wit.ai/docs/quickstart
        sendLocalDeal({
            sessionId, context, entities
        }) {
            console.log('sending...' + JSON.stringify(entities));
            const recipientId = sessions[sessionId].fbid;
            var location = firstEntityValue(entities, 'location');
            console.log('sending...' + location);
            if (location) {
                sendGenericMessage(recipientId, location);
                delete context.missingLocation;
            }
            else {
                var local = firstEntityValue(entities, 'local_search_query');
                if (local) {
                    sendGenericMessage(recipientId, local);
                    delete context.missingLocation;
                }
                else {
                    context.missingLocation = true;
                    delete context.forecast;
                }
            }
            return context;
        }, // See https://wit.ai/docs/quickstart
        sayhi({
            sessionId, context, entities
        }) {
            console.log('say hi' + JSON.stringify(entities));
            const recipientId = sessions[sessionId].fbid;
            console.log('say hi' + recipientId);
            sendGreeting(recipientId);
            context.missingLocation;
            return context;
        }, querylocation({
            sessionId, context, entities
        }) {
            console.log('sending...' + JSON.stringify(entities));
            const recipientId = sessions[sessionId].fbid;
            var location = firstEntityValue(entities, 'location');
            console.log('sending...' + location);
            if (location) {
                sendGenericMessage(recipientId, location);
                delete context.missingLocation;
            }
            else {
                context.missingLocation = true;
                delete context.forecast;
            }
            return context;
        }, sendevents({
            sessionId, context, entities
        }) {
            console.log('sending...' + JSON.stringify(entities));
            const recipientId = sessions[sessionId].fbid;
            var location = firstEntityValue(entities, 'location');
            console.log('sending...' + location);
            if (location) {
                sendGenericMessage(recipientId, location);
                delete context.missingLocation;
            }
            else {
                context.missingLocation = true;
                delete context.forecast;
            }
            return context;
        }
, };
// Setting up our bot
const wit = new Wit({
    accessToken: WIT_TOKEN
    , actions
    , logger: new log.Logger(log.INFO)
});
// Starting our webserver and putting it all together
const app = express();
app.use(({
    method, url
}, rsp, next) => {
    rsp.on('finish', () => {
        console.log(`${rsp.statusCode} ${method} ${url}`);
    });
    next();
});
app.use(bodyParser.json({
    verify: verifyRequestSignature
}));
// Webhook setup
app.get('/webhook', (req, res) => {
    if (req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === FB_VERIFY_TOKEN) {
        res.send(req.query['hub.challenge']);
    }
    else {
        res.sendStatus(400);
    }
});
// Message handler
app.post('/webhook', (req, res) => {
    // Parse the Messenger payload
    // See the Webhook reference
    // https://developers.facebook.com/docs/messenger-platform/webhook-reference
    const data = req.body;
    if (data.object === 'page') {
        data.entry.forEach(entry => {
            entry.messaging.forEach(event => {
                if (event.message && !event.message.is_echo) {
                    // Yay! We got a new message!
                    // We retrieve the Facebook user ID of the sender
                    const sender = event.sender.id;
                    // We retrieve the user's current session, or create one if it doesn't exist
                    // This is needed for our bot to figure out the conversation history
                    const sessionId = findOrCreateSession(sender);
                    // We retrieve the message content
                    const {
                        text, attachments
                    } = event.message;
                    if (attachments) {
                        console.log(attachments[0].payload.coordinates.lat); //gives you lat
                        console.log(attachments[0].payload.coordinates.long); // gives you long
                        // We received an attachment
                        // Let's reply with an automatic message
                        //fbMessage(sender, 'Sorry I can only process text messages for now.').catch(console.error);

                        sendlatlongDeal(sender, attachments[0].payload.coordinates.lat, attachments[0].payload.coordinates.long );
                    }
                    else if (text) {
                        // We received a text message
                        // Let's forward the message to the Wit.ai Bot Engine
                        // This will run all actions until our bot has nothing left to do
                        wit.runActions(sessionId, // the user's current session
                            text, // the user's message
                            sessions[sessionId].context // the user's current session state
                        ).then((context) => {
                            // Our bot did everything it has to do.
                            // Now it's waiting for further messages to proceed.
                            console.log('Waiting for next user messages');
                            //sendGenericMessage(sender);
                            // Based on the session state, you might want to reset the session.
                            // This depends heavily on the business logic of your bot.
                            // Example:
                            // if (context['done']) {
                            //   delete sessions[sessionId];
                            // }
                            // Updating the user's current session state
                            sessions[sessionId].context = context;
                        }).catch((err) => {
                            console.error('Oops! Got an error from Wit: ', err.stack || err);
                        })
                    }
                }
                else if (event.postback) {
                    console.log('this is event postback');
                    receivedPostback(event);
                }
                else {
                    console.log('received event', JSON.stringify(event));
                }
            });
        });
    }
    res.sendStatus(200);
});
/*
 * Verify that the callback came from Facebook. Using the App Secret from
 * the App Dashboard, we can verify the signature that is sent with each
 * callback in the x-hub-signature field, located in the header.
 *
 * https://developers.facebook.com/docs/graph-api/webhooks#setup
 *
 */
function verifyRequestSignature(req, res, buf) {
    var signature = req.headers["x-hub-signature"];
    if (!signature) {
        // For testing, let's log an error. In production, you should throw an
        // error.
        console.error("Couldn't validate the signature.");
    }
    else {
        var elements = signature.split('=');
        var method = elements[0];
        var signatureHash = elements[1];
        var expectedHash = crypto.createHmac('sha1', FB_APP_SECRET).update(buf).digest('hex');
        if (signatureHash != expectedHash) {
            throw new Error("Couldn't validate the request signature.");
        }
    }
}
app.listen(PORT);
console.log('Listening on :' + PORT + '...');
