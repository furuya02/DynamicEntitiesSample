const Alexa = require('ask-sdk-core');

function isMatch(h, ...intents) {
    return intents.some( intent => {
        if (intent === 'SessionEndedRequest' || intent === 'LaunchRequest') {
            return h.requestEnvelope.request.type === intent;
        }
        if (h.requestEnvelope.request.type === 'IntentRequest') {
            return h.requestEnvelope.request.intent.name === intent
        }
        return false;
    })
}

const LaunchRequestHandler = {
    canHandle(h) {
        return isMatch(h, 'LaunchRequest');
    },
    handle(h) {
        let replaceEntityDirective = {
            type: 'Dialog.UpdateDynamicEntities',
            updateBehavior: 'REPLACE',
            types: [
                {
                    name: 'list_of_flavor',
                    values: [
                        {
                            id: '豚骨',
                            name: {
                                value: '豚骨',
                                synonyms: ['豚骨味']
                            }
                        }
                    ]
                }
            ]
        };

        const speechText = 'ようこそ、クラメソ亭へ。ご注文をどうぞ';
        return h.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .addDirective(replaceEntityDirective)
            .getResponse();
    }
};
const OrderIntentHandler = {
    canHandle(h) {
        return isMatch(h, 'OrderIntent');
    },
    handle(h) {

        let flavor = '';
        const resolutionsPerAuthority = h.requestEnvelope.request.intent.slots.flavor.resolutions.resolutionsPerAuthority;

        resolutionsPerAuthority.forEach( authority => {
            if(flavor === '' && authority.status.code === 'ER_SUCCESS_MATCH') {
                flavor = authority.values[0].value.id;
            }
        })
        
        if (flavor === '') { // ER_SUCCESS_MATCHがない場合
            flavor = h.requestEnvelope.request.intent.slots.flavor;
            return h.responseBuilder
            .speak('すいません、' + flavor.value + 'は、ありません。塩、味噌、醤油からお選び下さい')
            .addElicitSlotDirective("flavor")
            .getResponse();
        }

        return h.responseBuilder
            .speak(flavor + "をご用意致します。")
            .getResponse();
    }
};


const SessionEndedRequestHandler = {
    canHandle(h) {
        return isMatch('SessionEndedRequest')
    },
    handle(h) {
        return h.responseBuilder.getResponse();
    }
};

exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        OrderIntentHandler,
        SessionEndedRequestHandler)
    .lambda();
